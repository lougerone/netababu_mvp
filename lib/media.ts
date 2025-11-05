// lib/media.ts

type MaybeAttach =
  | { url?: string; filename?: string; type?: string; [k: string]: any }
  | string
  | null
  | undefined;

type RecordLike = Record<string, any>;

function firstUrl(val: MaybeAttach | MaybeAttach[]): string | undefined {
  if (!val) return undefined;

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

  if (typeof val === 'string') return /^https?:\/\//i.test(val) ? val : undefined;
  if (val && typeof val === 'object' && val.url && /^https?:\/\//i.test(val.url)) {
    return String(val.url);
  }
  return undefined;
}

function pickFromFields(obj: RecordLike, fields: string[]): string | undefined {
  for (const f of fields) {
    const u = firstUrl(obj?.[f]);
    if (u) return u;
  }
  return undefined;
}

export function pickPartyLogoUrl(p: RecordLike): string | undefined {
  return (
    firstUrl(p.logo) ||                           // ✅ changed: treat 'logo' as attachment/string
    pickFromFields(p, ['Symbol', 'Logo', 'Emblem', 'Image', 'Images', 'Attachments']) ||
    undefined
  );
}

export function partyBadgeLabel(p: RecordLike): string {
  const abbr = (p.abbr ?? p.ticker ?? p.Ticker ?? '').toString().trim();
  if (abbr) return abbr;
  const name: string = (p.name ?? p.Name ?? '').toString();
  return name ? name.slice(0, 3).toUpperCase() : '—';
}
