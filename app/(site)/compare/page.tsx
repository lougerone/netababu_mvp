// app/(site)/compare/page.tsx
import CompareTable from '@/components/CompareTable';
import { listPoliticians, type Politician } from '@/lib/airtable';

export const dynamic = 'force-dynamic';

export default async function Page() {
  let politicians: Politician[] = [];
  try {
    politicians = await listPoliticians();
  } catch (err) {
    console.error('Compare: failed to load politicians', err);
  }
  return <CompareTable politicians={politicians} />;
}
