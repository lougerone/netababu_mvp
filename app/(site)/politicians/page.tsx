// app/(site)/politicians/page.tsx

import { listPoliticians } from '@/lib/airtable';
import PoliticiansClient from './Client';

// Use dynamic rendering so the page fetches fresh data at request time.
// Alternatively, you can use ISR with revalidate if you prefer.
export const dynamic = 'force-dynamic';

export default async function PoliticiansPage() {
  // Fetch data from Airtable on the server
  const allPoliticians = await listPoliticians();

  // Pass it to the client component (which handles search/filtering)
  return <PoliticiansClient initialData={allPoliticians} />;
}
