import Link from 'next/link';
import Image from 'next/image';
import CardPolitician from '@/components/CardPolitician';
import CardParty from '@/components/CardParty';
import { listPoliticians, listParties } from '@/lib/airtable';
import HeroSearch from '@/components/HeroSearch';

export const dynamic = 'force-dynamic';

/* ---------------- helpers ---------------- */
type AnyRec = Record<string, any>;

const toList = (v: any): string[] =>
  !v ? [] : Array.isArray(v) ? v.filter(Boolean).map((x) => String(x).trim())
  : String(v).split(/[,\n;]/).map(s => s.trim()).filter(Boolean);

const firstNonEmpty = (obj: AnyRec, keys: string[]) => {
  for (const k of keys) {
    const v = obj?.[k];
    if (v != null && String(v).trim() !== '') return v;
  }
};

const toNum = (v: any): number | undefined => {
  if (v == null || v === '') return;
  const s = String(Array.isArray(v) ? v[0] : v).replace(/[^\d.-]/g, '');
  const n = Number(s);
  return Number.isFinite(n) ? n : undefined;
};

const parseYear = (v: any): number | undefined => {
  if (!v) return;
  const m = String(v).match(/\b(18|19|20)\d{2}\b/);
  return m ? Number(m[0]) : undefined;
};

const roleText = (pol: AnyRec): string =>
  String(
    firstNonEmpty(pol, [
      'current_position','position','role','title','office','designation','post'
    ]) || ''
  );

const findRole = (pols: AnyRec[], role: 'pm'|'president'|'home'|'lop') => {
  const txt = (p: AnyRec) => roleText(p).toLowerCase();

  if (role === 'pm')      return pols.find(p => /\bprime\s*minister\b/i.test(roleText(p)));
  if (role === 'home')    return pols.find(p => /\bhome\s+minister\b/i.test(roleText(p)));
  if (role === 'president')
    return pols.find(p => /\bpresident\b/i.test(roleText(p)) && !/\bparty\s+president\b/i.test(roleText(p)));
  // LOP: prefer Lok Sabha if present
  const lopLS = pols.find(p => /\bleader\s+of\s+opposition\b/i.test(roleText(p)) && /\blok\s*sabha|people'?s\s+house/i.test(roleText(p)));
  if (lopLS) return lopLS;
  return pols.find(p => /\bleader\s+of\s+opposition\b/i.test(roleText(p)));
};

const pickJoinYear = (p: AnyRec): number | undefined =>
  toNum(firstNonEmpty(p, ['first_elected','first election','year joined','joined','politics_since','entry_year','career_start'])) ??
  parseYear(firstNonEmpty(p, ['first_elected','first election','joined','politics_since','entry_year','career_start']));

const pickDOBYear = (p: AnyRec): number | undefined =>
  parseYear(firstNonEmpty(p, ['dob','date_of_birth','birthdate','born']));

const pickFoundedYear = (party: AnyRec): number | undefined =>
  parseYear(firstNonEmpty(party, ['founded','founded year','established','formation','founded_year']));

const pickSeats = (party: AnyRec): number => {
  const ls = toNum(firstNonEmpty(party, ['lok sabha seats','ls seats','seats ls','seats_lok_sabha']));
  const rs = toNum(firstNonEmpty(party, ['rajya sabha seats','rs seats','seats rs','seats_rajya_sabha']));
  const total = (ls ?? 0) + (rs ?? 0);
  if (total > 0) return total;

  // fallback: any field containing "seats"
  for (const k of Object.keys(party)) {
    if (/seats/i.test(k)) {
      const n = toNum(party[k]);
      if (n) return n;
    }
  }
  return 0;
};

const uniqById = <T extends AnyRec>(arr: T[]) => {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const x of arr) {
    const id = String(x.id ?? x.slug ?? Math.random());
    if (!seen.has(id)) { seen.add(id); out.push(x); }
  }
  return out;
};

