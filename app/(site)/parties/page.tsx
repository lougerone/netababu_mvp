// app/(site)/parties/page.tsx
import { listParties, type Party } from '@/lib/airtable';
import PartiesExplorer from './PartiesExplorer';

export const revalidate = Number(process.env.REVALIDATE_SECONDS || 3600);
// or: export const dynamic = 'force-dynamic';

export default async function PartiesPage({
  searchParams,
}: {
  searchParams?: { q?: string | string[] };
}) {
  // Normalize ?q=
  const q =
    typeof searchParams?.q === 'string'
      ? searchParams.q
      : Array.isArray(searchParams?.q)
      ? searchParams.q[0]
      : '';

  // Pull a large batch so client filters feel instant
  const parties: Party[] = await listParties({ query: q || undefined, limit: 1000 });
  const logo = proxyImage(pickPartyLogo(party));
  <AvatarSquare variant="party" src={logo} alt={party.name} size={40} rounded="rounded-lg" />
  
  return <PartiesExplorer initialParties={parties} initialQuery={q} />;
}
