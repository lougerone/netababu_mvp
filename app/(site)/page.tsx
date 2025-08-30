import Link from 'next/link';
import { parties, politicians } from '@/lib/data';
import CardPolitician from '@/components/CardPolitician';
import CardParty from '@/components/CardParty';

export default function HomePage() {
  return (
    <div className="space-y-10">
      {/* Hero (styled) */}
     <section className="text-center space-y-4 relative">
  <div className="h-kicker">India • Politics • Data</div>
  <h1 className="text-4xl md:text-5xl font-semibold text-ink-700">
    Netas, parties, drama — all in one place.
  </h1>
  {/* optional Hindi subline */}
  <div className="text-saffron-600 text-xl md:text-2xl font-semibold">
    नेताजी, पार्टियाँ और इंफो — एक ही जगह
  </div>

  <div className="max-w-2xl mx-auto mt-3 flex gap-2">
    <input className="input-pill" placeholder="Search politicians, parties…" />
    <button className="btn">Search</button>
  </div>

  <div className="text-sm text-ink-600/80">
    Popular: <Link href="/politicians?query=modi" className="underline">Modi</Link> •{' '}
    <Link href="/parties?query=inc" className="underline">INC</Link>
  </div>
</section>

{/* Explore cards: add playful icons via emoji for now */}
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


      {/* Explore blocks */}
      <section className="grid md:grid-cols-3 gap-4">
        <div className="card p-5">
          <h3 className="font-medium mb-2">Explore by Party</h3>
          <p className="text-sm text-white/70 mb-3">Browse active & latent parties.</p>
          <Link href="/parties" className="underline">View all →</Link>
        </div>
        <div className="card p-5">
          <h3 className="font-medium mb-2">Explore by State</h3>
          <p className="text-sm text-white/70 mb-3">Filter politicians by state.</p>
          <Link href="/politicians?state=MH" className="underline">Try Maharashtra →</Link>
        </div>
        <div className="card p-5">
          <h3 className="font-medium mb-2">Trending Comparisons</h3>
          <p className="text-sm text-white/70 mb-3">Side-by-side facts.</p>
          <Link href="/compare" className="underline">Compare leaders →</Link>
        </div>
      </section>

      {/* Featured / Recently Updated */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Featured / Recently Updated</h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
          {politicians.slice(0, 2).map((p) => (
            <CardPolitician key={p.id} p={p} />
          ))}
          {parties.slice(0, 2).map((p) => (
            <CardParty key={p.id} party={p} />
          ))}
        </div>
      </section>

      {/* Sources */}
      <section className="space-y-2">
        <h2 className="text-xl font-semibold">Sources</h2>
        <p className="text-sm text-white/70">
          ECI • PRS • Lok Sabha / NIC • State ECs • News archives • Census/NSS
        </p>
      </section>
    </div>
  );
}
