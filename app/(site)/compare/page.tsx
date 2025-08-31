// Server wrapper: fetch on the server, render client table with props.
import { listPoliticians } from '@/lib/airtable';

// Import as `any` so TS doesn’t block on prop name differences.
const CompareTable = (await import('@/components/CompareTable')).default as any;

export const dynamic = 'force-dynamic';

export default async function ComparePage() {
  const politicians = await listPoliticians(); // pull full list (paginate in the table if needed)
  // Pass under a neutral prop name to avoid coupling; adjust inside CompareTable as needed.
  return <CompareTable politicians={politicians} />;
}
