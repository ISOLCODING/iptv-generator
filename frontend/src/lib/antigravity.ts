import axios from 'axios';
import manualChannels from './channels';

interface IptvChannel {
    id: string;
    name: string;
    country?: string;
    logo?: string;
    categories?: string[];
}

interface IptvStream {
    channel: string;
    url: string;
    user_agent?: string;
    referrer?: string;
}

interface IptvGuide {
    channel: string;
    lang?: string;
    site?: string;
}

interface IptvLogo {
    channel: string;
    url: string;
}

export class Antigravity {
    private timeout: number = 15000;
    private apiBase: string = 'https://iptv-org.github.io/api';
    private endpoints = {
        channels: `${this.apiBase}/channels.json`,
        streams: `${this.apiBase}/streams.json`,
        guides: `${this.apiBase}/guides.json`,
        logos: `${this.apiBase}/logos.json`
    };

    /**
     * Helper to fetch data with error handling
     */
    async fetchData<T>(url: string, label: string): Promise<T[]> {
        console.log(`[Antigravity] Fetching ${label}...`);
        try {
            const response = await axios.get<T[]>(url, { timeout: this.timeout });
            console.log(`[Antigravity] Fetched ${response.data.length} items from ${label}.`);
            return response.data;
        } catch (error: any) {
            console.error(`[Antigravity] Failed to fetch ${label}:`, error.message);
            return [];
        }
    }

    /**
     * Generates a comprehensive playlist for a specific country.
     */
    async generatePlaylistFromIptvOrg(countryCode: string = 'ID', baseUrl: string = ''): Promise<string> {
        const [allChannels, allStreams, allGuides, allLogos] = await Promise.all([
            this.fetchData<IptvChannel>(this.endpoints.channels, 'Channels'),
            this.fetchData<IptvStream>(this.endpoints.streams, 'Streams'),
            this.fetchData<IptvGuide>(this.endpoints.guides, 'Guides'),
            this.fetchData<IptvLogo>(this.endpoints.logos, 'Logos')
        ]);

        if (!allChannels.length) {
            return '#EXTM3U\n # Error: No channels found.';
        }

        // Filter channels for the specific country
        const idChannels = allChannels.filter(c => c.country === countryCode);
        console.log(`[Antigravity] Filtered ${idChannels.length} channels for country '${countryCode}'.`);

        // Map: Channel ID -> Stream[]
        const streamMap = new Map<string, IptvStream[]>();
        allStreams.forEach(stream => {
            if (!stream.channel) return;
            if (!streamMap.has(stream.channel)) {
                streamMap.set(stream.channel, []);
            }
            streamMap.get(stream.channel)!.push(stream);
        });

        // Map: Channel ID -> Guide (EPG)
        const guideMap = new Map<string, IptvGuide>();
        allGuides.forEach(guide => {
            if (!guide.channel) return;
            // Prefer Indonesian guide if available, or just take the first one found
            if (!guideMap.has(guide.channel) || guide.lang === 'id') {
                guideMap.set(guide.channel, guide);
            }
        });

        // Map: Channel ID -> Logo URL
        const logoMap = new Map<string, string>();
        allLogos.forEach(logo => {
            if (logo.channel) {
                logoMap.set(logo.channel, logo.url);
            }
        });

        let m3u = '#EXTM3U\n';
        let matchCount = 0;
        const processedIds = new Set<string>();

        // 1. Process Manual Channels (Priority)
        console.log(`[Antigravity] Merging ${manualChannels.length} manual channel configs...`);
        for (const manual of manualChannels) {
            if (!manual.sourceUrl) continue;

            const apiChannel = idChannels.find(c => c.id === manual.id) || {};
            const combinedChannel: IptvChannel = {
                id: manual.id,
                name: manual.name,
                logo: manual.logo || (apiChannel as any).logo || "",
                categories: (apiChannel as any).categories || ["General"]
            };

            const streamObj: IptvStream = {
                channel: manual.id,
                url: manual.sourceUrl,
                user_agent: manual.headers ? manual.headers["User-Agent"] : undefined,
                referrer: manual.headers ? manual.headers["Referer"] : undefined
            };

            const guide = guideMap.get(manual.id);
            m3u += this.formatEntry(combinedChannel, streamObj, guide, baseUrl);
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

            // Assign logo from map if not present in channel object
            if (!channel.logo) {
                channel.logo = logoMap.get(channel.id) || "";
            }

            for (const stream of channelStreams) {
                m3u += this.formatEntry(channel, stream, guide, baseUrl);
            }
        }

        console.log(`[Antigravity] Generated playlist with ${matchCount} unique channels having streams.`);
        return m3u;
    }

    formatEntry(channel: IptvChannel, stream: IptvStream, guide?: IptvGuide, baseUrl: string = ''): string {
        const tvgId = channel.id;
        const tvgName = channel.name;
        const tvgLogo = channel.logo || "";
        const group = channel.categories && channel.categories.length ? channel.categories[0] : "Uncategorized";

        // Wrap non-proxied URLs in our proxy to avoid CORS issues in browser
        let finalUrl = stream.url;
        if (finalUrl && !finalUrl.startsWith('/api/proxy') && !finalUrl.startsWith('http://localhost') && finalUrl.startsWith('http')) {
             finalUrl = `${baseUrl}/api/proxy?url=${encodeURIComponent(finalUrl)}${stream.user_agent ? `&userAgent=${encodeURIComponent(stream.user_agent)}` : ''}${stream.referrer ? `&referer=${encodeURIComponent(stream.referrer)}` : ''}`;
        } else if (finalUrl && finalUrl.startsWith('/api/proxy')) {
             finalUrl = `${baseUrl}${finalUrl}`;
        }

        // Construct the EXTINF line
        let infoLine = `#EXTINF:-1 tvg-id="${tvgId}" tvg-name="${tvgName}" tvg-logo="${tvgLogo}" group-title="${group}"`;
        infoLine += `,${channel.name}`;

        return `${infoLine}\n${finalUrl}\n`;
    }
}

export default new Antigravity();
