// app/(site)/page.tsx

import Image from 'next/image';
import Link from 'next/link';

import CardParty from '@/components/CardParty';
import CardPolitician from '@/components/CardPolitician';
import HeroSearch from '@/components/HeroSearch';
import { listPoliticians, listParties } from '@/lib/airtable';

export const dynamic = 'force-dynamic';

/* ──────────────────────────────────────────────────────────────────────────────
   Helpers
   ─────────────────────────────────────────────────────────────────────────── */

type AnyRec = Record<string, any>;

const firstNonEmpty = (obj: AnyRec, keys: string[]) => {
  for (const k of keys) {
    const v = obj?.[k];
    if (v != null && String(v).trim() !== '') return v;
  }
  return undefined;
};

const toNum = (v: unknown): number | undefined => {
  if (v == null || v === '') return undefined;
  const s = String(Array.isArray(v) ? v[0] : v).replace(/[^\d.-]/g, '');
  const n = Number(s);
  return Number.isFinite(n) ? n : undefined;
};

const parseYear = (v: unknown): number | undefined => {
  if (!v) return undefined;
  const m = String(v).match(/\b(18|19|20)\d{2}\b/);
  return m ? Number(m[0]) : undefined;
};

const roleText = (pol: AnyRec): string =>
  String(
    firstNonEmpty(pol, [
      'current_position',
      'position',
      'role',
      'title',
      'office',
      'designation',
      'post',
    ]) || '',
  );

const findRole = (pols: AnyRec[], role: 'pm' | 'president' | 'home' | 'lop') => {
  if (role === 'pm') return pols.find((p) => /\bprime\s*minister\b/i.test(roleText(p)));
  if (role === 'home') return pols.find((p) => /\bhome\s+minister\b/i.test(roleText(p)));

  if (role === 'president') {
    return pols.find((p) => {
      const t = roleText(p);

      // must contain the exact office phrase
      const hasOffice = /\bPresident of India\b/i.test(t);

      // exclude party/org titles and qualifiers
      const isViceLike = /\bVice\s+President\b/i.test(t);
      const hasQualifier = /\b(Ex|Former|Acting|Deputy|Pro\s*Tem|Past|Emeritus)\b\.?\s*/i.test(t);
      const isPartyTitle = /\bparty\s+president\b/i.test(t);

      return hasOffice && !isViceLike && !hasQualifier && !isPartyTitle;
    });
  }

  // LOP: prefer Lok Sabha if present
  const lopLS = pols.find(
    (p) =>
      /\bleader\s+of\s+opposition\b/i.test(roleText(p)) &&
      /\blok\s*sabha|people'?s\s+house/i.test(roleText(p)),
  );
  if (lopLS) return lopLS;

  return pols.find((p) => /\bleader\s+of\s+opposition\b/i.test(roleText(p)));
};

const pickJoinYear = (p: AnyRec): number | undefined =>
  toNum(
    firstNonEmpty(p, [
      'first_elected',
      'first election',
      'year joined',
      'joined',
      'politics_since',
      'entry_year',
      'career_start',
    ]),
  ) ??
  parseYear(
    firstNonEmpty(p, [
      'first_elected',
      'first election',
      'joined',
      'politics_since',
      'entry_year',
      'career_start',
    ]),
  );

const pickDOBYear = (p: AnyRec): number | undefined =>
  parseYear(firstNonEmpty(p, ['dob', 'date_of_birth', 'birthdate', 'born']));

const pickFoundedYear = (party: AnyRec): number | undefined =>
  parseYear(firstNonEmpty(party, ['founded', 'founded year', 'established', 'formation', 'founded_year']));

const pickSeats = (party: AnyRec): number => {
  const ls = toNum(firstNonEmpty(party, ['lok sabha seats', 'ls seats', 'seats ls', 'seats_lok_sabha']));
  const rs = toNum(firstNonEmpty(party, ['rajya sabha seats', 'rs seats', 'seats rs', 'seats_rajya_sabha']));
  const total = (ls ?? 0) + (rs ?? 0);
  if (total > 0) return total;

  // Fallback: any field containing "seats"
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
    if (!seen.has(id)) {
      seen.add(id);
      out.push(x);
    }
  }
  return out;
};

/* ──────────────────────────────────────────────────────────────────────────────
   Page
   ─────────────────────────────────────────────────────────────────────────── */

