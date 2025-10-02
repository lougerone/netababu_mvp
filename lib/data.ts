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
export function proxyImage(url: string | null | undefined): string | undefined {
  if (!url) return undefined;

  // If it's already a data URI or relative path, return as-is
  if (url.startsWith('data:') || url.startsWith('/')) return url;

  // Only proxy allowed domains
  try {
    const parsed = new URL(url);
    const allowedHosts = [
      'v5.airtableusercontent.com',
      'dl.airtable.com',
      'upload.wikimedia.org'
    ];

    if (allowedHosts.includes(parsed.hostname)) {
      return /api/proxy?u=${encodeURIComponent(url)};
    }

    // If not an allowed host, return original (might fail CORS but at least tries)
    return url;
  } catch {
    // Invalid URL
    return undefined;
  }
