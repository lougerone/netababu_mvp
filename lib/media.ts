// lib/media.ts
// Client-safe helpers for extracting image URLs from record-like objects.
// No server imports here — safe to use in Client Components.

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

/** Generic picker: try several field names in order and return the first valid https URL */
function pickFromFields(obj: RecordLike, fields: string[]): string | undefined {
  for (const f of fields) {
    const v = obj?.[f];
    const u = firstUrl(v);
    if (u) return u;
  }
  return undefined;
}

/** Best photo URL for a politician-like object */
export function pickPoliticianPhotoUrl(p: RecordLike): string | undefined {
  // If you already map `photo` to a direct URL, this will return fast.
  return (
    p.photo ||
    pickFromFields(p, ['Photo', 'Image', 'Images', 'Attachments', 'picture']) ||
    undefined
  );
}

/** Best logo URL for a party-like object */
export function pickPartyLogoUrl(p: RecordLike): string | undefined {
  // Prefer normalized `logo`, then look through common Airtable fields.
  return (
    p.logo ||
    pickFromFields(p, ['Symbol', 'Logo', 'Emblem', 'Image', 'Images', 'Attachments']) ||
    undefined
  );
}

/** Text to show inside the avatar square if no image is available */
export function partyBadgeLabel(p: RecordLike): string {
  const abbr = (p.abbr ?? p.ticker ?? p.Ticker ?? '').toString().trim();
  if (abbr) return abbr;
  const name: string = (p.name ?? p.Name ?? '').toString();
  return name ? name.slice(0, 3).toUpperCase() : '—';
}

/** Optional: single entry point if you want a generic avatar picker */
export function pickAvatarSrc(
  obj: RecordLike,
  kind: 'party' | 'person' | 'auto' = 'auto'
): string | undefined {
  if (kind === 'party') return pickPartyLogoUrl(obj);
  if (kind === 'person') return pickPoliticianPhotoUrl(obj);
  // auto: party if it has 'abbr' or 'Ticker', else person
  const looksParty = 'abbr' in obj || 'Ticker' in obj || 'ticker' in obj;
  return looksParty ? pickPartyLogoUrl(obj) : pickPoliticianPhotoUrl(obj);
}
