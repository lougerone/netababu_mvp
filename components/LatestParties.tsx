// components/LatestParties.tsx
import { listRecentParties } from '@/lib/airtable';
import CardParty from '@/components/CardParty';

export default async function LatestParties({ limit = 5 }: { limit?: number }) {
  const parties = await listRecentParties(limit);

  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold">Latest parties</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {parties.map((p) => (
          <CardParty key={p.id} party={p} />
        ))}
      </div>
    </section>
  );
}
