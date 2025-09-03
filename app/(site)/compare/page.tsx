// app/compare/page.tsx
import CompareTable from '@/components/CompareTable';
import { listPoliticians, type Politician } from '@/lib/airtable';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const politicians: Politician[] = await listPoliticians({ limit: 500 }).catch(
    () => [] as Politician[]
  );

  return (
    <>
      {/* Non-blocking shield: sits above any page overlays, below header.
          Ensures header links are always clickable. */}
      <div
        aria-hidden
        className="fixed inset-x-0 top-0 h-16 z-[10000] pointer-events-none"
      />

      <div className="relative z-0 mx-auto max-w-6xl px-4">
        <h2 className="text-2xl md:text-3xl font-extrabold text-saffron-600 mb-4">
          Compare Netas
        </h2>
        <CompareTable politicians={politicians} />
      </div>
    </>
  );
}
