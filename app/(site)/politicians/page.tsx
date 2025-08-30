// app/(site)/politicians/page.tsx

import { listPoliticians } from '@/lib/airtable';
import PoliticiansClient from './Client';

// Use dynamic rendering so this page fetches fresh data at request time.
// Alternatively, set REVALIDATE_SECONDS in your env for ISR.
export const dynamic = 'force-dynamic';

export default async function PoliticiansPage() {
  const allPoliticians = await listPoliticians();
  return <PoliticiansClient initialData={allPoliticians} />;
}
