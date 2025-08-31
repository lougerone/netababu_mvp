// app/(site)/parties/page.tsx
// This index page lists all parties and passes the data to a client component for search/filtering.

import PartiesClient from './Client';
import { listParties } from '@/lib/airtable';
import { fetchParties } from '@/lib/airtable-parties';

/**
 * Use dynamic rendering so this page fetches Airtable data at request time.
 */
export const dynamic = 'force-dynamic';

export default async function PartiesPage() {
  // Fetch all parties from Airtable on the server. The token remains server-side.
  const allParties = await listParties();
  return <PartiesClient initialData={allParties} />;
  
  // Note: The code below is unreachable due to the return statement above
  // You may want to remove this or restructure the logic
  const parties = await fetchParties();
  return <PartyGrid parties={parties} />;
}
