// lib/data.ts
// Pure, client-safe helpers. No server imports.

type MaybeAttach =
  | { url?: string; filename?: string; type?: string; [k: string]: any }
  | string
  | null
  | undefined;

type RecordLike = Record<string, any>;

/** Return first https URL from a value that might be an attachment array or a string URL */
function firstUrl(val: MaybeAttach | MaybeAttach[]): string | undefined {
  if (!val) return undefined;

  // Array of attachments/strings
  if (Array.isArray(val)) {
    for (const item of val) {
      const u =
        typeof item === 'string'
          ? item
          : item && typeof item === 'object' && item.url
          ? String(item.url)
          : undefined;
      if (u && /^https?:\/\//i.test(u)) return u;
    }
    return undefined;
  }

  // Single attachment or string
  if (typeof val === 'string') return /^https?:\/\//i.test(val) ? val : undefined;
  if (val && typeof val === 'object' && val.url && /^https?:\/\//i.test(val.url)) {
    return String(val.url);
  }
  return undefined;
}

/** Pick best photo for a politician-like object */
export function pickPoliticianPhotoUrl(p: RecordLike): string | undefined {
  return (
    p.photo ||
    firstUrl(p.Photo) ||
    firstUrl(p.Image) ||
    firstUrl(p.Images) ||
    firstUrl(p.Attachments) ||
    firstUrl(p.picture) ||
    undefined
  );
}

/** Pick best logo for a party-like object (works with Airtable attachment arrays or normalized `logo`) */
export function pickPartyLogoUrl(p: RecordLike): string | undefined {
  return (
    p.logo ||
    firstUrl(p.Symbol) ||
    firstUrl(p.Logo) ||
    firstUrl(p.Emblem) ||
    firstUrl(p.Image) ||
    firstUrl(p.Images) ||
    firstUrl(p.Attachments) ||
    undefined
  );
}

/** Small helper: what label should we show inside the square if no image? */
export function partyBadgeLabel(p: RecordLike): string {
  const abbr = (p.abbr ?? p.ticker ?? p.Ticker ?? '').toString().trim();
  if (abbr) return abbr;
  const name: string = (p.name ?? p.Name ?? '').toString();
  return name ? name.slice(0, 3).toUpperCase() : '—';
}
