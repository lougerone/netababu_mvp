import Link from 'next/link';
import CardPolitician from '@/components/CardPolitician';
import CardParty from '@/components/CardParty';
import { listPoliticians, listParties } from '@/lib/airtable';
import Hero from '@/components/Hero';
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
  const blurDataURL = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';

  return (
    <div className="space-y-12">
      {/* Hero */}
    <section
  className="relative isolate text-center overflow-hidden
             h-[60vh] md:h-[70vh] lg:h-[80vh]"
>
  {/* Background image */}
 <Image
  src="/hero/hero-2560w.webp"
  alt="Watercolor collage of Indian political figures — Netababu"
  fill
  priority
  className="absolute inset-0 -z-10 h-full w-full object-contain object-bottom opacity-60"
  sizes="100vw"
/>

  {/* Edge fades */}
  <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-cream-200 to-transparent" />
  <div className="pointer-events-none absolute inset-y-0 left-0 w-48 bg-gradient-to-r from-cream-200 to-transparent" />
  <div className="pointer-events-none absolute inset-y-0 right-0 w-48 bg-gradient-to-l from-cream-200 to-transparent" />
  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-cream-200 to-transparent" />

  <div className="relative mx-auto max-w-4xl px-4 pt-8 md:pt-10 lg:pt-12">
    <div className="h-kicker">India • Politics • Data</div>

    <h1 className="whitespace-nowrap font-semibold text-ink-700 leading-tight tracking-tight text-[clamp(28px,6vw,56px)]">
  Netas, parties, drama — all in one place.
</h1>


    <div className="text-saffron-600 text-xl md:text-2xl font-semibold">
      नेताजी, पार्टियाँ और इंफो — एक ही जगह
    </div>

    <div className="max-w-2xl mx-auto mt-3 flex gap-2">
      <input className="input-pill flex-1" placeholder="Search politicians, parties…" />
      <button className="btn">Search</button>
    </div>

    <div className="mt-2 text-sm text-ink-600/80">
      Popular:{" "}
      <Link href="/politicians?query=modi" className="underline">Modi</Link>{" "}
      •{" "}
      <Link href="/parties?query=inc" className="underline">INC</Link>
    </div>
  </div>
</section>
      
      {/* Explore cards */}
      <section className="grid md:grid-cols-3 gap-4 mt-8">
        <div className="card p-5">
          <div className="text-2xl">🏳️</div>
          <h3 className="font-medium mt-1">Explore by Party</h3>
          <p className="text-sm text-ink-600/80 mb-3">Browse active & latent parties.</p>
          <Link href="/parties" className="text-saffron-600 font-medium">View all →</Link>
        </div>

        <div className="card p-5">
          <div className="text-2xl">📍</div>
          <h3 className="font-medium mt-1">Explore by State</h3>
          <p className="text-sm text-ink-600/80 mb-3">Filter politicians by state.</p>
          <Link href="/politicians?state=MH" className="text-saffron-600 font-medium">Try Maharashtra →</Link>
        </div>

        <div className="card p-5">
          <div className="text-2xl">⚔️</div>
          <h3 className="font-medium mt-1">Trending netas</h3>
          <p className="text-sm text-ink-600/80 mb-3">Compare netas → spicy facts.</p>
          <Link href="/compare" className="text-saffron-600 font-medium">Compare →</Link>
        </div>
      </section>

      {/* Featured netas & parties */}
      <section className="space-y-6">
        <h2 className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-saffron-500 text-transparent bg-clip-text">
          Featured netas &amp; parties
        </h2>

        <div className="space-y-8">
          {/* Top netas: 4 across */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Top netas</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {featuredNetas.map((p) => (
                <CardPolitician key={p.id} p={p} />
              ))}
            </div>
          </div>

          {/* Top parties: 4 across */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Top parties</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch">
              {featuredParties.map((party) => (
                <CardParty key={party.id} party={party} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Latest netas & parties (two columns, each 2x2) */}
      <section className="space-y-6">
        <h2 className="text-2xl md:text-3xl font-extrabold">Latest netas &amp; parties</h2>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Latest netas: 2x2 */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Latest netas</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {latestNetas.map((p) => (
                <CardPolitician key={p.id} p={p} />
              ))}
            </div>
          </div>

          {/* Latest parties: 2x2 */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Latest parties</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-stretch">
              {latestParties.map((party) => (
                <CardParty key={party.id} party={party} />
              ))}
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
  );
}
