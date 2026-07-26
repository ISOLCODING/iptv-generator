const fs = require('fs');
const Antigravity = require('./antigravity');
const channels = require('./channels');

async function run() {
    console.log('[Generator] Starting playlist generation from IPTV-Org API...');
    try {
        // Fetch all Indonesian channels (ID) from iptv-org
        const playlist = await Antigravity.generatePlaylistFromIptvOrg('ID');
        
        const channelCount = playlist.split('#EXTINF').length - 1;
        if (channelCount <= 0) {
            throw new Error("No channels found! Aborting playlist generation to prevent overwriting with an empty playlist.");
        }
        
        fs.writeFileSync('playlist.m3u', playlist);
        console.log(`[Generator] Success! Playlist saved with ${channelCount} channels.`);
    } catch (error) {
        console.error('[Generator] Failed to generate playlist:', error.message);
        process.exit(1);
    }
}

run();
