// lib/airtable.ts
import 'server-only';

/* ----------------------------- Small helpers ----------------------------- */

function parseList(value: any): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    return value.split(/[,\n]/).map((item) => item.trim()).filter(Boolean);
  }
  return [];
}

const AIRTABLE_API = 'https://api.airtable.com/v0';
const BASE_ID = process.env.AIRTABLE_BASE_ID!;
const TOKEN = process.env.AIRTABLE_TOKEN!;

const T_POL = process.env.AIRTABLE_TABLE_POLITICIANS || 'Politicians';
const T_PAR = process.env.AIRTABLE_TABLE_PARTIES || 'Parties';

const toSlug = (s = '') =>
  s.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

function firstNonEmpty(f: Record<string, any>, keys: string[]) {
  for (const k of keys) {
    const v = f[k];
    if (typeof v === 'string' && v.trim()) return v.trim();
  }
  return undefined;
}

function getFirstAttachmentUrl(v: any): string | undefined {
  if (Array.isArray(v) && v.length && v[0]?.url) return v[0].url as string;
  if (typeof v === 'string' && /^https?:\/\//.test(v)) return v;
  return undefined;
}

async function atFetch(
  table: string,
  params: Record<string, string | undefined> = {}
) {
  const search = new URLSearchParams(params as Record<string, string>);
  const url = `${AIRTABLE_API}/${BASE_ID}/${encodeURIComponent(table)}?${search.toString()}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${TOKEN}` },
    // Cache behavior controlled per page via Next's ISR; keep a sane default here
    next: { revalidate: Number(process.env.REVALIDATE_SECONDS || 3600) },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Airtable error ${res.status}: ${text}`);
  }
  return (res.json() as Promise<{ records: any[]; offset?: string }>);
}

/* --------------------------------- Types --------------------------------- */

export type Attachment = {
  url: string;
  filename?: string;
  width?: number;
  height?: number;
};

export type Politician = {
  id: string;
  slug: string;
  name: string;
  dob?: string | null;
  offices?: string[];
  life_events?: string | null;
  photo?: string;
  links?: string[];
  party: string;
  state?: string;
  current_position?: string;
  position?: string;
  constituency?: string;
  age?: number | string | null;
  yearsInPolitics?: number | string | null;
  attendance?: string | null;
  assets?: string | null;
  liabilities?: string | null;
  criminalCases?: number | string | null;
  website?: string | null;
};

export type Party = {
  id: string;
  slug: string;
  name: string;
  abbr?: string;
  status?: string | null;
  founded?: string | null;
  logo?: string | null;   // what the UI expects
  leaders?: string[];
};

/* --------------------------- Record mappers ------------------------------- */

function mapPolitician(r: any): Politician {
  const f = r.fields || {};
  const getFirst = (arr?: any[]) => (Array.isArray(arr) && arr.length ? arr[0] : null);

  return {
    id: r.id,
    slug: f.slug || toSlug(f.name || '') || r.id,
    name: f.name || '',
    dob: f.dob || f.DOB || null,
    offices: parseList(f.offices),
    life_events: f.life_events || null,
    photo: (() => {
      const att = getFirst(f.photo || f.Photo);
      return att && att.url ? (att.url as string) : undefined;
    })(),
    links: parseList(f.links),
    party: (f.Party || f.party || '') as string,
    state: f.Constituency || f.state,
    current_position: f.Position || f.position,
    position: f.Position || f.position,
    constituency: f.Constituency || f.constituency,
    age: f.Age || f.age,
    yearsInPolitics: f['Years in politics'] || f['Years in office'],
    attendance: f['% Parliament Attendance'] || f['Parliament Attendance'],
    assets: f['Declared Assets'] || f.assets,
    liabilities: f['Declared Liabilities'] || f.liabilities,
    criminalCases: f['Criminal Cases'] || f.criminalCases,
    website: f.Website || f.website,
  };
}

function mapParty(r: any): Party {
  const f = r.fields || {};

  const name =
    firstNonEmpty(f, ['Party Name', 'Name', 'Party', 'party_name', 'party']) || '';

  const abbr =
    firstNonEmpty(f, ['Abbreviation', 'Abbr', 'Acronym', 'Short Name', 'abbreviation', 'abbr']);

  const status =
    firstNonEmpty(f, ['Status', 'Recognition', 'Type']) || null;

  const founded =
    firstNonEmpty(f, ['Founded', 'Formed', 'Established', 'Year Founded']) || null;

  const logo =
    getFirstAttachmentUrl(f['Logo']) ||
    getFirstAttachmentUrl(f['Symbol']) ||
    getFirstAttachmentUrl(f['Emblem']) ||
    getFirstAttachmentUrl(f['Image']) ||
    getFirstAttachmentUrl(f['logo']) ||
    getFirstAttachmentUrl(f['image']) ||
    getFirstAttachmentUrl(f['symbol']) ||
    null;

  const leaders = Array.isArray(f['Leaders'])
    ? f['Leaders']
    : f['Leaders']
    ? String(f['Leaders']).split(/\n|,|;/).map((s: string) => s.trim()).filter(Boolean)
    : [];

  const slug = toSlug(f['Slug'] ?? name) || r.id;

  return { id: r.id, slug, name, abbr, status, founded, logo, leaders };
}

/* ------------------------- List / Get utilities -------------------------- */

export async function listPoliticians(opts: { limit?: number; query?: string } = {}): Promise<Politician[]> {
  const filter = opts.query
    ? `FIND(LOWER("${opts.query}"), LOWER({name}&" "&{slug}&" "&{offices}))`
    : undefined;

  const data = await atFetch(T_POL, {
    ...(filter ? { filterByFormula: filter } : {}),
    ...(opts.limit ? { maxRecords: String(opts.limit) } : {}),
  });

  return data.records.map(mapPolitician);
}

export async function listParties(opts: { limit?: number; query?: string } = {}): Promise<Party[]> {
  const filter = opts.query
    ? `FIND(LOWER("${opts.query}"), LOWER({name}&" "&{slug}&" "&{status}))`
    : undefined;

  const data = await atFetch(T_PAR, {
    ...(filter ? { filterByFormula: filter } : {}),
    ...(opts.limit ? { maxRecords: String(opts.limit) } : {}),
  });

  return data.records.map(mapParty);
}

export async function getPoliticianBySlug(slug: string): Promise<Politician | null> {
  const data = await atFetch(T_POL, { filterByFormula: `{slug} = "${slug}"` });
  const rec = data.records[0];
  return rec ? mapPolitician(rec) : null;
}

export async function getPartyBySlug(slug: string): Promise<Party | null> {
  const data = await atFetch(T_PAR, { filterByFormula: `{slug} = "${slug}"` });
  const rec = data.records[0];
  return rec ? mapParty(rec) : null;
}

export async function getPolitician(slugOrId: string): Promise<Politician | null> {
  // If the param looks like an Airtable record ID, fetch directly
  if (slugOrId.startsWith('rec')) {
    const url = `${AIRTABLE_API}/${BASE_ID}/${encodeURIComponent(T_POL)}/${slugOrId}`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${TOKEN}` } });
    if (!res.ok) return null;
    const data = await res.json();
    return mapPolitician(data);
  }
  // Otherwise, look up by slug
  const data = await atFetch(T_POL, { filterByFormula: `{slug} = "${slugOrId}"` });
  const rec = data.records[0];
  return rec ? mapPolitician(rec) : null;
}

export async function allPartySlugs(): Promise<string[]> {
  const data = await atFetch(T_PAR);
  return data.records.map((r: any) => r.fields?.slug || toSlug(r.fields?.name || '') || r.id).filter(Boolean);
}
