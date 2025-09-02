import CompareTable from '@/components/CompareTable';
import { listPoliticians, type Politician } from '@/lib/airtable';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const politicians: Politician[] = await listPoliticians({ limit: 500 }).catch(() => [] as Politician[]);

  return (
    <div className="mx-auto max-w-6xl px-4">
      <h2 className="text-2xl md:text-3xl font-extrabold text-saffron-600 mb-4">
        Compare Netas
      </h2>

      {/* Card shell keeps table from blowing out the layout */}
      <section className="rounded-2xl bg-white border border-black/10 overflow-hidden">
        <CompareTable politicians={politicians} />
      </section>
    </div>
  );
}
