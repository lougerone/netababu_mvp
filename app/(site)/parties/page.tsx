// ---- Party type + helpers ----
export type Party = {
  id: string;
  slug: string;
  name: string;
  abbr?: string;
  status?: string;
  founded?: string;
  logo?: string;
  raw?: Record<string, any>;
};

const toSlug = (s = '') =>
  s.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

function firstNonEmpty(f: Record<string, any>, keys: string[]) {
  for (const k of keys) {
    const v = f[k];
    if (typeof v === 'string' && v.trim()) return v.trim();
  }
  return undefined;
}

// grab the first attachment that looks like an image from ANY column
function findImageUrl(f: Record<string, any>) {
  for (const v of Object.values(f)) {
    if (Array.isArray(v) && v.length && v[0] && typeof v[0] === 'object') {
      const url = v[0].url;
      const type = v[0].type as string | undefined;
      if (typeof url === 'string' && url && (!type || type.startsWith('image/'))) {
        return url;
      }
    }
    if (typeof v === 'string' && /^https?:\/\//.test(v) && /(\.png|\.jpg|\.jpeg|\.webp|upload\.wikimedia|airtableusercontent)/i.test(v)) {
      return v;
    }
  }
  return undefined;
}

function normalizeParty(rec: any): Party {
  const f = rec.fields ?? rec;

  // try the common names first; then fall back to any key that contains name/party
  const name =
    firstNonEmpty(f, ['Party Name', 'Name', 'Party', 'party_name', 'party']) ||
    Object.keys(f)
      .filter((k) => /name|party/i.test(k))
      .map((k) => String(f[k]))
      .find((s) => s && s.trim()) ||
    '';

  const abbr =
    firstNonEmpty(f, ['Abbreviation', 'Abbr', 'Short Name', 'Acronym']) ||
    undefined;

  const status =
    firstNonEmpty(f, ['Status', 'Recognition', 'Type']) || undefined;

  const founded =
    firstNonEmpty(f, ['Founded', 'Formed', 'Established', 'Year Founded']) ||
    undefined;

  const logo =
    findImageUrl(
      {
        Logo: f['Logo'],
        Symbol: f['Symbol'],
        Emblem: f['Emblem'],
        Image: f['Image'],
        ...f, // fallback scan across everything
      } as any
    ) || undefined;

  const slug = toSlug(f['Slug'] ?? name);

  return {
    id: rec.id ?? slug,
    name,
    abbr,
    status,
    founded,
    logo,
    slug,
    raw: f,
  };
}

export async function listParties(): Promise<Party[]> {
  const url = `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/${encodeURIComponent(
    process.env.AIRTABLE_PARTIES_TABLE!
  )}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${process.env.AIRTABLE_API_KEY!}` },
    cache: 'no-store', // or { next: { revalidate: 86400 } }
  });
  const json = await res.json(); // { records: [...] }
  return (json.records ?? []).map(normalizeParty);
}