export default async function HomePage() {
  // Fetch enough rows to compute roles/seats/newest
  const [polAll, parAll] = await Promise.all([
    listPoliticians({ limit: 500 }) as any,
    listParties({ limit: 500 }) as any,
  ]);

  /* Top Netas: PM, President, Home Minister, LOP */
  const topNetas = uniqById(
    [
      findRole(polAll, 'pm'),
      findRole(polAll, 'president'),
      findRole(polAll, 'home'),
      findRole(polAll, 'lop'),
    ].filter(Boolean) as AnyRec[],
  ).slice(0, 4);

  /* Top Parties by total seats */
  const topParties = [...parAll]
    .map((p: AnyRec) => ({ p, seats: pickSeats(p) }))
    .sort((a, b) => b.seats - a.seats)
    .slice(0, 4)
    .map((x) => x.p);

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
    .map((x) => x.p);

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
    .map((x) => x.p);

  return (
    <>
      {/* ───────────────────────── Hero ───────────────────────── */}
      <main className="space-y-12 pt-10">
        <section className="relative isolate flex h-[55vh] items-start justify-center overflow-hidden md:h-[65vh] lg:h-[75vh]">
          {/* Background image + vignette (behind content only) */}
          <div className="absolute inset-0 z-0 overflow-hidden">
  {/* Artwork (kept faint) */}
  <Image
    src="/hero/hero-2560w.webp"
    alt="Watercolor collage of Indian political figures — Netababu"
    fill
    priority
    sizes="100vw"
    className={[
      'object-contain object-top',
      'opacity-28',
      '[filter:contrast(.9)_saturate(.9)]',
    ].join(' ')}
  />

  {/* One overlay: true all-sides radial fade into cream */}
  <div
    className="pointer-events-none absolute inset-0"
    style={{
      // transparent in the center → progressively cream near edges (all sides)
      background:
        'radial-gradient(120% 95% at 50% 45%, rgba(255,247,237,0) 42%, rgba(255,247,237,0.55) 68%, rgba(255,247,237,0.8) 82%, #fff7ed 96%)',
    }}
  />
</div>


          {/* Centered headline + search */}
          <div className="relative mx-auto max-w-4xl px-4 pt-6 text-center md:pt-8 lg:pt-10">
            <div className="h-kicker text-shadow-cream">India • Politics • Data</div>

            <h1 className="text-shadow-cream whitespace-nowrap text-[clamp(22px,4.5vw,42px)] font-semibold leading-tight tracking-tight text-ink-700">
              Netas, parties, drama — all in one place.
            </h1>

            <div className="text-shadow-cream mt-1 text-xl font-semibold text-saffron-600 md:text-2xl">
              नेताजी, पार्टियाँ और इंфो — एक ही जगह
            </div>

            <HeroSearch />
          </div>

          {/* Explore cards anchored to hero bottom */}
          <div className="absolute inset-x-0 bottom-6 z-10 sm:bottom-10 md:bottom-14">
            <div className="mx-auto max-w-6xl px-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="card p-5">
                  <h3 className="flex items-center gap-2 text-lg font-medium">
                    <span className="text-2xl">🏳️</span> Explore by Party
                  </h3>
                  <p className="mt-1 mb-3 text-sm text-ink-600/80">Browse active &amp; latent parties.</p>
                  <Link href="/parties" className="font-medium text-saffron-600">
                    View all →
                  </Link>
                </div>

                <div className="card p-5">
                  <h3 className="flex items-center gap-2 text-lg font-medium">
                    <span className="text-2xl">📍</span> Explore by State
                  </h3>
                  <p className="mt-1 mb-3 text-sm text-ink-600/80">Filter politicians by state.</p>
                  <Link href="/politicians" className="font-medium text-saffron-600">
                    View all →
                  </Link>
                </div>

                <div className="card p-5">
                  <h3 className="flex items-center gap-2 text-lg font-medium">
                    <span className="text-2xl">⚔️</span> Compare Netas
                  </h3>
                  <p className="mt-1 mb-3 text-sm text-ink-600/80">Head-to-head netas → spicy facts.</p>
                  <Link href="/compare" className="font-medium text-saffron-600">
                    Compare →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ───────────────────────── Featured ───────────────────────── */}
        <div className="mx-auto max-w-6xl space-y-12 px-4">
          <section className="space-y-6">
            <h2 className="text-2xl font-extrabold text-saffron-600 md:text-3xl">Featured</h2>

            <div className="space-y-8">
              {/* Top netas */}
              <div>
                <h3 className="mb-3 text-lg font-semibold">Top Netas</h3>
                <div className="grid grid-cols-1 items-stretch gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
                  {topNetas.map((p: any) => (
                    <CardPolitician key={p.id} p={p} />
                  ))}
                </div>
              </div>

              {/* Top parties */}
              <div>
                <h3 className="mb-3 text-lg font-semibold">Top Parties</h3>
                <div className="grid grid-cols-1 items-stretch gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
                  {topParties.map((party: any) => (
                    <CardParty key={party.id} party={party} />
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* ───────────────────────── Newly Added ───────────────────────── */}
          <section className="space-y-6">
            <h2 className="text-2xl font-extrabold md:text-3xl">Newly Added</h2>

            <div className="grid gap-8 md:grid-cols-2">
              {/* Latest netas */}
              <div>
                <h3 className="mb-3 text-lg font-semibold">Latest Netas</h3>
                <div className="grid grid-cols-1 items-stretch gap-x-6 gap-y-8 sm:grid-cols-2">
                  {latestNetas.map((p: any) => (
                    <CardPolitician key={p.id} p={p} />
                  ))}
                </div>
              </div>

              {/* Latest parties */}
              <div>
                <h3 className="mb-3 text-lg font-semibold">Latest Parties</h3>
                <div className="grid grid-cols-1 items-stretch gap-x-6 gap-y-8 sm:grid-cols-2">
                  {latestParties.map((party: any) => (
                    <CardParty key={party.id} party={party} />
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* ───────────────────────── Sources ───────────────────────── */}
          <section className="mt-4 space-y-2">
            <h2 className="text-xl font-semibold">Sources</h2>
            <p className="space-x-2 text-sm text-ink-600/80">
              <a href="https://eci.gov.in" className="underline" target="_blank" rel="noopener noreferrer">
                ECI
              </a>{' '}
              •{' '}
              <a href="https://prsindia.org" className="underline" target="_blank" rel="noopener noreferrer">
                PRS
              </a>{' '}
              •{' '}
              <a href="https://loksabha.nic.in" className="underline" target="_blank" rel="noopener noreferrer">
                Lok Sabha
              </a>{' '}
              •{' '}
              <a href="https://censusindia.gov.in" className="underline" target="_blank" rel="noopener noreferrer">
                Census
              </a>{' '}
              •{' '}
              <a href="https://mospi.gov.in" className="underline" target="_blank" rel="noopener noreferrer">
                NSS
              </a>
            </p>
          </section>
        </div>
      </main>
    </>
  );
}
