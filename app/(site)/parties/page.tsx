// app/(site)/parties/page.tsx
import { listParties } from '@/lib/supabase';
import PartiesExplorer from './PartiesExplorer';
import type { Party } from '@/lib/supabase';

export const revalidate = Number(process.env.REVALIDATE_SECONDS || 3600);

export default async function PartiesPage({
  searchParams,
}: { searchParams?: { q?: string | string[] } }) {
  const q =
    typeof searchParams?.q === 'string'
      ? searchParams.q
      : Array.isArray(searchParams?.q)
      ? searchParams.q[0]
      : '';

  const parties = await listParties({ query: q || undefined, limit: 1000 });

  // If PartiesExplorer has a narrower prop type, you can keep this cast:
  return <PartiesExplorer initialParties={parties as any} initialQuery={q} />;
}
