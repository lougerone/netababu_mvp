// lib/airtable.ts

// Guard: prevent use from Client Components.
if (typeof window !== 'undefined') {
  throw new Error('Do not import lib/airtable.ts from Client Components. Use it only on the server.');
}

/* ----------------------------- Small helpers ----------------------------- */

function parseList(value: any): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean).map(String).map((s) => s.trim());
  if (typeof value === 'string') {
    return value.split(/[,\n;]/).map((item) => item.trim()).filter(Boolean);
  }
  return [];
}

const AIRTABLE_API = 'https://api.airtable.com/v0';
const BASE_ID = process.env.AIRTABLE_BASE_ID!;
const TOKEN = process.env.AIRTABLE_TOKEN!;

const T_POL = process.env.AIRTABLE_TABLE_POLITICIANS || 'Politicians';
const T_PAR = process.env.AIRTABLE_TABLE_PARTIES || 'Parties';

const toSlug = (s = '') => s.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

function firstNonEmpty(f: Record<string, any>, keys: string[]): string | undefined {
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

type AirtableRecord = { id: string; createdTime: string; fields: Record<string, any> };
type AirtablePage = { records: AirtableRecord[]; offset?: string };

async function atFetch(
  table: string,
  params: Record<string, string | undefined> = {}
): Promise<AirtablePage> {
  const search = new URLSearchParams(params as Record<string, string>);
  const url = `${AIRTABLE_API}/${BASE_ID}/${encodeURIComponent(table)}?${search.toString()}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${TOKEN}` },
    next: { revalidate: Number(process.env.REVALIDATE_SECONDS || 3600) },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Airtable error ${res.status}: ${text}`);
  }
  return res.json();
}

async function atFetchAll(
  table: string,
  params: Record<string, string | undefined> = {},
  max = Infinity
): Promise<AirtableRecord[]> {
  const results: AirtableRecord[] = [];
  let offset: string | undefined;
  do {
    const page = await atFetch(table, { ...params, ...(offset ? { offset } : {}) });
    results.push(...page.records);
    offset = page.offset;
    if (results.length >= max) break;
  } while (offset);
  return Number.isFinite(max) ? results.slice(0, max) : results;
}

/* --------------------------------- Types --------------------------------- */

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
  logo?: string | null;
  leaders?: string[];
  symbolText?: string | null;
  seats?: number | string | null;
  details?: string | null;
};

/* --------------------------- Record mappers ------------------------------- */

function mapPolitician(r: AirtableRecord): Politician {
  const f = r.fields || {};
  const first = (arr?: any[]) => (Array.isArray(arr) && arr.length ? arr[0] : null);

  return {
    id: r.id,
    slug: f.slug || f.Slug || toSlug(f.name || f.Name || '') || r.id,
    name: f.name || f.Name || '',
    dob: f.dob || f.DOB || null,
    offices: parseList(f.offices || f.Offices),
    life_events: f.life_events || f['Life Events'] || null,
    photo: (() => {
      const att = first(f.photo || f.Photo || f.Image);
      return att && att.url ? (att.url as string) : undefined;
    })(),
    links: parseList(f.links || f.Links),
    party: (f.Party || f.party || '') as string,
    state: f.Constituency || f.State || f.state,
    current_position: f.Position || f['Current Position'] || f.position,
    position: f.Position || f['Current Position'] || f.position,
    constituency: f.Constituency || f.constituency,
    age: f.Age || f.age,
    yearsInPolitics: f['Years in politics'] || f['Years in office'] || f['Experience (Years)'],
    attendance: f['% Parliament Attendance'] || f['Parliament Attendance'],
    assets: f['Declared Assets'] || f.assets,
    liabilities: f['Declared Liabilities'] || f.liabilities,
    criminalCases: f['Criminal Cases'] || f.criminalCases,
    website: f.Website || f.website,
  };
}

function mapParty(r: AirtableRecord): Party {
  const f = r.fields || {};
  const name =
    firstNonEmpty(f, ['Name', 'Party Name', 'Party', 'party_name', 'party']) || '';
  const abbr = firstNonEmpty(f, [
    'Ticker', 'ticker', 'Assignee', 'Abbreviation', 'Abbr', 'Acronym',
    'Short Name', 'abbreviation', 'abbr',
  ]);

  const status = firstNonEmpty(f, ['Status', 'Recognition', 'Type']) || null;
  const founded = firstNonEmpty(f, [
    'Date of Establishment', 'Founded', 'Year Founded', 'Established', 'Formed', 'Year',
  ]) || null;

  const logo =
    getFirstAttachmentUrl(f['Symbol']) ||
    getFirstAttachmentUrl(f['Logo']) ||
    getFirstAttachmentUrl(f['Emblem']) ||
    getFirstAttachmentUrl(f['Image']) ||
    null;

  const symbolText = firstNonEmpty(f, ['Attachment Summary', 'Symbol Name']) || null;

  // 👇 NEW: read party's state (text or single-select)
  const state =
    firstNonEmpty(f, ['State', 'state', 'Home State', 'Region']) || null;

  const leaders: string[] = (() => {
    const raw = f['Key Leader(s)'] ?? f['Leaders'] ?? f['Leader'];
    if (Array.isArray(raw)) return raw.filter(Boolean).map(String).map((s) => s.trim());
    if (raw) return String(raw).split(/\n|,|;/).map((s) => s.trim()).filter(Boolean);
    return [];
  })();

  const seats =
    f['Lok Sabha Seats'] ??
    f['Lok Sabha Seats (2024)'] ??
    f['Lok Sabha Seats (20)'] ??
    null;

  const details = (f['Details'] as string) ?? null;
  const slug = toSlug(f['slug'] ?? f['Slug'] ?? name) || r.id;

  return {
    id: r.id,
    slug,
    name,
    abbr,
    state,     // 👈 include it in the payload
    status,
    founded,
    logo,
    leaders,
    symbolText,
    seats,
    details,
  };
}


/* -------------------------- Local text search ----------------------------- */

function makeSearchText(o: Record<string, any>): string {
  const parts = [
    o.name, o.slug, o.abbr, o.status, o.founded, o.details,
    ...(Array.isArray(o.leaders) ? o.leaders : []),
    ...(Array.isArray(o.offices) ? o.offices : []),
    o.party, o.state, o.position, o.constituency,
  ]
    .filter(Boolean)
    .map(String)
    .map((s) => s.toLowerCase());
  return parts.join(' ');
}

/* ------------------------- List / Get utilities -------------------------- */

export async function listPoliticians(opts: { limit?: number; query?: string } = {}): Promise<Politician[]> {
  const max = opts.limit && opts.limit > 0 ? opts.limit : Infinity;
  const records = await atFetchAll(T_POL, { pageSize: '100' }, max === Infinity ? Infinity : Math.max(max, 100));
  let mapped = records.map(mapPolitician);
  if (opts.query) {
    const q = opts.query.toLowerCase();
    mapped = mapped.filter((p) => makeSearchText(p).includes(q));
  }
  return Number.isFinite(max) ? mapped.slice(0, Number(max)) : mapped;
}

export async function listParties(opts: { limit?: number; query?: string } = {}): Promise<Party[]> {
  const max = opts.limit && opts.limit > 0 ? opts.limit : Infinity;
  const records = await atFetchAll(T_PAR, { pageSize: '100' }, max === Infinity ? Infinity : Math.max(max, 100));
  let mapped = records.map(mapParty);
  if (opts.query) {
    const q = opts.query.toLowerCase();
    mapped = mapped.filter((p) => makeSearchText(p).includes(q));
  }
  return Number.isFinite(max) ? mapped.slice(0, Number(max)) : mapped;
}

export async function getPoliticianBySlug(slug: string): Promise<Politician | null> {
  const data = await atFetch(T_POL, { filterByFormula: `{slug} = "${slug}"`, maxRecords: '1' });
  const rec = data.records[0];
  return rec ? mapPolitician(rec) : null;
}

export async function getPartyBySlug(slug: string): Promise<Party | null> {
  const data = await atFetch(T_PAR, { filterByFormula: `{slug} = "${slug}"`, maxRecords: '1' });
  const rec = data.records[0];
  return rec ? mapParty(rec) : null;
}

export async function getPolitician(slugOrId: string): Promise<Politician | null> {
  if (slugOrId.startsWith('rec')) {
    const url = `${AIRTABLE_API}/${BASE_ID}/${encodeURIComponent(T_POL)}/${slugOrId}`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${TOKEN}` } });
    if (!res.ok) return null;
    const data = (await res.json()) as AirtableRecord;
    return mapPolitician(data);
  }
  return getPoliticianBySlug(slugOrId);
}

