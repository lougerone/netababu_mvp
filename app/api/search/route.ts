// app/api/search/route.ts
import { NextResponse } from "next/server";
import { listPoliticians, listParties } from "@/lib/airtable";

export const dynamic = "force-dynamic"; // don't prerender at build
export const runtime = "nodejs";

// --- tiny in-memory cache for burst control ---
const _cache = new Map<string, { exp: number; data: any }>();
const TTL_MS = Number(process.env.SEARCH_TTL_MS || 60_000);

function normalize(s = "") {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}
function getC(key: string) {
  const hit = _cache.get(key);
  if (hit && hit.exp > Date.now()) return hit.data;
  if (hit) _cache.delete(key);
  return null;
}
function setC(key: string, data: any) {
  _cache.set(key, { exp: Date.now() + TTL_MS, data });
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const qRaw = (searchParams.get("q") || "").trim();
  const full = searchParams.get("full") === "1";
  if (!qRaw) return NextResponse.json({ results: [], counts: { politicians: 0, parties: 0 } });

  const key = `q:${qRaw}:${full ? "1" : "0"}`;
  const cached = getC(key);
  if (cached) return NextResponse.json(cached, { headers: { "Cache-Control": "public, max-age=30" } });

  const q = normalize(qRaw);

  // Pull larger slices; lib/airtable has its own TTL cache too.
  const [pol, par] = await Promise.all([
    listPoliticians({ limit: full ? 2000 : 1000 }),
    listParties({ limit: full ? 2000 : 1000 }),
  ]);

  const matchPol = pol.filter((p: any) => {
    const hay = [p.name, p.party, p.constituency, p.aka, p.aliases, p.state]
      .filter(Boolean)
      .map(String)
      .map(normalize)
      .join(" • ");
    return hay.includes(q);
  });

  const matchPar = par.filter((p: any) => {
    const hay = [p.name, p.abbr, p.aliases, p.bloc]
      .filter(Boolean)
      .map(String)
      .map(normalize)
      .join(" • ");
    return hay.includes(q);
  });

  const capPol = full ? matchPol : matchPol.slice(0, 20);
  const capPar = full ? matchPar : matchPar.slice(0, 20);

  const polHits = capPol.map((p: any) => ({ type: "politician" as const, name: p.name, slug: p.slug }));
  const parHits = capPar.map((p: any) => ({ type: "party" as const, name: p.name, slug: p.slug }));

  const result = {
    results: [...polHits, ...parHits],
    counts: { politicians: matchPol.length, parties: matchPar.length },
  };

  setC(key, result);
  return NextResponse.json(result, { headers: { "Cache-Control": "public, max-age=30" } });
}
