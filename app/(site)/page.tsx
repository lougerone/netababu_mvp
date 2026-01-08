// app/(site)/page.tsx
import Link from 'next/link';
import CardParty from '@/components/CardParty';
import CardPolitician from '@/components/CardPolitician';
import HeroSearch from '@/components/HeroSearch';
import { listPoliticians, listParties } from '@/lib/airtable';

// Cache for 1 hour (adjust based on your data update frequency)
export const revalidate = 3600;
export const dynamic = 'force-static';

/* ────────────────────────────────────────────────────────────────────────────── 
   Types
─────────────────────────────────────────────────────────────────────────────── */

type AnyRec = Record<string, any>;

interface Politician extends AnyRec {
  id: string;
  slug?: string;
  current_position?: string;
  position?: string;
  role?: string;
  title?: string;
  office?: string;
  designation?: string;
  post?: string;
  first_elected?: string | number;
  'first election'?: string | number;
  'year joined'?: string | number;
  joined?: string | number;
  politics_since?: string | number;
  entry_year?: string | number;
  career_start?: string | number;
  dob?: string;
  date_of_birth?: string;
  birthdate?: string;
  born?: string;
}

interface Party extends AnyRec {
  id: string;
  slug?: string;
  'lok sabha seats'?: number | string;
  'ls seats'?: number | string;
  'seats ls'?: number | string;
  seats_lok_sabha?: number | string;
  'rajya sabha seats'?: number | string;
  'rs seats'?: number | string;
  'seats rs'?: number | string;
  seats_rajya_sabha?: number | string;
  founded?: string | number;
  'founded year'?: string | number;
  established?: string | number;
  formation?: string | number;
  founded_year?: string | number;
}

interface TopNeta extends Politician {
  name?: string;
}

interface TopParty extends Party {
  name?: string;
}

/* ────────────────────────────────────────────────────────────────────────────── 
   Constants - Role Patterns
─────────────────────────────────────────────────────────────────────────────── */

const ROLE_PATTERNS = {
  pm: /\\bprime\\s*minister\\b/i,
  home: /\\bhome\\s+minister\\b/i,
  lop: /\\bleader\\s+of\\s+opposition\\b/i,
  lopLS: /\\blok\\s*sabha|people'?s\\s+house/i,
} as const;

const TITLE_QUALIFIERS = {
  vice: /\\bVice\\s+President\\b/i,
  qualifier: /\\b(Ex|Former|Acting|Deputy|Pro\\s*Tem|Past|Emeritus)\\b\\.?\\s*/i,
  partyTitle: /\\bparty\\s+president\\b/i,
} as const;

/* ────────────────────────────────────────────────────────────────────────────── 
   Helpers
─────────────────────────────────────────────────────────────────────────────── */

const firstNonEmpty = (obj: AnyRec, keys: string[]): string | undefined => {
  for (const k of keys) {
    const v = obj?.[k];
    if (v != null && String(v).trim() !== '') return v;
  }
  return undefined;
};

const toNum = (v: unknown): number | undefined => {
  if (v == null || v === '') return undefined;
  const s = String(Array.isArray(v) ? v[0] : v).replace(/[^\\d.-]/g, '');
  const n = Number(s);
  return Number.isFinite(n) ? n : undefined;
};

const parseYear = (v: unknown): number | undefined => {
  if (!v) return undefined;
  const m = String(v).match(/\\b(18|19|20)\\d{2}\\b/);
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
    ]) || ''
  );

const findRole = (
  pols: Politician[],
  role: 'pm' | 'president' | 'home' | 'lop'
): Politician | undefined => {
  if (role === 'pm') {
    return pols.find((p) => ROLE_PATTERNS.pm.test(roleText(p)));
  }

  if (role === 'home') {
    return pols.find((p) => ROLE_PATTERNS.home.test(roleText(p)));
  }

  if (role === 'president') {
    return pols.find((p) => {
      const t = roleText(p);
      const hasOffice = /\\bPresident of India\\b/i.test(t);
      const isViceLike = TITLE_QUALIFIERS.vice.test(t);
      const hasQualifier = TITLE_QUALIFIERS.qualifier.test(t);
      const isPartyTitle = TITLE_QUALIFIERS.partyTitle.test(t);
      return hasOffice && !isViceLike && !hasQualifier && !isPartyTitle;
    });
  }

  // LOP: prefer Lok Sabha if present
  const lopLS = pols.find(
    (p) =>
      ROLE_PATTERNS.lop.test(roleText(p)) &&
      ROLE_PATTERNS.lopLS.test(roleText(p))
  );

  if (lopLS) return lopLS;

  return pols.find((p) => ROLE_PATTERNS.lop.test(roleText(p)));
};

const pickJoinYear = (p: Politician): number | undefined =>
  toNum(
    firstNonEmpty(p, [
      'first_elected',
      'first election',
      'year joined',
      'joined',
      'politics_since',
      'entry_year',
      'career_start',
    ])
  ) ?? parseYear(firstNonEmpty(p, ['first_elected', 'joined', 'politics_since']));