export async function allPartySlugs(): Promise<string[]> {
  const records = await atFetchAll(T_PAR, { pageSize: '100' });
  return records
    .map((r) => r.fields?.slug || r.fields?.Slug || toSlug(r.fields?.name || r.fields?.Name || '') || r.id)
    .filter(Boolean);
}

// Most recent by Created — Parties
export async function listRecentParties(limit = 4): Promise<Party[]> {
  const view = process.env.AIRTABLE_PARTIES_VIEW || 'Grid view';
  const createdField = process.env.AIRTABLE_PARTIES_CREATED_FIELD || 'Created';
  try {
    const data = await atFetch(T_PAR, {
      view,
      pageSize: String(Math.min(Math.max(limit, 1), 100)),
      [`sort[0][field]`]: createdField,
      [`sort[0][direction]`]: 'desc',
    });
    if (data.records?.length) return data.records.slice(0, limit).map(mapParty);
  } catch {}
  const page = await atFetch(T_PAR, { view, pageSize: '100' });
  return page.records
    .slice()
    .sort((a, b) => new Date(b.createdTime).getTime() - new Date(a.createdTime).getTime())
    .slice(0, limit)
    .map(mapParty);
}

// Most recent by Created — Politicians
export async function listRecentPoliticians(limit = 4): Promise<Politician[]> {
  const view = process.env.AIRTABLE_POLITICIANS_VIEW || 'Grid view';
  const createdField = process.env.AIRTABLE_POLITICIANS_CREATED_FIELD || 'Created';
  try {
    const data = await atFetch(T_POL, {
      view,
      pageSize: String(Math.min(Math.max(limit, 1), 100)),
      [`sort[0][field]`]: createdField,
      [`sort[0][direction]`]: 'desc',
    });
    if (data.records?.length) return data.records.slice(0, limit).map(mapPolitician);
  } catch {}
  const page = await atFetch(T_POL, { view, pageSize: '100' });
  return page.records
    .slice()
    .sort((a, b) => new Date(b.createdTime).getTime() - new Date(a.createdTime).getTime())
    .slice(0, limit)
    .map(mapPolitician);
}
