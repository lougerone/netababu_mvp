import Link from 'next/link';
import SearchBar from '@/components/SearchBar';
import { parties, politicians } from '@/lib/data';
import CardPolitician from '@/components/CardPolitician';
import CardParty from '@/components/CardParty';

export default function HomePage() {
  return (
    <div className="space-y-10">
      {/* Hero search */}
      <section className="text-center space-y-4">
        <h1 className="text-3xl md:text-4xl font-semibold">India’s political data, simplified.</h1>
        <p className="text-white/70">Discover life events, track parties, compare leaders, share verified facts.</p>
        <div className="max-w-2xl mx-auto"><SearchBar /></div>
        <div className="text-sm text-white/60">Popular: <Link href="/politicians?query=modi" className="underline">Modi</Link> • <Link href="/parties?query=inc" className="underline">INC</Link></div>
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
          <p className="text-sm text-white/70 mb-3">Side‑by‑side facts.</p>
          <Link href="/compare" className="underline">Compare leaders →</Link>
        </div>
      </section>

<section className="text-center space-y-4 relative 
  bg-[radial-gradient(1200px_600px_at_80%_-10%,rgba(15,125,166,.25),transparent)]">
  <div className="h-kicker">India • Politics • Data</div>
  <h1 className="text-3xl md:text-4xl font-semibold h-underline">
    India’s political data, simplified.
  </h1>
  <p className="text-white/70">Discover life events, track parties, compare leaders, share verified facts.</p>
  <div className="max-w-2xl mx-auto">
    <div className="flex gap-2">
      <input
        className="w-full rounded-full bg-white/5 border border-white/15 p-3 outline-none focus:border-brand-500/50"
        placeholder="Search politicians, parties…"
      />
      <button className="btn rounded-full">Search</button>
    </div>
  </div>
  <div className="text-sm text-white/60">
    Popular: <Link href="/politicians?query=modi" className="underline">Modi</Link> • <Link href="/parties?query=inc" className="underline">INC</Link>
  </div>
</section>

      
      {/* Featured / Recently Updated */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Featured / Recently Updated</h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
          {politicians.slice(0,2).map(p => (
            <CardPolitician key={p.id} p={p} />
          ))}
          {parties.slice(0,2).map(p => (
            <CardParty key={p.id} party={p} />
          ))}
        </div>
      </section>

      {/* Credible sources */}
      <section className="space-y-2">
        <h2 className="text-xl font-semibold">Sources</h2>
        <p className="text-sm text-white/70">ECI • PRS • Lok Sabha / NIC • State ECs • News archives • Census/NSS</p>
      </section>
    </div>
  );
}
