import { NextResponse } from 'next/server';
import { listPoliticians, listParties } from '@/lib/airtable';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get('q') || '').trim().toLowerCase();
  if (!q) return NextResponse.json({ results: [] });

  const [pol, par] = await Promise.all([
    listPoliticians({ limit: 80 }),
    listParties({ limit: 80 }),
  ]);

  const norm = (s = '') => s.toLowerCase();

  const polHits = pol
    .filter(p => norm(p.name).includes(q) || norm(p.party || '').includes(q) || norm(p.constituency || '').includes(q))
    .slice(0, 8)
    .map(p => ({ type: 'politician' as const, name: p.name, slug: p.slug }));

  const parHits = par
    .filter(p => norm(p.name).includes(q) || norm((p as any).abbr || '').includes(q))
    .slice(0, 6)
    .map(p => ({ type: 'party' as const, name: p.name, slug: p.slug }));

  return NextResponse.json({ results: [...polHits, ...parHits] });
}
