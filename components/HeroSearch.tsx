// app/api/search/route.ts
import { NextResponse } from 'next/server';
import { listPoliticians, listParties } from '@/lib/airtable';

export const dynamic = 'force-dynamic';

const normalize = (s = '') =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/\s+/g, ' ')
    .trim();

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const qRaw = (searchParams.get('q') || '').trim();
  const full = searchParams.get('full') === '1'; // ?full=1 returns larger sets if you want
  if (!qRaw) return NextResponse.json({ results: [], counts: { politicians: 0, parties: 0 } });

  const q = normalize(qRaw);

  // Pull BIG lists so single letters work. If your list* helpers support pagination, use it.
  // Otherwise set a high limit like 1000.
  const [pol, par] = await Promise.all([
    listPoliticians({ limit: 1000 }), // increase this if needed
    listParties({ limit: 1000 }),
  ]);

  const matchPol = pol.filter((p) => {
    const hay = [
      p.name,
      p.party,
      (p as any).constituency,
      (p as any).aka,
      (p as any).aliases,
      (p as any).state,
    ]
      .filter(Boolean)
      .map(String)
      .map(normalize)
      .join(' • ');
    return hay.includes(q);
  });

  const matchPar = par.filter((p) => {
    const hay = [
      p.name,
      (p as any).abbr,
      (p as any).aliases,
      (p as any).bloc,
    ]
      .filter(Boolean)
      .map(String)
      .map(normalize)
      .join(' • ');
    return hay.includes(q);
  });

  // Cap what we *return* to the typeahead for speed; use counts for “See all”
  const capPol = full ? matchPol : matchPol.slice(0, 20);
  const capPar = full ? matchPar : matchPar.slice(0, 20);

  const polHits = capPol.map((p) => ({
    type: 'politician' as const,
    name: p.name,
    slug: p.slug,
  }));
  const parHits = capPar.map((p) => ({
    type: 'party' as const,
    name: p.name,
    slug: p.slug,
  }));

  return NextResponse.json({
    results: [...polHits, ...parHits],
    counts: { politicians: matchPol.length, parties: matchPar.length },
  });
}
