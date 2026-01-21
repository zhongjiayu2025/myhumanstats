import { ImageResponse } from 'next/og';
 
export const runtime = 'edge';
 
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const title = searchParams.get('title')?.slice(0, 100) || 'MyHumanStats';
    const subtitle = searchParams.get('subtitle') || 'Quantify Yourself';
    const type = searchParams.get('type') || 'Benchmark';
 
    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            backgroundColor: '#050505',
            backgroundImage: 'radial-gradient(circle at 25px 25px, #27272a 2%, transparent 0%), radial-gradient(circle at 75px 75px, #27272a 2%, transparent 0%)',
            backgroundSize: '100px 100px',
            padding: '80px',
            fontFamily: 'monospace',
          }}
        >
          {/* Top Decorative Line */}
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '4px', background: 'linear-gradient(90deg, #06b6d4, #000)' }} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                color: '#06b6d4',
                fontSize: 24,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
              }}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
              <span>MHS // {type}</span>
            </div>
            
            <div style={{ fontSize: 72, fontWeight: 900, color: 'white', lineHeight: 1.1, textShadow: '0 0 40px rgba(6,182,212,0.3)' }}>
              {title}
            </div>
            
            <div style={{ fontSize: 32, color: '#a1a1aa' }}>
              {subtitle}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'flex-end' }}>
             <div style={{ display: 'flex', gap: '20px', color: '#52525b', fontSize: 20 }}>
               <span>DATA_DRIVEN</span>
               <span>LOCAL_FIRST</span>
               <span>OPEN_SOURCE</span>
             </div>
             <div style={{ color: '#fff', fontSize: 24, fontWeight: 'bold' }}>
               myhumanstats.org
             </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      },
    );
  } catch (e: any) {
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}