import { NextRequest, NextResponse } from 'next/server';
import Antigravity from '@/lib/antigravity';

// Cache in memory for Vercel (limited lifecycle but helps)
let cachedPlaylist: string | null = null;
let lastFetch = 0;
const TTL = 1000 * 60 * 60; // 1 hour

export async function GET(req: NextRequest) {
    try {
        const now = Date.now();
        const protocol = req.headers.get('x-forwarded-proto') || 'http';
        const host = req.headers.get('host');
        const baseUrl = `${protocol}://${host}`;

        const m3uString = await Antigravity.generatePlaylistFromIptvOrg('ID', baseUrl);
        cachedPlaylist = m3uString;
        lastFetch = now;

        return new NextResponse(m3uString, {
            headers: { 
                'Content-Type': 'audio/x-mpegurl',
                'Access-Control-Allow-Origin': '*'
            }
        });
    } catch (error: any) {
        console.error("[Playlist Error]:", error);
        return NextResponse.json({ error: 'Failed to generate playlist' }, { status: 500 });
    }
}
