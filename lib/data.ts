// lib/data.ts
import type { Party } from '@/lib/airtable';
import { listRecentParties } from '@/lib/airtable';

// Fetch the latest 4 parties from Airtable
export async function getHomeParties(): Promise<Party[]> {
  return listRecentParties(4);
}

const firstUrl = (v: any): string | undefined => {
  if (!v) return undefined;
  
  // Handle string
  if (typeof v === 'string') {
    // Make sure it's a complete URL
    return v.startsWith('http') ? v : undefined;
  }
  
  // Handle array of attachments
  if (Array.isArray(v) && v.length > 0) {
    const first = v[0];
    // Try different possible URL fields in Airtable attachments
    const url = first?.url || first?.thumbnails?.large?.url || first?.thumbnails?.full?.url;
    return url && url.startsWith('http') ? url : undefined;
  }
  
  // Handle object
  if (typeof v === 'object' && v) {
    const url = v.url || v.thumbnails?.large?.url || v.thumbnails?.full?.url;
    return url && url.startsWith('http') ? url : undefined;
  }
  
  return undefined;
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
      return `/api/proxy?u=${encodeURIComponent(url)}`;
    }
    
    // If not an allowed host, return original (might fail CORS but at least tries)
    return url;
  } catch {
    // Invalid URL
    return undefined;
  }
}
