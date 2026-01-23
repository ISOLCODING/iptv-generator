const fs = require('fs');
const Antigravity = require('./antigravity');
const channels = require('./channels');

async function run() {
    console.log('[Generator] Starting playlist generation from IPTV-Org API...');
    try {
        // Fetch all Indonesian channels (ID) from iptv-org
        const playlist = await Antigravity.generatePlaylistFromIptvOrg('ID');
        fs.writeFileSync('playlist.m3u', playlist);
        console.log(`[Generator] Success! Playlist saved with ${playlist.split('#EXTINF').length - 1} channels.`);
    } catch (error) {
        console.error('[Generator] Failed to generate playlist:', error);
        process.exit(1);
    }
}

run();
