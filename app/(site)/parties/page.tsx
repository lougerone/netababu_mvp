// app/(site)/parties/page.tsx
import { listParties, type Party } from '@/lib/airtable';
import PartiesExplorer from './PartiesExplorer';

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

  const parties: Party[] = await listParties({ query: q || undefined, limit: 1000 });

  return <PartiesExplorer initialParties={parties} initialQuery={q} />;
}
