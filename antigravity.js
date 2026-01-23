const axios = require('axios');
const cheerio = require('cheerio');

class Antigravity {
    constructor() {
        // Shared session configuration could go here
        this.timeout = 5000;
    }

    /**
     * Main entry point to get a valid stream URL for a channel.
     * @param {Object} channel - The channel configuration object.
     * @returns {Promise<string|null>} - The resolved .m3u8 URL or null.
     */
    async processChannel(channel) {
        console.log(`[Antigravity] Processing: ${channel.name} (${channel.strategy})`);
        
        try {
            switch (channel.strategy) {
                case 'direct':
                    return channel.sourceUrl;
                
                case 'scrape_generic':
                    return await this.scrapeGeneric(channel);
                
                case 'vidio_bypass':
                    return await this.scrapeVidio(channel);
                
                case 'youtube_live':
                     // Placeholder: YouTube Live URL extraction is complex, returning source for now
                     // In a real scenario, you'd use a library like 'ytdl-core' or scrape the m3u8 manifest
                    return this.scrapeGeneric(channel);

                default:
                    return channel.sourceUrl;
            }
        } catch (error) {
            console.error(`[Antigravity] Error processing ${channel.name}:`, error.message);
            return null;
        }
    }

    /**
     * Generic scraper that fetches HTML and looks for a regex match (usually valid for JWPlayer/generic players).
     */
    async scrapeGeneric(channel) {
        try {
            const response = await axios.get(channel.sourceUrl, {
                headers: channel.headers || {},
                timeout: this.timeout
            });

            const html = response.data;
            const match = html.match(channel.regex);

            if (match && match[1]) {
                let streamUrl = match[1];
                // Handle relative URLs if necessary
                if (!streamUrl.startsWith('http')) {
                    // Very basic relative URL handling, might need improvement based on exact site
                    const urlObj = new URL(channel.sourceUrl);
                    streamUrl = urlObj.origin + streamUrl;
                }
                // Unescape JSON slashes if they exist (e.g., http:\/\/...)
                streamUrl = streamUrl.replace(/\\\//g, '/');
                return streamUrl;
            } else {
                console.warn(`[Antigravity] No regex match for ${channel.name}`);
                return null;
            }
        } catch (err) {
            console.error(`[Antigravity] Request failed for ${channel.name}: ${err.message}`);
            return null;
        }
    }

    /**
     * Specialized scraper for Vidio-based embeds (SCTV, Indosiar).
     */
    async scrapeVidio(channel) {
        try {
            const response = await axios.get(channel.sourceUrl, {
                headers: channel.headers || {},
                timeout: this.timeout
            });

            const html = response.data;
            // Vidio often embeds JSON data in script tags
            const match = html.match(channel.regex);

            if (match && match[1]) {
                 let streamUrl = match[1];
                 streamUrl = streamUrl.replace(/\\\//g, '/');
                 return streamUrl;
            }
            return null;
        } catch (err) {
             console.error(`[Antigravity] Vidio scrape failed for ${channel.name}: ${err.message}`);
             return null;
        }
    }

    /**
     * Generates the #EXTINF line for the playlist.
     */
    formatM3uLine(channel, streamUrl) {
        if (!streamUrl) return "";
        return `#EXTINF:-1 tvg-id="${channel.id}" tvg-name="${channel.name}" tvg-logo="${channel.logo}" group-title="${channel.group}",${channel.name}\n${streamUrl}`;
    }

    /**
     * Orchestrates the playlist generation.
     */
    async generatePlaylist(channels) {
        const header = "#EXTM3U\n";
        
        // Parallel processing for speed
        // Note: In production, you might want to limit concurrency to avoid IP bans
        const promises = channels.map(async (channel) => {
            const streamUrl = await this.processChannel(channel);
            return this.formatM3uLine(channel, streamUrl);
        });

        const lines = await Promise.all(promises);
        
        // Filter out empty lines (failed channels)
        const validLines = lines.filter(line => line.length > 0);
        
        return header + validLines.join('\n');
    }
}

module.exports = new Antigravity();
