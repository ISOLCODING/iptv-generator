const express = require('express');
const Antigravity = require('./antigravity');
const channels = require('./channels');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/playlist.m3u', async (req, res) => {
    console.log(`[Server] Received request for playlist from ${req.ip}`);
    
    try {
        const playlist = await Antigravity.generatePlaylist(channels);
        
        res.set({
            'Content-Type': 'text/plain',
            'Content-Disposition': 'inline; filename="playlist.m3u"',
            'Access-Control-Allow-Origin': '*' // Allow CORS for web players
        });
        
        res.send(playlist);
        console.log(`[Server] Served playlist with ${playlist.split('#EXTINF').length - 1} channels.`);
    } catch (error) {
        console.error('[Server] Algorithm failure:', error);
        res.status(500).send('#EXTM3U\n#Server Error: Failed to generate playlist');
    }
});

app.get('/', (req, res) => {
    const protocol = req.headers['x-forwarded-proto'] || req.protocol;
    const host = req.get('host');
    const fullUrl = `${protocol}://${host}`;

    res.send(`
        <h1>Antigravity IPTV Generator</h1>
        <p>Status: Active</p>
        <p>Playlist URL: <a href="/playlist.m3u">${fullUrl}/playlist.m3u</a></p>
    `);
});

app.listen(PORT, () => {
    console.log(`
    =============================================
    |       ANTIGRAVITY IPTV GENERATOR          |
    =============================================
    | Server running on port ${PORT}              |
    =============================================
    `);
});
