// app/og/politicians/[slug]/route.tsx
import { ImageResponse } from 'next/og';
import type { NextRequest } from 'next/server';

export const runtime = 'edge';
export const contentType = 'image/png';
export const size = { width: 1200, height: 630 };

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const name = searchParams.get('name') ?? 'Unknown Politician';
  const party = searchParams.get('party') ?? 'Independent';
  const state = searchParams.get('state') ?? '';
  const statKey = searchParams.get('statKey') ?? 'Stat';
  const statValue = searchParams.get('statValue') ?? '—';
  const statSuffix = searchParams.get('statSuffix') ?? '';
  const photo = searchParams.get('photo') ?? '';

  const saffron = '#F59E0B';
  const cream = '#F8F6F2';
  const ink = '#0B0E17';
  const purple = '#7C3AED';

  return new ImageResponse(
    (
      <div style={{ width: 1200, height: 630, display: 'flex', background: cream, color: ink, position: 'relative', fontFamily: 'system-ui, Arial, sans-serif' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 10, backgroundColor: saffron }} />
        <div style={{ display: 'flex', gap: 36, padding: '56px 64px', width: '100%', alignItems: 'center' }}>
          <div style={{ width: 260, height: 260, borderRadius: 24, overflow: 'hidden', background: '#EEE', boxShadow: '0 8px 24px rgba(0,0,0,0.08)', border: '1px solid rgba(0,0,0,0.06)' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo || 'https://www.netababu.com/placeholder-avatar.png'}
              alt={name}
              width={260}
              height={260}
              style={{ objectFit: 'cover', width: '100%', height: '100%' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, flex: 1 }}>
            <div style={{ fontSize: 36, fontWeight: 700, lineHeight: 1.15 }}>{name}</div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <div style={{ fontSize: 18, padding: '8px 14px', borderRadius: 999, background: ink, color: cream, fontWeight: 600 }}>{party}</div>
              {state ? <div style={{ fontSize: 18, padding: '8px 14px', borderRadius: 999, background: purple, color: '#fff', fontWeight: 600 }}>{state}</div> : null}
            </div>
            <div style={{ fontSize: 20, opacity: 0.8, marginTop: 4 }}>{statKey}</div>
            <div style={{ fontSize: 96, fontWeight: 800, letterSpacing: -1 }}>
              {statValue}{statSuffix}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{ width: 16, height: 16, borderRadius: 4, background: saffron }} />
                <div style={{ fontSize: 22, fontWeight: 700 }}>Netababu</div>
              </div>
              <div style={{ fontSize: 18, opacity: 0.6 }}>netababu.com</div>
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