const pickDOBYear = (p: Politician): number | undefined =>
  parseYear(
    firstNonEmpty(p, ['dob', 'date_of_birth', 'birthdate', 'born'])
  );

const pickFoundedYear = (party: Party): number | undefined =>
  parseYear(
    firstNonEmpty(party, [
      'founded',
      'founded year',
      'established',
      'formation',
      'founded_year',
    ])
  );

const pickSeats = (party: Party): number => {
  const ls = toNum(
    firstNonEmpty(party, [
      'lok sabha seats',
      'ls seats',
      'seats ls',
      'seats_lok_sabha',
    ])
  );
  const rs = toNum(
    firstNonEmpty(party, [
      'rajya sabha seats',
      'rs seats',
      'seats rs',
      'seats_rajya_sabha',
    ])
  );
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

const uniqById = <T extends AnyRec>(arr: T[]): T[] => {
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
   Page Component
─────────────────────────────────────────────────────────────────────────────── */

export const metadata = {
  title: 'Netas, Parties & Politics Data | NetaBabu',
  description:
    'Explore Indian politicians and political parties with verified data. Find information on top leaders, party positions, and political analysis.',
  keywords:
    'Indian politics, politicians, political parties, netas, elections',
  openGraph: {
    title: 'Netas, Parties & Politics Data | NetaBabu',
    description:
      'Explore Indian politicians and political parties with verified data.',
    type: 'website',
  },
};

export default async function HomePage() {
  try {
    // Fetch enough rows to compute roles/seats/newest
    const [polAll, parAll] = await Promise.all([
      listPoliticians({ limit: 500 }),
      listParties({ limit: 500 }),
    ]);

    // Validate we have data
    if (!Array.isArray(polAll) || !Array.isArray(parAll)) {
      throw new Error('Invalid data format received from API');
    }

    /* Top Netas: PM, President, Home Minister, LOP */
    const topNetas = uniqById(
      [
        findRole(polAll, 'pm'),
        findRole(polAll, 'president'),
        findRole(polAll, 'home'),
        findRole(polAll, 'lop'),
      ].filter((p): p is Politician => p !== undefined)
    ).slice(0, 4);

    /* Top Parties by total seats */
    const topParties = [...parAll]
      .map((p: Party) => ({ p, seats: pickSeats(p) }))
      .sort((a, b) => b.seats - a.seats)
      .slice(0, 4)
      .map((x) => x.p);

    /* Newly Added → Netas: most recent join year, then youngest DOB */
    const latestNetas = [...polAll]
      .map((p: Politician) => ({
        p,
        join: pickJoinYear(p),
        dob: pickDOBYear(p),
      }))
      .sort((a, b) => {
        if (a.join && b.join && a.join !== b.join) return b.join - a.join;
        if (a.join && !b.join) return -1;
        if (!a.join && b.join) return 1;
        if (a.dob && b.dob && a.dob !== b.dob) return b.dob - a.dob;
        return 0;
      })
      .slice(0, 4)
      .map((x) => x.p);

    /* Newly Added → Parties: newest founded year */
    const latestParties = [...parAll]
      .map((p: Party) => ({ p, y: pickFoundedYear(p) }))
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
        {/* ───────────────────────── Hero (mobile-first, no image) ───────────────────────── */}
        <main className="space-y-8 pt-6 sm:pt-8 md:space-y-10 md:pt-10">
          <section className="relative isolate overflow-visible">
            {/* soft backdrop only (no art) */}
            <div
              className="pointer-events-none absolute inset-0 -z-10"
              style={{
                background:
                  'radial-gradient(120% 90% at 50% 40%, rgba(255,247,237,0) 30%, rgba(255,247,237,0.7) 68%, #fff7ed 100%)',
              }}
            />

            {/* Headline + Search */}
            <div className="relative mx-auto w-full max-w-4xl px-3 sm:px-4 text-center">
              <div className="h-kicker text-shadow-cream">
                India • Politics • Data
              </div>

              {/* slightly smaller on very small screens */}
              <h1 className="text-shadow-cream text-[clamp(20px,6vw,36px)] sm:text-[clamp(22px,4.5vw,42px)] font-semibold leading-tight tracking-tight text-ink-700">
                Netas, parties, drama — all in one place.
              </h1>

              <div className="text-shadow-cream mt-1 text-[17px] font-semibold text-saffron-600 sm:text-xl md:text-2xl">
                नेताजी, पार्टियाँ और इंफो — एक ही जगह
              </div>

              {/* Search bar */}
              <div className="mt-4 sm:mt-5">
                <HeroSearch />
              </div>
            </div>

            {/* Explore / Compare — tucked right under the search */}
            <div className="mx-auto mt-6 w-full max-w-6xl px-3 sm:px-4 md:mt-8">
              <div className="grid gap-3 sm:gap-4 md:grid-cols-3">
                <div className="card p-4 md:p-5">
                  <h3 className="flex items-center gap-2 text-base sm:text-lg font-medium">
                    <span className="text-xl sm:text-2xl" aria-label="flag">
                      🏳️
                    </span>
                    Explore by Party
                  </h3>
                  <p className="mt-1 mb-3 text-[13px] sm:text-sm text-ink-600/80">
                    Browse active &amp; latent parties.
                  </p>
                  <Link href="/parties" className="font-medium text-saffron-600">
                    View all →
                  </Link>
                </div>

                <div className="card p-4 md:p-5">
                  <h3 className="flex items-center gap-2 text-base sm:text-lg font-medium">
                    <span className="text-xl sm:text-2xl" aria-label="location">
                      📍
                    </span>
                    Explore by State
                  </h3>
                  <p className="mt-1 mb-3 text-[13px] sm:text-sm text-ink-600/80">
                    Filter politicians by state.
                  </p>
                  <Link
                    href="/politicians"
                    className="font-medium text-saffron-600"
                  >
                    View all →
                  </Link>
                </div>

                <div className="card p-4 md:p-5">
                  <h3 className="flex items-center gap-2 text-base sm:text-lg font-medium">
                    <span className="text-xl sm:text-2xl" aria-label="compare">
                      ⚔️
                    </span>
                    Compare Netas
                  </h3>
                  <p className="mt-1 mb-3 text-[13px] sm:text-sm text-ink-600/80">
                    Head-to-head netas → spicy facts.
                  </p>
                  <Link href="/compare" className="font-medium text-saffron-600">
                    Compare →
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* ───────────────────────── Featured ───────────────────────── */}
          <div className="mx-auto max-w-6xl space-y-12 px-4">
            <section className="space-y-6">
              <h2 className="text-2xl font-extrabold text-saffron-600 md:text-3xl">
                Featured
              </h2>

              <div className="space-y-8">
                {/* Top netas */}
                {topNetas.length > 0 && (
                  <div>
                    <h3 className="mb-3 text-lg font-semibold">Top Netas</h3>
                    <div className="grid grid-cols-1 items-stretch gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
                      {topNetas.map((p) => (
                        <CardPolitician key={p.id} p={p} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Top parties */}
                {topParties.length > 0 && (
                  <div>
                    <h3 className="mb-3 text-lg font-semibold">Top Parties</h3>
                    <div className="grid grid-cols-1 items-stretch gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
                      {topParties.map((party) => (
                        <CardParty key={party.id} party={party} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* ───────────────────────── Newly Added ───────────────────────── */}
            <section className="space-y-6">
              <h2 className="text-2xl font-extrabold md:text-3xl">
                Newly Added
              </h2>

              <div className="grid gap-8 md:grid-cols-2">
                {/* Latest netas */}
                {latestNetas.length > 0 && (
                  <div>
                    <h3 className="mb-3 text-lg font-semibold">Latest Netas</h3>
                    <div className="grid grid-cols-1 items-stretch gap-x-6 gap-y-8 sm:grid-cols-2">
                      {latestNetas.map((p) => (
                        <CardPolitician key={p.id} p={p} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Latest parties */}
                {latestParties.length > 0 && (
                  <div>
                    <h3 className="mb-3 text-lg font-semibold">
                      Latest Parties
                    </h3>
                    <div className="grid grid-cols-1 items-stretch gap-x-6 gap-y-8 sm:grid-cols-2">
                      {latestParties.map((party) => (
                        <CardParty key={party.id} party={party} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* ───────────────────────── Sources ───────────────────────── */}
            <section className="mt-4 space-y-2">
              <h2 className="text-xl font-semibold">Sources</h2>
              <p className="space-x-2 text-sm text-ink-600/80">
                <a
                  href="https://eci.gov.in"
                  className="underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  ECI
                </a>{' '}
                •{' '}
                <a
                  href="https://prsindia.org"
                  className="underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  PRS
                </a>{' '}
                •{' '}
                <a
                  href="https://loksabha.nic.in"
                  className="underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Lok Sabha
                </a>{' '}
                •{' '}
                <a
                  href="https://censusindia.gov.in"
                  className="underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Census
                </a>{' '}
                •{' '}
                <a
                  href="https://mospi.gov.in"
                  className="underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  NSS
                </a>
              </p>
            </section>
          </div>
        </main>
      </>
    );
  } catch (error) {
    console.error('Failed to load home page data:', error);

    // Render error fallback UI
    return (
      <main className="space-y-8 pt-6 sm:pt-8 md:space-y-10 md:pt-10">
        <section className="relative isolate overflow-visible">
          <div className="relative mx-auto w-full max-w-4xl px-3 sm:px-4 text-center">
            <h1 className="text-ink-700 font-semibold text-2xl md:text-3xl">
              Unable to Load Data
            </h1>
            <p className="mt-4 text-ink-600">
              We're experiencing technical difficulties. Please try refreshing the page.
            </p>
          </div>
        </section>
      </main>
    );
  }
}
