const axios = require('axios');
const cheerio = require('cheerio');
const manualChannels = require('./channels');

module.exports = new class Antigravity {
    constructor() {
        this.timeout = 15000;
        // Endpoints
        this.apiBase = 'https://iptv-org.github.io/api';
        this.endpoints = {
            channels: `${this.apiBase}/channels.json`,
            streams: `${this.apiBase}/streams.json`,
            guides: `${this.apiBase}/guides.json`,
            logos: `${this.apiBase}/logos.json`
        };
    }

    /**
     * Helper to fetch data with error handling
     */
    async fetchData(url, label) {
        console.log(`[Antigravity] Fetching ${label}...`);
        try {
            const response = await axios.get(url, { timeout: this.timeout });
            console.log(`[Antigravity] Fetched ${response.data.length} items from ${label}.`);
            return response.data;
        } catch (error) {
            console.error(`[Antigravity] Failed to fetch ${label}:`, error.message);
            return [];
        }
    }

    /**
     * Generates a comprehensive playlist for a specific country.
     */
    async generatePlaylistFromIptvOrg(countryCode = 'ID') {
        const [allChannels, allStreams, allGuides] = await Promise.all([
            this.fetchData(this.endpoints.channels, 'Channels'),
            this.fetchData(this.endpoints.streams, 'Streams'),
            this.fetchData(this.endpoints.guides, 'Guides')
        ]);

        if (!allChannels.length) {
            return '#EXTM3U\n # Error: No channels found.';
        }

        // Filter channels for the specific country
        const idChannels = allChannels.filter(c => c.country === countryCode);
        console.log(`[Antigravity] Filtered ${idChannels.length} channels for country '${countryCode}'.`);

        // Map: Channel ID -> Stream[]
        const streamMap = new Map();
        allStreams.forEach(stream => {
            if (!stream.channel) return;
            if (!streamMap.has(stream.channel)) {
                streamMap.set(stream.channel, []);
            }
            streamMap.get(stream.channel).push(stream);
        });

        // Map: Channel ID -> Guide (EPG)
        const guideMap = new Map();
        allGuides.forEach(guide => {
            if (!guide.channel) return;
            // Prefer Indonesian guide if available, or just take the first one found
            if (!guideMap.has(guide.channel) || guide.lang === 'id') {
                guideMap.set(guide.channel, guide);
            }
        });

        let m3u = '#EXTM3U\n';
        let matchCount = 0;
        const processedIds = new Set();

        // 1. Process Manual Channels (Priority)
        console.log(`[Antigravity] Merging ${manualChannels.length} manual channel configs...`);
        for (const manual of manualChannels) {
            if (!manual.sourceUrl) continue;

            const apiChannel = idChannels.find(c => c.id === manual.id) || {};
            const combinedChannel = {
                id: manual.id,
                name: manual.name,
                logo: manual.logo || apiChannel.logo || "",
                categories: apiChannel.categories || ["General"]
            };

            const streamObj = {
                url: manual.sourceUrl,
                user_agent: manual.headers ? manual.headers["User-Agent"] : undefined,
                referrer: manual.headers ? manual.headers["Referer"] : undefined
            };

            const guide = guideMap.get(manual.id);
            m3u += this.formatEntry(combinedChannel, streamObj, guide);
            processedIds.add(manual.id);
            matchCount++;
        }

        // 2. Process API Channels (long-tail)
        for (const channel of idChannels) {
            if (processedIds.has(channel.id)) continue; // Already added manually

            const channelStreams = streamMap.get(channel.id) || [];

            // Only include channels with streams to ensure the playlist is functional
            if (channelStreams.length === 0) continue;

            matchCount++;
            const guide = guideMap.get(channel.id);

            for (const stream of channelStreams) {
                m3u += this.formatEntry(channel, stream, guide);
            }
        }

        console.log(`[Antigravity] Generated playlist with ${matchCount} unique channels having streams.`);
        return m3u;
    }

    formatEntry(channel, stream, guide) {
        const tvgId = channel.id;
        const tvgName = channel.name;
        const tvgLogo = channel.logo || "";
        const group = channel.categories && channel.categories.length ? channel.categories[0] : "Uncategorized";

        // Construct the EXTINF line
        let infoLine = `#EXTINF:-1 tvg-id="${tvgId}" tvg-name="${tvgName}" tvg-logo="${tvgLogo}" group-title="${group}"`;

        infoLine += `,${channel.name}`;

        // Add User-Agent and Referrer headers if present
        let headers = [];
        if (stream.user_agent) headers.push(`#EXTVLCOPT:http-user-agent=${stream.user_agent}`);
        if (stream.referrer) headers.push(`#EXTVLCOPT:http-referrer=${stream.referrer}`);

        return `${infoLine}\n${headers.join('\n')}${headers.length ? '\n' : ''}${stream.url}\n`;
    }

    // --- Legacy methods kept for compatibility ---
    async fetchChannels(countryCode) { return []; }
    async fetchStreams() { return []; }
    formatIptvOrgLine(channel, stream) { return ""; }
    async processChannel(channel) { return null; }
    formatM3uLine(channel, streamUrl) { return ""; }
    async generatePlaylist(channels) { return ""; }
}
