import 'server-only';
import type { Party } from '@/lib/airtable';
import { listRecentParties } from '@/lib/airtable';

export async function getHomeParties(): Promise<Party[]> {
  return listRecentParties(4);
}
