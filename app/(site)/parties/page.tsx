// app/(site)/parties/page.tsx
import PartiesClient from './Client';
import { fetchParties } from '@/lib/airtable-parties'; // normalized fetch

// Render at request-time (Airtable updates show up immediately)
export const dynamic = 'force-dynamic';

export default async function PartiesPage() {
  const parties = await fetchParties(); // returns normalized Party[]
  return <PartiesClient initialData={parties} />;
}
