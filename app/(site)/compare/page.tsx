// app/(site)/compare/page.tsx
import CompareTable from '@/components/CompareTable';
import { listPoliticians } from '@/lib/airtable';

export const dynamic = 'force-dynamic';

export default async function Page() {
  let politicians = [];
  try {
    // Pull a good chunk; the table can handle filtering/toggling client-side
    politicians = await listPoliticians();
  } catch (err) {
    // Don’t crash the route if Airtable hiccups
    console.error('Compare: failed to load politicians', err);
  }

  return <CompareTable politicians={politicians} />;
}
