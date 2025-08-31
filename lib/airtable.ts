// lib/airtable.ts
import 'server-only';

/* ----------------------------- Small helpers ----------------------------- */

function parseList(value: any): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean).map(String).map((s) => s.trim());
  if (typeof value === 'string') {
    return value
      .split(/[,\n;]/)
      .map((item) => item.trim())
      .filter(Boolean);
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

type AirtableRecord = {
  id: string;
  createdTime: string;
  fields: Record<string, any>;
};

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

// Accumulates all pages (or up to `max` records) using Airtable's `offset`
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
  logo?: string | null;           // from "Symbol" attachment (or similar)
  leaders?: string[];
  symbolText?: string | null;     // "Attachment Summary"
  seats?: number | string | null; // "Lok Sabha Seats (…)” any year variant
  details?: string | null;        // "Details"
};

/* --------------------------- Record mappers ------------------------------- */

function mapPolitician(r: AirtableRecord): Politician {
  const f = r.fields || {};
  const getFirst = (arr?: any[]) => (Array.isArray(arr) && arr.length ? arr[0] : null);

  return {
    id: r.id,
    slug: f.slug || f.Slug || toSlug(f.name || f.Name || '') || r.id,
    name: f.name || f.Name || '',
    dob: f.dob || f.DOB || null,
    offices: parseList(f.offices || f.Offices),
    life_events: f.life_events || f['Life Events'] || null,
    photo: (() => {
      const att = getFirst(f.photo || f.Photo || f.Image);
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

  // Abbreviation lives in "Ticker" for your base
  const abbr =
    firstNonEmpty(f, ['Ticker', 'ticker', 'Assignee', 'Abbreviation', 'Abbr', 'Acronym', 'Short Name', 'abbreviation', 'abbr']) ||
    undefined;

  const status =
    firstNonEmpty(f, ['Status', 'Recognition', 'Type']) || null;

  const founded =
    firstNonEmpty(f, ['Founded', 'Year Founded', 'Established', 'Formed', 'Year']) || null;

  // Symbol attachment is your logo column; fallbacks included
  const logo =
    getFirstAttachmentUrl(f['Symbol']) ||
    getFirstAttachmentUrl(f['Logo']) ||
    getFirstAttachmentUrl(f['Emblem']) ||
    getFirstAttachmentUrl(f['Image']) ||
    null;

  const symbolText =
    firstNonEmpty(f, ['Attachment Summary', 'Symbol Name']) || null;

  const leaders = Array.isArray(f['Key Leader(s)'])
    ? f['Key Leader(s)']
    : f['Key Leader(s)']
    ? String(f['Key Leader(s)']).split(/\n|,|;/).map((s: string) => s.trim()).filter(Boolean)
    : [];

  // Capture any column that starts with "Lok Sabha Seats"
  const seatsKey = Object.keys(f).find((k) => /^Lok Sabha Seats/i.test(k));
  const seats = seatsKey ? f[seatsKey] : null;

  const details = (f['Details'] as string | undefined) ?? null;

  const slug = toSlug(f['slug'] ?? f['Slug'] ?? name) || r.id;

  return { id: r.id, slug, name, abbr, status, founded, logo, leaders, symbolText, seats, details };
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
    ? `FIND(LOWER("${opts.query}"), LOWER({name}&" "&{slug}&" "&{status}&" "&{Ticker}))`
    : undefined;

  const data = await atFetch(T_PAR, {
    ...(filter ? { filterByFormula: filter } : {}),
    ...(opts.limit ? { maxRecords: String(opts.limit) } : {}),
  });

  return data.records.map(mapParty);
}

// Latest N parties (by Created time). Works with/without a "Created" field.
export async function listRecentParties(limit = 4): Promise<Party[]> {
  const view = process.env.AIRTABLE_PARTIES_VIEW || 'Grid view';
  const createdField = process.env.AIRTABLE_PARTIES_CREATED_FIELD || 'Created'; // optional Created-time field

  try {
    const sorted = await atFetch(T_PAR, {
      view,
      pageSize: String(limit),
      [`sort[0][field]`]: createdField,
      [`sort[0][direction]`]: 'desc',
    });
    if (sorted.records?.length) return sorted.records.map(mapParty);
  } catch {
    // fall through to fallback
  }

  const page = await atFetch(T_PAR, { view, pageSize: '50' });
  return page.records
    .sort(
      (a, b) => new Date(b.createdTime).getTime() - new Date(a.createdTime).getTime()
    )
    .slice(0, limit)
    .map(mapParty);
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
  if (slugOrId.startsWith('rec')) {
    const url = `${AIRTABLE_API}/${BASE_ID}/${encodeURIComponent(T_POL)}/${slugOrId}`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${TOKEN}` } });
    if (!res.ok) return null;
    const data = await res.json();
    return mapPolitician(data);
  }
  const data = await atFetch(T_POL, { filterByFormula: `{slug} = "${slugOrId}"` });
  const rec = data.records[0];
  return rec ? mapPolitician(rec) : null;
}

export async function allPartySlugs(): Promise<string[]> {
  const data = await atFetchAll(T_PAR, {}, 5000);
  return data
    .map((r) => r.fields?.slug || r.fields?.Slug || toSlug(r.fields?.name || r.fields?.Name || '') || r.id)
    .filter(Boolean);
}
