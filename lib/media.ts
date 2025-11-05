// lib/media.ts
// no 'server-only' here; remains client-safe
export { pickPoliticianPhotoUrl, pickPartyLogoUrl, partyBadgeLabel } from './data';

// allow-listed URL schemes for string inputs
const ALLOWED_SCHEMES = /^(https?:\/\/|data:|\/)/i;

export const firstUrl = (v: unknown): string | undefined => {
  if (!v) return;
  if (typeof v === 'string') return ALLOWED_SCHEMES.test(v.trim()) ? v.trim() : undefined;
  if (Array.isArray(v)) {
    const a: any = v[0];
    return a?.url || a?.thumbnails?.full?.url || a?.thumbnails?.large?.url || a?.thumbnails?.small?.url;
  }
  if (typeof v === 'object') {
    const o: any = v;
    return o?.url || o?.thumbnails?.full?.url || o?.thumbnails?.large?.url || o?.thumbnails?.small?.url;
  }
};

export function pickPartyLogoUrl(p: Record<string, unknown>): string | undefined {
  return (
    firstUrl(p.logo_url) ||
    firstUrl(p['logo url']) ||
    firstUrl(p.logoUrl) ||
    firstUrl(p.cdn_logo) ||
    firstUrl(p.logo_cdn) ||
    firstUrl(p.logo) ||
    firstUrl(p.symbol) ||
    firstUrl(p.image) ||
    firstUrl(p.photo) ||
    undefined
  );
}

type AnyRec = Record<string, unknown>;
const firstNonEmpty = (obj: AnyRec, keys: string[]): string => {
  for (const k of keys) {
    const v = obj?.[k];
    if (v != null) {
      const s = String(v).trim();
      if (s !== '') return s;
    }
  }
  return '';
};

export const roleText = (pol: AnyRec): string =>
  firstNonEmpty(pol, ['current_position', 'position', 'role', 'title', 'office', 'designation', 'post']);

export const findRole = (pols: AnyRec[], role: 'pm' | 'president' | 'home' | 'lop') => {
  const withText = pols.map((p) => ({ p, t: roleText(p) }));
  if (role === 'pm') return withText.find(({ t }) => /\bprime\s*minister\b/i.test(t))?.p;
  if (role === 'home') return withText.find(({ t }) => /\bhome\s+minister\b/i.test(t))?.p;
  if (role === 'president') {
    return withText.find(({ t }) => {
      const hasOffice = /\bPresident of India\b/i.test(t);
      const isVice = /\bVice\s+President\b/i.test(t);
      const hasQualifier = /\b(Ex|Former|Acting|Deputy|Pro\s*Tem|Past|Emeritus)\b\.?\s*/i.test(t);
      const isPartyTitle = /\bparty\s+president\b/i.test(t) || /\b[A-Z]{2,7}\b\s+President\b/.test(t);
      return hasOffice && !isVice && !hasQualifier && !isPartyTitle;
    })?.p;
  }
  const lopLS = withText.find(
    ({ t }) => /\bleader\s+of\s+opposition\b/i.test(t) && /(?:lok\s*sabha|people'?s\s+house)/i.test(t),
  )?.p;
  return lopLS ?? withText.find(({ t }) => /\bleader\s+of\s+opposition\b/i.test(t))?.p;
};
