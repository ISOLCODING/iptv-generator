const express = require('express');
const axios = require('axios');
const cors = require('cors');
const NodeCache = require('node-cache');
const { Parser } = require('m3u8-parser');
const Antigravity = require('./antigravity');

const app = express();
const port = 3000;
const cache = new NodeCache({ stdTTL: 21600 }); // Cache for 6 hours

app.use(cors());

// Convert M3U string to clean JSON object
const parseM3uToJson = (m3uString) => {
    const parser = new Parser();
    parser.push(m3uString);
    parser.end();

    return parser.manifest.segments.map(segment => {
        // Extract vlcopts/headers if any
        let userAgent = null;
        let referrer = null;

        return {
            id: segment.duration || Date.now(), // Fallback ID
            title: segment.title,
            url: segment.uri,
            details: segment.key || {} // Extra metadata
        };
    });
};

// Custom manual parser because m3u8-parser is sometimes strict with non-standard extended M3U
const customParse = (m3u) => {
    const lines = m3u.split('\n');
    const result = [];
    let currentItem = {};

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.startsWith('#EXTINF:')) {
            // Parse Attributes
            const tvgId = line.match(/tvg-id="([^"]*)"/)?.[1];
            const tvgName = line.match(/tvg-name="([^"]*)"/)?.[1];
            const tvgLogo = line.match(/tvg-logo="([^"]*)"/)?.[1];
            const group = line.match(/group-title="([^"]*)"/)?.[1];
            const name = line.split(',').pop();

            currentItem = {
                id: tvgId || `ch-${i}`,
                name: tvgName || name,
                displayName: name,
                logo: tvgLogo,
                group: group || 'Uncategorized',
                headers: {}
            };
        } else if (line.startsWith('#EXTVLCOPT:http-user-agent=')) {
            currentItem.headers = currentItem.headers || {};
            currentItem.headers['User-Agent'] = line.split('=')[1];
        } else if (line.startsWith('#EXTVLCOPT:http-referrer=')) {
            currentItem.headers = currentItem.headers || {};
            currentItem.headers['Referer'] = line.split('=')[1];
        } else if (line && !line.startsWith('#')) {
            // URL line
            if (currentItem.name) {
                currentItem.url = line;
                result.push(currentItem);
                currentItem = {}; // Reset
            }
        }
    }
    return result;
  };

  app.get('/api/playlist', async (req, res) => {
    try {
        const cacheKey = 'playlist_json';
        const cachedData = cache.get(cacheKey);

        if (cachedData) {
            console.log('[Server] Serving cached playlist');
            return res.json(cachedData);
        }

        console.log('[Server] Generating new playlist...');
        const m3uString = await Antigravity.generatePlaylistFromIptvOrg('ID');
        const jsonData = customParse(m3uString);

        cache.set(cacheKey, jsonData);
        res.json(jsonData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to generate playlist' });
    }
  });

  // Serve raw M3U for players that need it directly
  app.get('/playlist.m3u', async (req, res) => {
    try {
        const cacheKey = 'playlist_raw';
        const cachedData = cache.get(cacheKey);

        if (cachedData) {
            console.log('[Server] Serving cached raw playlist');
            res.set('Content-Type', 'audio/x-mpegurl');
            return res.send(cachedData);
        }

        console.log('[Server] Generating new raw playlist...');
        const m3uString = await Antigravity.generatePlaylistFromIptvOrg('ID');
        
        cache.set(cacheKey, m3uString);
        res.set('Content-Type', 'audio/x-mpegurl');
        res.send(m3uString);
    } catch (error) {
        console.error(error);
        res.status(500).send('# Error generating playlist');
    }
  });

  // Endpoint to force refresh
  app.post('/api/refresh', async (req, res) => {
    cache.del('playlist_json');
    cache.del('playlist_raw');
    res.json({ message: 'Cache cleared. Next request will fetch fresh data.' });
  });

// Helper to resolve relative URLs
const resolveUrl = (baseUrl, relativeUrl) => {
    try {
        return new URL(relativeUrl, baseUrl).href;
    } catch (e) {
        return relativeUrl;
    }
};

// Stream Proxy Endpoint
app.get('/api/proxy', async (req, res) => {
    const { url, referer, userAgent } = req.query;

    if (!url) {
        return res.status(400).send('Missing url parameter');
    }

    try {
        const headers = {};
        if (userAgent) headers['User-Agent'] = userAgent;
        if (referer) headers['Referer'] = referer;
        // Add basic headers to look like a browser if not provided
        if (!headers['User-Agent']) headers['User-Agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

        const response = await axios({
            method: 'get',
            url: url,
            headers: headers,
            responseType: 'arraybuffer',
            timeout: 10000 // 10s timeout
        });

        let contentType = response.headers['content-type'] || '';
        
        // Forward CORS
        res.set('Access-Control-Allow-Origin', '*');
        res.set('Content-Type', contentType);

        // Determine if it's a playlist
        const isPlaylist = contentType.includes('mpegurl') || 
                          contentType.includes('x-mpegurl') || 
                          url.includes('.m3u8') || 
                          url.includes('.m3u');

        if (isPlaylist) {
            let content = response.data.toString('utf8');
            const lines = content.split('\n');
            const rewrittenLines = lines.map(line => {
                const trimmed = line.trim();
                if (trimmed && !trimmed.startsWith('#')) {
                    const absoluteUrl = resolveUrl(url, trimmed);
                    // MUST be absolute so browser hits Backend, not Frontend
                    const proxyUrl = `http://localhost:3000/api/proxy?url=${encodeURIComponent(absoluteUrl)}${referer ? `&referer=${encodeURIComponent(referer)}` : ''}${userAgent ? `&userAgent=${encodeURIComponent(userAgent)}` : ''}`;
                    return proxyUrl;
                }
                if (trimmed.startsWith('#EXT-X-KEY:') || trimmed.startsWith('#EXT-X-MAP:')) {
                     return line.replace(/URI="([^"]*)"/, (match, uri) => {
                         const absoluteUrl = resolveUrl(url, uri);
                         const proxyUrl = `http://localhost:3000/api/proxy?url=${encodeURIComponent(absoluteUrl)}${referer ? `&referer=${encodeURIComponent(referer)}` : ''}${userAgent ? `&userAgent=${encodeURIComponent(userAgent)}` : ''}`;
                         return `URI="${proxyUrl}"`;
                     });
                }
                return line;
            });
            return res.send(rewrittenLines.join('\n'));
        }

        // TS or other segments
        res.send(response.data);

    } catch (error) {
        console.error(`[Proxy Error] ${url}:`, error.message);
        res.status(500).send('Proxy Error');
    }
});

  app.listen(port, () => {
    console.log(`[API] Server running at http://localhost:${port}`);
  });
