import { listPoliticians, listParties } from '@/lib/airtable';
import CardPolitician from '@/components/CardPolitician';
import CardParty from '@/components/CardParty';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

interface SearchPageProps {
  searchParams: { query?: string };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const query = searchParams.query?.trim() || '';

  if (!query) {
    // No query → show a friendly fallback
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold mb-4">Search</h1>
        <p className="text-ink-600/80">
          Please enter a name, party, or keyword in the search bar above.
        </p>
      </div>
    );
  }

  // Call Airtable with query
  const [pols, pars] = await Promise.all([
    listPoliticians({ query }),
    listParties({ query }),
  ]);

  if (!pols.length && !pars.length) {
    // No matches → 404 or empty state
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold mb-4">No results</h1>
        <p className="text-ink-600/80">
          We couldn’t find anything for <span className="font-semibold">“{query}”</span>.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 space-y-12">
      <h1 className="text-2xl font-bold mb-6">
        Results for “{query}”
      </h1>

      {pols.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold mb-3">Politicians</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {pols.map((p) => (
              <CardPolitician key={p.id} p={p} />
            ))}
          </div>
        </section>
      )}

      {pars.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold mb-3">Parties</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {pars.map((party) => (
              <CardParty key={party.id} party={party} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
