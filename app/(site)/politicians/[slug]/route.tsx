/* app/og/politician/[slug]/route.tsx */
import { ImageResponse } from 'next/og';
import type { NextRequest } from 'next/server';

// Route segment config
export const runtime = 'edge';
export const alt = 'Netababu Share Image';
export const contentType = 'image/png';
export const size = { width: 1200, height: 630 };

// Optional: pull a brand font
async function loadFont() {
  const res = await fetch(new URL('../../../_assets/Inter-Bold.ttf', import.meta.url));
  return res.arrayBuffer();
}

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  const fontData = await loadFont().catch(() => undefined);

  const { searchParams } = new URL(req.url);
  const slug = params.slug;

  // Incoming query params (encode from your client)
  const name = searchParams.get('name') ?? 'Unknown Politician';
  const party = searchParams.get('party') ?? 'Independent';
  const state = searchParams.get('state') ?? '';
  const statKey = searchParams.get('statKey') ?? 'Attendance';
  const statValue = searchParams.get('statValue') ?? '—';
  const statSuffix = searchParams.get('statSuffix') ?? ''; // e.g., %, ₹, yrs
  const photo = searchParams.get('photo') ?? ''; // absolute https URL preferred

  // Theme
  const saffron = '#F59E0B';
  const cream = '#F8F6F2';
  const ink = '#0B0E17';
  const purple = '#7C3AED';

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          background: cream,
          color: ink,
          fontFamily: 'Inter, system-ui, sans-serif',
          position: 'relative',
        }}
      >
        {/* Top saffron bar */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 10,
            backgroundColor: saffron,
          }}
        />

        {/* Content */}
        <div
          style={{
            display: 'flex',
            gap: 36,
            padding: '56px 64px',
            width: '100%',
            alignItems: 'center',
          }}
        >
          {/* Avatar */}
          <div
            style={{
              width: 260,
              height: 260,
              borderRadius: 24,
              overflow: 'hidden',
              background: '#EEE',
              boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
              border: '1px solid rgba(0,0,0,0.06)',
              flexShrink: 0,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo || 'https://www.netababu.com/placeholder-avatar.png'}
              alt={name}
              width={260}
              height={260}
              style={{ objectFit: 'cover', width: '100%', height: '100%' }}
            />
          </div>

          {/* Right column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, flex: 1 }}>
            {/* Name */}
            <div style={{ fontSize: 36, fontWeight: 700, lineHeight: 1.15 }}>{name}</div>

            {/* Tag pills */}
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <div
                style={{
                  fontSize: 18,
                  padding: '8px 14px',
                  borderRadius: 999,
                  background: ink,
                  color: cream,
                  fontWeight: 600,
                }}
              >
                {party}
              </div>
              {state ? (
                <div
                  style={{
                    fontSize: 18,
                    padding: '8px 14px',
                    borderRadius: 999,
                    background: purple,
                    color: '#fff',
                    fontWeight: 600,
                  }}
                >
                  {state}
                </div>
              ) : null}
            </div>

            {/* Stat label */}
            <div style={{ fontSize: 20, opacity: 0.8, marginTop: 4 }}>{statKey}</div>

            {/* Stat value */}
            <div style={{ fontSize: 96, fontWeight: 800, letterSpacing: -1 }}>
              {statValue}
              {statSuffix}
            </div>

            {/* Footer brand */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: 8,
                alignItems: 'center',
              }}
            >
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <div
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: 4,
                    background: saffron,
                  }}
                />
                <div style={{ fontSize: 22, fontWeight: 700 }}>Netababu</div>
              </div>
              <div style={{ fontSize: 18, opacity: 0.6 }}>netababu.com</div>
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: fontData
        ? [{ name: 'Inter', data: fontData, weight: 700, style: 'normal' }]
        : [],
    }
  );
}
