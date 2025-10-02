import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

const ALLOW = new Set([
  'v5.airtableusercontent.com',
  'dl.airtable.com',
  'upload.wikimedia.org',
]);

export async function GET(req: NextRequest) {
  const raw = new URL(req.url).searchParams.get('u');
  if (!raw) return new NextResponse('Missing ?u', { status: 400 });

  let target: URL;
  try { target = new URL(raw); } catch { return new NextResponse('Bad URL', { status: 400 }); }

  if (!ALLOW.has(target.hostname)) {
    return new NextResponse('Host not allowed', { status: 400 });
  }

  const resp = await fetch(target.toString(), { next: { revalidate: 3600 } }); // cache 1h at edge
  if (!resp.ok || !resp.body) return new NextResponse('Upstream error', { status: resp.status || 502 });

  return new NextResponse(resp.body, {
    headers: {
      'Content-Type': resp.headers.get('content-type') || 'image/*',
      'Cache-Control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
