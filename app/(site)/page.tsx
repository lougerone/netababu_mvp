import Link from 'next/link';
import CardPolitician from '@/components/CardPolitician';
import CardParty from '@/components/CardParty';
import { listPoliticians, listParties } from '@/lib/airtable';
import Image from 'next/image';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [polAll, parAll] = await Promise.all([
    listPoliticians({ limit: 8 }),
    listParties({ limit: 8 }),
  ]);

  const featuredNetas = polAll.slice(0, 4);
  const featuredParties = parAll.slice(0, 4);
  const latestNetas = polAll.slice(4, 8);
  const latestParties = parAll.slice(4, 8);

  // ✅ Popular searches (replace later with real data from Airtable/analytics)
  const popularSearches: string[] = []; // for now empty → fallback
  const fallbackSearches = ['Modi', 'Gandhi', 'BJP', 'RSS'];
  const displaySearches =
    popularSearches.length > 0 ? popularSearches : fallbackSearches;

  return (
    <div className="space-y-12">
      <main>
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
            className="absolute inset-0 -z-10 h-full w-full object-contain object-bottom 
                       opacity-50 scale-90"
            sizes="100vw"
          />

          {/* Edge fades */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-cream-200 to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 left-0 w-48 bg-gradient-to-r from-cream-200 to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-48 bg-gradient-to-l from-cream-200 to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-cream-200 to-transparent" />

          {/* Content */}
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

            {/* Search form */}
            <form
              action="/search"
              method="GET"
              className="max-w-2xl mx-auto mt-3 flex gap-2"
            >
              <input
                type="text"
                name="query"
                className="input-pill flex-1"
                placeholder="Search politicians, parties…"
              />
              <button type="submit" className="btn">
                Search
              </button>
            </form>

            {/* Popular searches */}
            <div className="mt-2 text-sm text-ink-600/80 text-shadow-cream">
              Popular:{' '}
              {displaySearches.map((term, i) => (
                <span key={term}>
                  <Link
                    href={`/search?query=${encodeURIComponent(term)}`}
                    className="underline"
                  >
                    {term}
                  </Link>
                  {i < displaySearches.length - 1 && ' • '}
                </span>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Explore cards */}
      {/* ... keep the rest of your sections exactly the same ... */}
    </div>
  );
}