/* ---------------- page ---------------- */
export default async function HomePage() {
  // bump limits so we can actually find roles/seats/newest
  const [polAll, parAll] = await Promise.all([
    listPoliticians({ limit: 500 }) as any,
    listParties({ limit: 500 }) as any,
  ]);

  /* Top Netas: PM, President, Home Minister, LOP */
  const topNetas = uniqById([
    findRole(polAll, 'pm'),
    findRole(polAll, 'president'),
    findRole(polAll, 'home'),
    findRole(polAll, 'lop'),
  ].filter(Boolean) as AnyRec[]).slice(0, 4);

  /* Top Parties by total seats */
  const topParties = [...parAll]
    .map((p: AnyRec) => ({ p, seats: pickSeats(p) }))
    .sort((a, b) => b.seats - a.seats)
    .slice(0, 4)
    .map(x => x.p);

  /* Newly Added → Netas: most recent join year, then youngest DOB */
  const latestNetas = [...polAll]
    .map((p: AnyRec) => ({ p, join: pickJoinYear(p), dob: pickDOBYear(p) }))
    .sort((a, b) => {
      if (a.join && b.join && a.join !== b.join) return b.join - a.join;
      if (a.join && !b.join) return -1;
      if (!a.join && b.join) return 1;
      if (a.dob && b.dob && a.dob !== b.dob) return b.dob - a.dob; // younger first
      return 0;
    })
    .slice(0, 4)
    .map(x => x.p);

  /* Newly Added → Parties: newest founded year */
  const latestParties = [...parAll]
    .map((p: AnyRec) => ({ p, y: pickFoundedYear(p) }))
    .sort((a, b) => {
      if (a.y && b.y) return b.y - a.y;
      if (a.y && !b.y) return -1;
      if (!a.y && b.y) return 1;
      return 0;
    })
    .slice(0, 4)
    .map(x => x.p);

  // Popular searches (placeholder)
  const displaySearches = ['Modi', 'Gandhi', 'BJP', 'RSS'];

  return (
    <main className="space-y-12">
      {/* Hero */}
      <section
        className="relative isolate overflow-hidden
                   h-[55vh] md:h-[65vh] lg:h-[75vh] flex items-start justify-center"
      >
        {/* Background image */}
        <Image
          src="/hero/hero-2560w.webp"
          alt="Watercolor collage of Indian political figures — Netababu"
          fill
          priority
          className="absolute inset-0 -z-10 h-full w-full object-contain object-bottom opacity-50 scale-90"
          sizes="100vw"
        />

        {/* Edge fades */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-cream-200 to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 left-0 w-48 bg-gradient-to-r from-cream-200 to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-48 bg-gradient-to-l from-cream-200 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-cream-200 to-transparent" />

        {/* Centered headline + search */}
        <div className="relative mx-auto max-w-4xl px-4 pt-6 md:pt-8 lg:pt-10 text-center">
          <div className="h-kicker text-shadow-cream">India • Politics • Data</div>

          <h1
            className="whitespace-nowrap font-semibold text-ink-700 leading-tight tracking-tight 
                       text-[clamp(22px,4.5vw,42px)] text-shadow-cream"
          >
            Netas, parties, drama — all in one place.
          </h1>

          <div className="text-saffron-600 text-xl md:text-2xl font-semibold mt-1 text-shadow-cream">
            नेताजी, पार्टियाँ और इंफो — एक ही जगह
          </div>

          <HeroSearch />
        </div>

        {/* Explore cards anchored to hero bottom */}
        <div className="absolute inset-x-0 bottom-6 sm:bottom-10 md:bottom-14 z-10"> 
          <div className="mx-auto max-w-6xl px-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="card p-5">
                <h3 className="flex items-center gap-2 font-medium text-lg">
                  <span className="text-2xl">🏳️</span> Explore by Party
                </h3>
                <p className="text-sm text-ink-600/80 mb-3 mt-1">Browse active & latent parties.</p>
                <Link href="/parties" className="text-saffron-600 font-medium">View all →</Link>
              </div>

              <div className="card p-5">
                <h3 className="flex items-center gap-2 font-medium text-lg">
                  <span className="text-2xl">📍</span> Explore by State
                </h3>
                <p className="text-sm text-ink-600/80 mb-3 mt-1">Filter politicians by state.</p>
                <Link href="/politicians" className="text-saffron-600 font-medium">View all →</Link>
              </div>

              <div className="card p-5">
                <h3 className="flex items-center gap-2 font-medium text-lg">
                  <span className="text-2xl">⚔️</span> Compare Netas
                </h3>
                <p className="text-sm text-ink-600/80 mb-3 mt-1">Head-to-head netas → spicy facts.</p>
                <Link href="/compare" className="text-saffron-600 font-medium">Compare →</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content container */}
      <div className="mx-auto max-w-6xl px-4 space-y-12">
        {/* Featured netas & parties */}
        <section className="space-y-6">
          <h2 className="text-2xl md:text-3xl font-extrabold text-saffron-600">Featured</h2>

          <div className="space-y-8">
            {/* Top netas */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Top Netas</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-8 items-stretch">
                {topNetas.map((p: any) => <CardPolitician key={p.id} p={p} />)}
              </div>
            </div>

            {/* Top parties */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Top Parties</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-8 items-stretch">
                {topParties.map((party: any) => <CardParty key={party.id} party={party} />)}
              </div>
            </div>
          </div>
        </section>

        {/* Latest netas & parties */}
        <section className="space-y-6">
          <h2 className="text-2xl md:text-3xl font-extrabold">Newly Added</h2>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Latest netas */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Latest Netas</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-8 items-stretch">
                {latestNetas.map((p: any) => <CardPolitician key={p.id} p={p} />)}
              </div>
            </div>

            {/* Latest parties */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Latest Parties</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-8 items-stretch">
                {latestParties.map((party: any) => <CardParty key={party.id} party={party} />)}
              </div>
            </div>
          </div>
        </section>

        {/* Sources */}
        <section className="space-y-2 mt-4">
          <h2 className="text-xl font-semibold">Sources</h2>
          <p className="text-sm text-ink-600/80 space-x-2">
            <Link href="https://eci.gov.in" className="underline">ECI</Link> •
            <Link href="https://prsindia.org" className="underline">PRS</Link> •
            <Link href="https://loksabha.nic.in" className="underline">Lok Sabha</Link> •
            <Link href="https://censusindia.gov.in" className="underline">Census</Link> •
            <Link href="https://mospi.gov.in" className="underline">NSS</Link>
          </p>
        </section>
      </div>
    </main>
  );
}
