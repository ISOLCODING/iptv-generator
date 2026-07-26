import { ImageResponse } from 'next/og';

export const runtime = 'edge';

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
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '80px',
          fontFamily: 'sans-serif',
          background: 'linear-gradient(to bottom right, #020617, #0f172a)',
          position: 'relative',
          overflow: 'hidden',
          color: 'white',
        }}
      >
        {/* Background Geometric Accents (Satori Safe - No Blur) */}
        <div
          style={{
            position: 'absolute',
            top: '-20%',
            right: '-10%',
            width: '800px',
            height: '800px',
            background: 'linear-gradient(to bottom right, rgba(59, 130, 246, 0.1), rgba(168, 85, 247, 0.1))',
            borderRadius: '50%',
            zIndex: 0,
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-40%',
            left: '-10%',
            width: '1000px',
            height: '1000px',
            background: 'linear-gradient(to top right, rgba(16, 185, 129, 0.05), rgba(59, 130, 246, 0.05))',
            borderRadius: '50%',
            zIndex: 0,
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            width: '500px',
            background: 'linear-gradient(to right, rgba(0,0,0,0), rgba(59,130,246,0.15))',
            zIndex: 0,
          }}
        />

        {/* Left Content Column */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            width: '65%',
            zIndex: 10,
          }}
        >
          {/* Brand Header */}
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '32px' }}>
            <div
              style={{
                background: 'linear-gradient(to bottom right, #3b82f6, #2563eb)',
                borderRadius: '16px',
                padding: '12px',
                display: 'flex',
                marginRight: '20px',
                border: '2px solid rgba(255,255,255,0.1)',
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="white">
                <path d="M21 7h-6.586l3.293-3.293-1.414-1.414L12 6.586 7.707 2.293 6.293 3.707 9.586 7H3c-1.103 0-2 .897-2 2v10c0 1.103.897 2 2 2h18c1.103 0 2-.897 2-2V9c0-1.103-.897-2-2-2zm0 12H3V9h18v10z"></path>
              </svg>
            </div>
            <h1
              style={{
                fontSize: '56px',
                fontWeight: 900,
                letterSpacing: '-0.02em',
                margin: 0,
                display: 'flex',
              }}
            >
              NobarTV<span style={{ color: '#ef4444', marginLeft: '4px' }}>PRO</span>
            </h1>
          </div>

          {/* Main Title */}
          <h2
            style={{
              fontSize: '56px',
              fontWeight: 800,
              margin: '0 0 24px 0',
              lineHeight: 1.1,
              letterSpacing: '-0.03em',
              color: '#f8fafc',
            }}
          >
            Nonton TV Dimana Aja,<br /> Kapan Aja, Gratis
          </h2>
          
          {/* Description */}
          <p
            style={{
              fontSize: '28px',
              fontWeight: 500,
              color: '#94a3b8',
              margin: '0 0 40px 0',
              lineHeight: 1.4,
              maxWidth: '90%',
            }}
          >
            Nikmati akses streaming berbagai tayangan hiburan favorit secara langsung dari browser Anda tanpa biaya langganan.
          </p>

          {/* Badges Container */}
          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ background: '#1e293b', padding: '12px 24px', borderRadius: '12px', border: '1px solid #334155', fontSize: '20px', fontWeight: 700, color: '#f8fafc', display: 'flex', alignItems: 'center' }}>
              <span style={{ color: '#f87171', marginRight: '8px' }}>●</span> LIVE 24/7
            </div>
            <div style={{ background: '#1e293b', padding: '12px 24px', borderRadius: '12px', border: '1px solid #334155', fontSize: '20px', fontWeight: 700, color: '#f8fafc', display: 'flex', alignItems: 'center' }}>
              <span style={{ color: '#60a5fa', marginRight: '8px' }}>⚡</span> Kualitas HD
            </div>
            <div style={{ background: '#1e293b', padding: '12px 24px', borderRadius: '12px', border: '1px solid #334155', fontSize: '20px', fontWeight: 700, color: '#f8fafc', display: 'flex', alignItems: 'center' }}>
              <span style={{ color: '#34d399', marginRight: '8px' }}>🛡️</span> Anti Buffer
            </div>
          </div>
        </div>

        {/* Right Column Abstract UI Mockup (Satori Safe) */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            width: '30%',
            height: '100%',
            zIndex: 10,
            paddingTop: '20px',
            alignItems: 'flex-end',
          }}
        >
          {/* Mockup Card 1 */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              background: '#0f172a',
              border: '2px solid #1e293b',
              borderRadius: '24px',
              width: '100%',
              height: '180px',
              marginBottom: '24px',
              padding: '24px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ width: '48px', height: '48px', background: '#3b82f6', borderRadius: '12px', marginRight: '16px' }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ width: '120px', height: '16px', background: '#334155', borderRadius: '4px' }} />
                <div style={{ width: '80px', height: '12px', background: '#1e293b', borderRadius: '4px' }} />
              </div>
            </div>
            <div style={{ width: '100%', height: '8px', background: '#1e293b', borderRadius: '4px', marginBottom: '8px' }} />
            <div style={{ width: '70%', height: '8px', background: '#1e293b', borderRadius: '4px' }} />
          </div>

          {/* Mockup Card 2 */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              background: '#0f172a',
              border: '2px solid #1e293b',
              borderRadius: '24px',
              width: '90%',
              height: '180px',
              padding: '24px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
              opacity: 0.7,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ width: '48px', height: '48px', background: '#ef4444', borderRadius: '12px', marginRight: '16px' }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ width: '100px', height: '16px', background: '#334155', borderRadius: '4px' }} />
                <div style={{ width: '60px', height: '12px', background: '#1e293b', borderRadius: '4px' }} />
              </div>
            </div>
            <div style={{ width: '100%', height: '8px', background: '#1e293b', borderRadius: '4px', marginBottom: '8px' }} />
            <div style={{ width: '85%', height: '8px', background: '#1e293b', borderRadius: '4px' }} />
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
