import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { channels } = body; // Array of { id, url, userAgent, referrer }

        if (!channels || !Array.isArray(channels)) {
            return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
        }

        // Process all channels concurrently
        const checkPromises = channels.map(async (channel: any) => {
            const controller = new AbortController();
            // Fast timeout for checking: 2.5 seconds
            const timeoutId = setTimeout(() => controller.abort(), 2500);

            try {
                // Try a fast GET request, we only need headers to know if it's alive
                const res = await fetch(channel.url, {
                    method: 'GET',
                    signal: controller.signal,
                    headers: {
                        'User-Agent': channel.userAgent || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                        ...(channel.referrer ? { 'Referer': channel.referrer } : {})
                    },
                    // Prevent body from being fully downloaded if possible by closing after headers
                });
                
                clearTimeout(timeoutId);

                // If we get any 2xx response, it's alive
                if (res.ok) {
                    return { id: channel.id, status: 'online' };
                } else {
                    return { id: channel.id, status: 'offline' };
                }
            } catch (error) {
                clearTimeout(timeoutId);
                return { id: channel.id, status: 'offline' };
            }
        });

        const results = await Promise.all(checkPromises);
        return NextResponse.json({ results });

    } catch (error) {
        return NextResponse.json({ error: 'Failed to process batch' }, { status: 500 });
    }
}
