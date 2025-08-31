// lib/data.ts
import type { Party } from '@/lib/airtable';
import { listRecentParties } from '@/lib/airtable';

// Fetch the latest 4 parties from Airtable
export async function getHomeParties(): Promise<Party[]> {
  return listRecentParties(4);
}
