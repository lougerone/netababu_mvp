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
  logo?: string | null;           // from "Symbol" attachment or similar
  leaders?: string[];
  symbolText?: string | null;     // from "Attachment Summary"
  seats?: number | string | null; // from "Lok Sabha Seats (...)"
  details?: string | null;        // from "Details"
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

  // Jay confirmed abbreviation lives in "Ticker"
  const abbr =
    firstNonEmpty(f, [
      'Ticker',
      'ticker
