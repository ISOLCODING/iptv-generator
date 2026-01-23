const express = require('express');
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

        // Check for #EXTVLCOPT tags usually stored in title or separate parsing needed
        // Since m3u8-parser might not capture non-standard EXT tags deeply, we manually parse if needed,
        // but for standard EXTINF it works. 
        // Our generator adds headers as comments/tags. Let's do a quick regex fallback if parser misses custom tags.

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

// Endpoint to force refresh
app.post('/api/refresh', async (req, res) => {
    cache.del('playlist_json');
    res.json({ message: 'Cache cleared. Next request will fetch fresh data.' });
});

app.listen(port, () => {
    console.log(`[API] Server running at http://localhost:${port}`);
});
