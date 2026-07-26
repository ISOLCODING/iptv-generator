import { ImageResponse } from 'next/og';

export const runtime = 'edge';

// Image metadata
export const alt = 'NobarTV PRO - Nonton TV Online & Live Streaming Bola';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(to bottom right, #0f172a, #1e3a8a, #000000)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '80px',
          fontFamily: 'sans-serif',
          color: 'white',
          textAlign: 'center',
        }}
      >
        {/* Glow effect background */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '800px',
            height: '400px',
            background: 'radial-gradient(circle, rgba(59,130,246,0.4) 0%, rgba(0,0,0,0) 70%)',
            borderRadius: '50%',
            zIndex: 0,
          }}
        />

        {/* Content */}
        <div style={{ display: 'flex', alignItems: 'center', zIndex: 1, marginBottom: '20px' }}>
          <div
            style={{
              background: '#2563eb',
              borderRadius: '20px',
              padding: '20px',
              display: 'flex',
              marginRight: '20px',
              boxShadow: '0 10px 30px rgba(37, 99, 235, 0.5)',
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect width="20" height="15" x="2" y="7" rx="2" ry="2" />
              <polyline points="17 2 12 7 7 2" />
            </svg>
          </div>
          <h1
            style={{
              fontSize: '80px',
              fontWeight: 900,
              letterSpacing: '-0.05em',
              margin: 0,
              display: 'flex',
            }}
          >
            NobarTV<span style={{ color: '#ef4444' }}>PRO</span>
          </h1>
        </div>

        <h2
          style={{
            fontSize: '48px',
            fontWeight: 700,
            margin: '20px 0',
            zIndex: 1,
            color: '#f8fafc',
            lineHeight: 1.2,
          }}
        >
          TV Online & Live Streaming Sepakbola
        </h2>
        
        <p
          style={{
            fontSize: '32px',
            fontWeight: 500,
            color: '#94a3b8',
            margin: 0,
            zIndex: 1,
            maxWidth: '900px',
          }}
        >
          Nonton RCTI, SCTV, Indosiar, Liga 1, hingga Timnas gratis tanpa buffering. Kualitas Full HD!
        </p>

        {/* Badges */}
        <div style={{ display: 'flex', gap: '20px', marginTop: '50px', zIndex: 1 }}>
          <div style={{ background: 'rgba(255,255,255,0.1)', padding: '10px 30px', borderRadius: '40px', border: '2px solid rgba(255,255,255,0.2)', fontSize: '24px', fontWeight: 'bold' }}>
            🔴 LIVE 24/7
          </div>
          <div style={{ background: 'rgba(255,255,255,0.1)', padding: '10px 30px', borderRadius: '40px', border: '2px solid rgba(255,255,255,0.2)', fontSize: '24px', fontWeight: 'bold', color: '#60a5fa' }}>
            ⚡ 4K / HD
          </div>
          <div style={{ background: 'rgba(255,255,255,0.1)', padding: '10px 30px', borderRadius: '40px', border: '2px solid rgba(255,255,255,0.2)', fontSize: '24px', fontWeight: 'bold', color: '#4ade80' }}>
            🛡️ Anti Buffering
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
