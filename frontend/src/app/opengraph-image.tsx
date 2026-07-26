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
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          padding: '100px 120px',
          fontFamily: 'sans-serif',
          background: 'linear-gradient(135deg, #020617 0%, #0f172a 100%)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Abstract Mesh Gradients for Modern Background */}
        <div
          style={{
            position: 'absolute',
            top: '-20%',
            left: '-10%',
            width: '800px',
            height: '800px',
            background: 'radial-gradient(circle, rgba(59,130,246,0.3) 0%, rgba(0,0,0,0) 60%)',
            borderRadius: '50%',
            filter: 'blur(40px)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-20%',
            right: '-10%',
            width: '900px',
            height: '900px',
            background: 'radial-gradient(circle, rgba(168,85,247,0.2) 0%, rgba(0,0,0,0) 60%)',
            borderRadius: '50%',
            filter: 'blur(60px)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: '20%',
            right: '20%',
            width: '400px',
            height: '400px',
            background: 'radial-gradient(circle, rgba(236,72,153,0.15) 0%, rgba(0,0,0,0) 60%)',
            borderRadius: '50%',
            filter: 'blur(30px)',
          }}
        />

        {/* Glassmorphism Card Container */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '2px solid rgba(255, 255, 255, 0.05)',
            borderRadius: '40px',
            padding: '60px',
            width: '100%',
            boxShadow: '0 30px 60px rgba(0,0,0,0.4)',
            zIndex: 10,
          }}
        >
          {/* Header with BoxIcon */}
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '30px' }}>
            <div
              style={{
                background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                borderRadius: '24px',
                padding: '16px',
                display: 'flex',
                marginRight: '24px',
                boxShadow: '0 10px 25px rgba(59, 130, 246, 0.5)',
              }}
            >
              {/* BoxIcons: bx-tv */}
              <svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 24 24" fill="white">
                <path d="M21 7h-6.586l3.293-3.293-1.414-1.414L12 6.586 7.707 2.293 6.293 3.707 9.586 7H3c-1.103 0-2 .897-2 2v10c0 1.103.897 2 2 2h18c1.103 0 2-.897 2-2V9c0-1.103-.897-2-2-2zm0 12H3V9h18v10z"></path>
              </svg>
            </div>
            <h1
              style={{
                fontSize: '64px',
                fontWeight: 900,
                letterSpacing: '-0.03em',
                margin: 0,
                color: 'white',
                display: 'flex',
              }}
            >
              NobarTV<span style={{ color: '#ef4444', marginLeft: '5px' }}>PRO</span>
            </h1>
          </div>

          <h2
            style={{
              fontSize: '46px',
              fontWeight: 800,
              margin: '0 0 20px 0',
              color: '#f8fafc',
              lineHeight: 1.2,
              letterSpacing: '-0.02em',
            }}
          >
            Streaming TV & Sepakbola Gratis
          </h2>
          
          <p
            style={{
              fontSize: '28px',
              fontWeight: 500,
              color: '#94a3b8',
              margin: 0,
              lineHeight: 1.4,
              maxWidth: '85%',
            }}
          >
            Nikmati ratusan channel lokal, internasional, dan tayangan olahraga kualitas HD langsung dari browser Anda.
          </p>

          {/* Badges */}
          <div style={{ display: 'flex', gap: '16px', marginTop: '40px' }}>
            <div style={{ background: 'rgba(59, 130, 246, 0.15)', padding: '12px 28px', borderRadius: '100px', border: '1px solid rgba(59, 130, 246, 0.3)', fontSize: '20px', fontWeight: 700, color: '#60a5fa', display: 'flex', alignItems: 'center' }}>
              <span style={{ marginRight: '10px' }}>⚡</span> 4K / HD
            </div>
            <div style={{ background: 'rgba(239, 68, 68, 0.15)', padding: '12px 28px', borderRadius: '100px', border: '1px solid rgba(239, 68, 68, 0.3)', fontSize: '20px', fontWeight: 700, color: '#f87171', display: 'flex', alignItems: 'center' }}>
              <span style={{ marginRight: '10px' }}>🔴</span> LIVE 24/7
            </div>
            <div style={{ background: 'rgba(16, 185, 129, 0.15)', padding: '12px 28px', borderRadius: '100px', border: '1px solid rgba(16, 185, 129, 0.3)', fontSize: '20px', fontWeight: 700, color: '#34d399', display: 'flex', alignItems: 'center' }}>
              <span style={{ marginRight: '10px' }}>🛡️</span> Anti Buffering
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
