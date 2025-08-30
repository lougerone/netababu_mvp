// app/(site)/politicians/page.tsx

import { listPoliticians } from '@/lib/airtable';
import PoliticiansClient from './Client';

/**
 * Use dynamic rendering to ensure this page fetches data at request time,
 * rather than during the build. Set REVALIDATE_SECONDS in your environment
 * if you want incremental static regeneration instead.
 */
export const dynamic = 'force-dynamic';

export default async function PoliticiansPage() {
  // Fetch all politicians from Airtable on the server
  const allPoliticians = await listPoliticians();

  // Pass the data to a client component that handles search/filtering
  return <PoliticiansClient initialData={allPoliticians} />;
}
