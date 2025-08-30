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
{/* Featured netas & parties */}
<section className="space-y-2 mt-8">
  <h2
    className="text-2xl md:text-3xl font-extrabold 
               bg-gradient-to-r from-purple-600 to-blue-500 
               text-transparent bg-clip-text"
  >
    Featured netas &amp; parties
  </h2>
  {/* Use a two-column grid on medium screens and above */}
  <div className="grid md:grid-cols-2 gap-8">
    {/* Left column: top politicians */}
    <div>
      <h3 className="text-lg font-semibold mb-2">Top netas</h3>
      <div className="grid md:grid-cols-2 gap-8">
        {politicians.slice(0, 3).map((p) => (
          <CardPolitician key={p.id} p={p} />
        ))}
      </div>
    </div>

    {/* Right column: top parties */}
    <div>
      <h3 className="text-lg font-semibold mb-2">Top parties</h3>
      <div className="grid sm:grid-cols-2 gap-4">
        {parties.slice(0, 3).map((party) => (
          <CardParty key={party.id} party={party} />
        ))}
      </div>
    </div>
  </div>
</section>

      {/* Sources */}
<section className="space-y-2 mt-8">
  <h2 className="text-xl font-semibold">Sources</h2>
  <p className="text-sm text-ink-600/80 space-x-2">
    <Link href="https://eci.gov.in" className="underline">ECI</Link> •
    <Link href="https://prsindia.org" className="underline">PRS</Link> •
    <Link href="https://loksabha.nic.in" className="underline">Lok Sabha</Link> •
    <Link href="https://censusindia.gov.in" className="underline">Census</Link> •
    <Link href="https://mospi.gov.in" className="underline">NSS</Link>
  </p>
</section>


    </div>
  );
}
