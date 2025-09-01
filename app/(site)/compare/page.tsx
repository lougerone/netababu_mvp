// app/(site)/compare/page.tsx
import CompareTable from '@/components/CompareTable';
import { listPoliticians, type Politician } from '@/lib/airtable';

export const dynamic = 'force-dynamic';

export default async function ComparePage() {
  const politicians: Politician[] = await listPoliticians().catch(() => [] as Politician[]);
  return (
    <>
      <h2 className="text-2xl md:text-3xl font-extrabold text-saffron-600 mb-4">
        Compare Netas
      </h2>
      <CompareTable politicians={politicians} />
    </>
  );
}
