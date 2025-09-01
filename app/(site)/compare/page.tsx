// app/(site)/compare/page.tsx
import { listPoliticians, type Politician } from '@/lib/airtable';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const all: Politician[] = await listPoliticians().catch(() => [] as Politician[]);
  const a = all[0] ?? null;
  const b = all[1] ?? null;

  const CompareTable =
    (await import('@/components/CompareTable')).default as React.ComponentType<{
      a: Politician | null;
      b: Politician | null;
    }>;

  return (
    <>
      <h2 className="text-2xl md:text-3xl font-extrabold text-saffron-600 mb-4">
        Compare Netas
      </h2>
      <CompareTable a={a} b={b} />
    </>
  );
}
