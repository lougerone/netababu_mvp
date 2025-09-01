// app/(site)/compare/page.tsx
import { listPoliticians, type Politician } from '@/lib/airtable';

// Keep this route dynamic (fresh Airtable data)
export const dynamic = 'force-dynamic';

type Params = { a?: string; b?: string };

function pickBySlugOrId(list: Politician[], key?: string): Politician | undefined {
  if (!key) return undefined;
  const k = key.trim().toLowerCase();
  return list.find(
    (p) => p.id.toLowerCase() === k || p.slug.toLowerCase() === k
  );
}

export default async function Page({
  searchParams,
}: {
  searchParams?: Params;
}) {
  let all: Politician[] = [];
  try {
    all = await listPoliticians();
  } catch (err) {
    console.error('Compare: failed to load politicians', err);
  }

  // Resolve A/B via query first, then fall back to first two
  const A =
    pickBySlugOrId(all, searchParams?.a) ??
    (all.length > 0 ? all[0] : undefined);
  const B =
    pickBySlugOrId(all, searchParams?.b) ??
    (all.length > 1 ? all[1] : undefined);

  // Your CompareTable currently wants exactly { a, b }
  const CompareTable =
    (await import('@/components/CompareTable')).default as React.ComponentType<{
      a: Politician | null;
      b: Politician | null;
    }>;

  return <CompareTable a={A ?? null} b={B ?? null} />;
}
