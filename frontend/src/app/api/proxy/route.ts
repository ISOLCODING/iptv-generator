import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const url = searchParams.get('url');
    const referer = searchParams.get('referer');
    const userAgent = searchParams.get('userAgent');

    if (!url) {
        return NextResponse.json({ error: 'Missing url' }, { status: 400 });
    }

    try {
        const headers: any = {
            'User-Agent': userAgent || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        };
        if (referer) headers['Referer'] = referer;

        const isPlaylist = url.includes('.m3u8') || url.includes('.m3u');

        if (isPlaylist) {
            const response = await axios.get(url, { headers, responseType: 'text', timeout: 10000 });
            let content = response.data;

            const lines = content.split('\n');
            const rewritten = lines.map((line: string) => {
                const trimmed = line.trim();
                if (trimmed && !trimmed.startsWith('#')) {
                    try {
                        const abs = new URL(trimmed, url).href;
                        return `/api/proxy?url=${encodeURIComponent(abs)}${referer ? `&referer=${encodeURIComponent(referer)}` : ''}${userAgent ? `&userAgent=${encodeURIComponent(userAgent)}` : ''}`;
                    } catch (e) {
                        return line;
                    }
                }
                if (trimmed.startsWith('#EXT-X-KEY:') || trimmed.startsWith('#EXT-X-MAP:')) {
                    return line.replace(/URI="([^"]*)"/g, (match, uri) => {
                        try {
                            const abs = new URL(uri, url).href;
                            return `URI="/api/proxy?url=${encodeURIComponent(abs)}${referer ? `&referer=${encodeURIComponent(referer)}` : ''}${userAgent ? `&userAgent=${encodeURIComponent(userAgent)}` : ''}"`;
                        } catch (e) {
                            return match;
                        }
                    });
                }
                return line;
            }).join('\n');

            return new NextResponse(rewritten, {
                headers: {
                    'Content-Type': response.headers['content-type'] || 'application/vnd.apple.mpegurl',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET, OPTIONS',
                    'Access-Control-Allow-Headers': '*'
                }
            });
        } else {
            // Binary data (TS chunks) - Streaming approach using fetch for better compatibility with Next.js Response
            const response = await fetch(url, {
                headers: {
                    ...headers,
                    'Accept': '*/*'
                },
                //@ts-ignore
                cache: 'no-store'
            });

            if (!response.ok) throw new Error(`Fetch failed with status ${response.status}`);

            return new NextResponse(response.body, {
                headers: {
                    'Content-Type': response.headers.get('content-type') || 'video/mp2t',
                    'Access-Control-Allow-Origin': '*',
                    'Cache-Control': 'public, max-age=3600'
                }
            });
        }
    } catch (error: any) {
        console.error(`[Proxy Error] ${url}:`, error.message);
        return NextResponse.json({ error: 'Proxy failed' }, { status: 500 });
    }
}
