// lib/data.ts
import type { Party } from '@/lib/airtable';
import { listRecentParties } from '@/lib/airtable';

/** Fetch the latest 4 parties for the homepage */
export async function getHomeParties(): Promise<Party[]> {
  return listRecentParties(4);
}

/* ──────────────────────────────
   Attachment / URL helpers
   ────────────────────────────── */

/** Safely extract a URL string from a value that may be:
 *  - a plain string URL
 *  - an Airtable attachment array/object with { url, thumbnails }
 */
export const firstUrl = (v: any): string | undefined => {
  if (!v) return;
  if (typeof v === 'string') return v.trim();
  if (Array.isArray(v)) return v[0]?.url || v[0]?.thumbnails?.full?.url || v[0]?.thumbnails?.large?.url;
  if (typeof v === 'object') return v.url || v.thumbnails?.full?.url || v.thumbnails?.large?.url;
};

/** Pick a party logo URL from common fields (works with Airtable attachments) */
export function pickPartyLogo(p: Party | Record<string, any>): string | undefined {
  const any = p as Record<string, any>;
  return (
    firstUrl(any.logo) ||
    firstUrl(any['logo url']) ||
    firstUrl(any.symbol) ||
    firstUrl(any.image) ||
    firstUrl(any.photo) ||
    undefined
  );
}

/** Wrap a remote image URL with our proxy endpoint (prevents Airtable URL expiry) */
export function proxyImage(url: string | null | undefined): string | undefined {
  if (!url) return undefined;
  
  if (url.startsWith('data:') || url.startsWith('/')) return url;
  
  try {
    const parsed = new URL(url);
    const allowedHosts = [
      'v5.airtableusercontent.com',
      'dl.airtable.com',
      'upload.wikimedia.org',
      'www.netababu.com',  // <-- Add this
      'netababu.com',      // <-- Add this
    ];
    
    if (allowedHosts.includes(parsed.hostname)) {
      return `/api/proxy?u=${encodeURIComponent(url)}`;
    }
    
    return url;
  } catch {
    return undefined;
  }
}

/* ──────────────────────────────
   Optional: role helpers (used by Featured)
   ────────────────────────────── */

type AnyRec = Record<string, any>;

const firstNonEmpty = (obj: AnyRec, keys: string[]) => {
  for (const k of keys) {
    const v = obj?.[k];
    if (v != null && String(v).trim() !== '') return v;
  }
  return '';
};

export const roleText = (pol: AnyRec): string =>
  String(
    firstNonEmpty(pol, [
      'current_position',
      'position',
      'role',
      'title',
      'office',
      'designation',
      'post',
    ]),
  ).trim();

/** Find specific constitutional roles with strict matching */
export const findRole = (
  pols: AnyRec[],
  role: 'pm' | 'president' | 'home' | 'lop',
) => {
  if (role === 'pm') return pols.find((p) => /\bprime\s*minister\b/i.test(roleText(p)));
  if (role === 'home') return pols.find((p) => /\bhome\s+minister\b/i.test(roleText(p)));

  if (role === 'president') {
    // Exactly "President of India" and not Vice/Ex/Acting/Deputy/etc.
    return pols.find((p) => {
      const t = roleText(p);
      const hasOffice = /\bPresident of India\b/i.test(t);
      const isVice = /\bVice\s+President\b/i.test(t);
      const hasQualifier = /\b(Ex|Former|Acting|Deputy|Pro\s*Tem|Past|Emeritus)\b\.?\s*/i.test(t);
      const isPartyTitle = /\bparty\s+president\b/i.test(t) || /\b[A-Z]{2,7}\b\s+President\b/.test(t);
      return hasOffice && !isVice && !hasQualifier && !isPartyTitle;
    });
  }

  // Leader of Opposition: prefer Lok Sabha if explicitly mentioned
  const lopLS = pols.find(
    (p) =>
      /\bleader\s+of\s+opposition\b/i.test(roleText(p)) &&
      /\blok\s*sabha|people'?s\s+house/i.test(roleText(p)),
  );
  if (lopLS) return lopLS;

  return pols.find((p) => /\bleader\s+of\s+opposition\b/i.test(roleText(p)));
};
