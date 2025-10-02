// lib/data.ts
import type { Party } from '@/lib/airtable';
import { listRecentParties } from '@/lib/airtable';

// Fetch the latest 4 parties from Airtable
export async function getHomeParties(): Promise<Party[]> {
  return listRecentParties(4);
}

const firstUrl = (v: any): string | undefined => {
  if (!v) return;
  if (typeof v === 'string') return v;
  if (Array.isArray(v)) return v[0]?.url || v[0]?.thumbnails?.full?.url;
  if (typeof v === 'object') return v.url || v.thumbnails?.full?.url;
};

export function pickPartyLogo(p: Party): string | undefined {
  return (
    firstUrl((p as any).logo) ||
    firstUrl((p as any)['logo url']) ||
    firstUrl((p as any).symbol) ||
    firstUrl((p as any).image) ||
    firstUrl((p as any).photo) ||
    undefined
  );
}

export const proxyImage = (u?: string) =>
  u ? `/api/proxy-image?u=${encodeURIComponent(u)}` : undefined;
