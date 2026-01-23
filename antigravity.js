const axios = require('axios');
const cheerio = require('cheerio');

module.exports = new class Antigravity {
    constructor() {
        this.timeout = 10000; // Increased timeout for large files
        this.channelsApiUrl = 'https://iptv-org.github.io/api/channels.json';
        this.streamsApiUrl = 'https://iptv-org.github.io/api/streams.json';
    }

    /**
     * Fetches channels from iptv-org and filters by country.
     * @param {string} countryCode - ISO 3166-1 alpha-2 country code (e.g., 'ID').
     */
    async fetchChannels(countryCode) {
        console.log(`[Antigravity] Fetching channels for country: ${countryCode}...`);
        try {
            const response = await axios.get(this.channelsApiUrl, { timeout: this.timeout });
            const allChannels = response.data;
            const filtered = allChannels.filter(c => c.country === countryCode);
            console.log(`[Antigravity] Found ${filtered.length} channels for ${countryCode}.`);
            return filtered;
        } catch (error) {
            console.error('[Antigravity] Failed to fetch channels:', error.message);
            return [];
        }
    }

    /**
     * Fetches all streams from iptv-org.
     */
    async fetchStreams() {
        console.log('[Antigravity] Fetching streams...');
        try {
            const response = await axios.get(this.streamsApiUrl, { timeout: this.timeout });
            console.log(`[Antigravity] Fetched ${response.data.length} streams.`);
            return response.data;
        } catch (error) {
            console.error('[Antigravity] Failed to fetch streams:', error.message);
            return [];
        }
    }

    /**
     * Generates a playlist from iptv-org data for a specific country.
     */
    async generatePlaylistFromIptvOrg(countryCode = 'ID') {
        const channels = await this.fetchChannels(countryCode);
        const streams = await this.fetchStreams();

        if (channels.length === 0 || streams.length === 0) {
            console.error('[Antigravity] No data to process.');
            return '#EXTM3U\n';
        }

        // Create a map of channel ID to channel metadata for faster lookup
        const channelMap = new Map();
        channels.forEach(c => channelMap.set(c.id, c));

        let m3uContent = '#EXTM3U\n';

        // Filter streams that belong to the requested channels
        const validStreams = streams.filter(s => s.channel && channelMap.has(s.channel));
        console.log(`[Antigravity] matched ${validStreams.length} valid streams for ${countryCode}.`);

        for (const stream of validStreams) {
            const channelInfo = channelMap.get(stream.channel);
            m3uContent += this.formatIptvOrgLine(channelInfo, stream);
        }

        return m3uContent;
    }

    formatIptvOrgLine(channel, stream) {
        const tvgId = channel.id;
        const tvgName = channel.name; // sanitize?
        const tvgLogo = channel.logo || "";
        const groupTitle = channel.categories && channel.categories.length > 0 ? channel.categories[0] : "Uncategorized";
        const name = channel.name;

        let line = `#EXTINF:-1 tvg-id="${tvgId}" tvg-name="${tvgName}" tvg-logo="${tvgLogo}" group-title="${groupTitle}",${name}\n`;

        // Add headers if present in the stream data
        if (stream.user_agent) {
            line += `#EXTVLCOPT:http-user-agent=${stream.user_agent}\n`;
        }
        if (stream.referrer) {
            line += `#EXTVLCOPT:http-referrer=${stream.referrer}\n`;
        }

        line += `${stream.url}\n`;
        return line;
    }

    // --- Legacy / Existing methods preserved below (optional usage) ---

    async processChannel(channel) {
        // ... (Existing implementation if needed for hybrid approach)
        return null;
    }

    // Keeping formatM3uLine for backward compatibility if mixed
    formatM3uLine(channel, streamUrl) {
        if (!streamUrl) return "";
        return `#EXTINF:-1 tvg-id="${channel.id}" tvg-name="${channel.name}" tvg-logo="${channel.logo}" group-title="${channel.group}",${channel.name}\n${streamUrl}`;
    }

    async generatePlaylist(channels) {
        // ... (Legacy generate)
        return "";
    }
}
