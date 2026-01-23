const fs = require('fs');
const Antigravity = require('./antigravity');
const channels = require('./channels');

async function run() {
    console.log('[Generator] Starting playlist generation...');
    try {
        const playlist = await Antigravity.generatePlaylist(channels);
        fs.writeFileSync('playlist.m3u', playlist);
        console.log(`[Generator] Success! Playlist saved with ${playlist.split('#EXTINF').length - 1} channels.`);
    } catch (error) {
        console.error('[Generator] Failed to generate playlist:', error);
        process.exit(1);
    }
}

run();
