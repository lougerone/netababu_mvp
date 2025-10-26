// lib/airtable.ts
import { unstable_noStore as noStore } from 'next/cache';

/* ------------------------------ ENV & Consts ------------------------------ */

const AIRTABLE_API = 'https://api.airtable.com/v0';
const BASE_ID = process.env.AIRTABLE_BASE_ID!;
const TOKEN = process.env.AIRTABLE_TOKEN!;

const T_POL = process.env.AIRTABLE_TABLE_POLITICIANS || 'Politicians';
const T_PAR = process.env.AIRTABLE_TABLE_PARTIES || 'Parties';

// Cache/ISR knobs
const DEFAULT_TTL = Number(process.env.AIRTABLE_TTL_SECONDS || 600); // 10m cache
const MAX_CACHE_ITEMS = 200;
const MAX_CONCURRENCY = Number(process.env.AIRTABLE_MAX_CONCURRENCY || 3);

/* ----------------------------- Guard: server only ------------------------- */

if (typeof window !== 'undefined') {
  throw new Error('Do not import lib/airtable.ts from Client Components. Use it only on the server.');
}

/* ------------------------------ Small helpers ----------------------------- */

function toNumber(v: any): number | null {
  if (v == null) return null;
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string') {
    const n = parseInt(v.replace(/[, ]+/g, ''), 10);
    return Number.isNaN(n) ? null : n;
  }
  return null;
}

function parseList(value: any): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean).map(String).map((s) => s.trim());
  if (typeof value === 'string') {
    return value.split(/[,\n;]/).map((item) => item.trim()).filter(Boolean);
  }
  return [];
}

const toSlug = (s = '') =>
  s.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

function toText(v: any): string | undefined {
  if (v == null) return undefined;
  if (typeof v === 'string') {
    const s = v.trim();
    return s ? s : undefined;
  }
  if (typeof v === 'number' || typeof v === 'boolean') return String(v);
  if (Array.isArray(v)) return v.length ? toText(v[0]) : undefined;
  if (typeof v === 'object' && 'name' in v) return toText((v as any).name);
  return undefined;
}

function firstNonEmpty(f: Record<string, any>, keys: string[]): string | undefined {
  for (const k of keys) {
    const s = toText(f[k]);
    if (s) return s;
  }
  return undefined;
}

function getFirstAttachmentUrl(v: any): string | undefined {
  if (Array.isArray(v) && v.length && v[0]?.url) return v[0].url as string;
  if (typeof v === 'string' && /^https?:\/\//.test(v)) return v;
  return undefined;
}

/* --------------------------- Types (API & Domain) ------------------------- */

type AirtableRecord = { id: string; createdTime: string; fields: Record<string, any> };
type AirtablePage = { records: AirtableRecord[]; offset?: string };

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
  twitter?: string | null;     // NEW
  createdAt?: string | null;   // NEW
};

export type Party = {
  id: string;
  slug: string;
  name: string;
  abbr?: string;
  state?: string | null;
  status?: string | null;
  founded?: string | null;
  logo?: string | null;
  leaders?: string[];
  symbolText?: string | null;
  seats?: number | string | null;
  details?: string | null;
};

/* ---------------------------- In-memory TTL cache ------------------------- */

type CacheVal<T> = { data: T; exp: number };
const memCache = new Map<string, CacheVal<any>>();

function cacheKey(table: string, params: Record<string, any>) {
  const stable: Record<string, any> = {};
  Object.keys(params).sort().forEach((k) => {
    if (k !== 'offset') stable[k] = params[k]; // ignore iterator tokens
  });
  return `at:${table}:${JSON.stringify(stable)}`;
}

function getCache<T>(key: string): T | null {
  const hit = memCache.get(key);
  if (!hit) return null;
  if (hit.exp < Date.now()) {
    memCache.delete(key);
    return null;
  }
  return hit.data as T;
}

function setCache<T>(key: string, data: T, ttlSec = DEFAULT_TTL) {
  if (memCache.size > MAX_CACHE_ITEMS) {
    // simple prune of ~20 oldest
    const it = memCache.keys();
    for (let i = 0; i < 20; i++) {
      const n = it.next();
      if (n.done) break;
      memCache.delete(n.value);
    }
  }
  memCache.set(key, { data, exp: Date.now() + ttlSec * 1000 });
}

/* ---------------------------- Concurrency limiter ------------------------- */

let inflight = 0;
const queue: Array<() => void> = [];

function schedule<T>(fn: () => Promise<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    const run = async () => {
      inflight++;
      try {
        resolve(await fn());
      } catch (e) {
        reject(e);
      } finally {
        inflight--;
        const next = queue.shift();
        if (next) next();
      }
    };
    if (inflight < MAX_CONCURRENCY) run();
    else queue.push(run);
  });
}

/* ---------------------------- Low-level fetchers -------------------------- */

// Thin generic passthrough (kept for compatibility). This does NOT cache.
// Prefer the helpers below for list/get operations.
export async function airtableFetch(path: string, qs: Record<string, any> = {}) {
  noStore(); // server-only function; avoid page cache here
  const url = new URL(`${AIRTABLE_API}/${BASE_ID}/${path}`);
  Object.entries(qs).forEach(([k, v]) => url.searchParams.set(k, String(v)));

  const res = await schedule(() =>
    fetch(url.toString(), {
      headers: { Authorization: `Bearer ${TOKEN}` },
      cache: 'no-store',
      next: { revalidate: 0 },
    })
  );
  if (!res.ok) throw new Error('Airtable fetch failed');
  return res.json();
}

async function atFetch(
  table: string,
  params: Record<string, string | undefined> = {},
  { noCache = true }: { noCache?: boolean } = {}
): Promise<AirtablePage> {
  // Do not page-cache individual iterator pages
  noStore();

  const search = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v != null) search.set(k, v);
  if (!search.has('pageSize')) search.set('pageSize', '100');

  const url = `${AIRTABLE_API}/${BASE_ID}/${encodeURIComponent(table)}?${search.toString()}`;

  const res = await schedule(() =>
    fetch(url, {
      headers: { Authorization: `Bearer ${TOKEN}` },
      cache: noCache ? 'no-store' : 'force-cache',
      next: { revalidate: noCache ? 0 : Number(process.env.REVALIDATE_SECONDS || 3600) },
    })
  );

  const text = await res.text();
  let json: any;
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    json = { raw: text };
  }

  if (!res.ok) {
    const msg = json?.error?.type || res.statusText || 'Unknown Airtable error';
    throw new Error(`Airtable error ${res.status}: ${msg}`);
  }
  return json as AirtablePage;
}

function isIteratorError(e: unknown) {
  const s = String(e ?? '');
  return s.includes('LIST_RECORDS_ITERATOR_NOT_AVAILABLE');
}

async function atFetchAll(
  table: string,
  params: Record<string, string | undefined> = {},
  max = Infinity
): Promise<AirtableRecord[]> {
  noStore();
  const results: AirtableRecord[] = [];
  let offset: string | undefined;
  let restarted = false;

  while (true) {
    try {
      const page = await atFetch(table, { ...params, ...(offset ? { offset } : {}) }, { noCache: true });
      results.push(...page.records);
      if (Number.isFinite(max) && results.length >= max) break;
      offset = page.offset;
      if (!offset) break;
    } catch (e) {
      if (!restarted && isIteratorError(e)) {
        offset = undefined;
        restarted = true;
        continue;
      }
      throw e;
    }
  }
  return Number.isFinite(max) ? results.slice(0, max) : results;
}

/* ------------------------- Cached aggregation helper ---------------------- */

async function cachedAll(
  table: string,
  params: Record<string, string | undefined> = {},
  max = Infinity,
  ttlSec = DEFAULT_TTL
): Promise<AirtableRecord[]> {
  const key = cacheKey(table, params);
  const hit = getCache<AirtableRecord[]>(key);
  if (hit) return Number.isFinite(max) ? hit.slice(0, max) : hit;

  const rows = await atFetchAll(table, params, max);
  setCache(key, rows, ttlSec);
  return rows;
}

/* ------------------------------- Mappers ---------------------------------- */

function stateFromConstituency(c?: string): string | undefined {
  if (!c) return;
  const m = c.match(/\(([^)]+)\)\s*$/);
  return m?.[1];
}

function mapPolitician(r: AirtableRecord): Politician {
  const f = r.fields || {};
  const first = (arr?: any[]) => (Array.isArray(arr) && arr.length ? arr[0] : null);

  const photoField = f.Photo ?? f.photo ?? f.Image;
  const photo = (() => {
    const att = first(photoField);
    if (att?.url) return String(att.url);
    if (typeof photoField === 'string' && /^https?:\/\//i.test(photoField)) return photoField;
    return undefined;
  })();

  const constituency = f.Constituency ?? f.constituency ?? undefined;

  return {
    id: r.id,
    slug: f.slug || f.Slug || toSlug(f.name || f.Name || '') || r.id,
    name: f.Name || f.name || '',
    dob: f.DOB || f.dob || null,
    offices: parseList(f.Offices || f.offices),
    life_events: f['Life Events'] || f.life_events || null,
    photo,
    links: parseList(f.Links || f.links),
    party: f.Party || f.party || '',
    state: f.State || stateFromConstituency(constituency),
    current_position: f['Current Position'] || f.Position || f.position,
    position: f.Position || f['Current Position'] || f.position,
    constituency,
    age: f.Age ?? f.age ?? null,
    yearsInPolitics: f['Years in Politics'] ?? null,
    attendance: f['% Parliament Attendance'] ?? null,
    assets: f['Declared Assets'] ?? null,
    liabilities: f['Declared Liabilities'] ?? null,
    criminalCases: f['Criminal Cases'] ?? null,
    website: f.Website ?? null,
    twitter: f.Twitter ?? null,
    createdAt: f.Created ?? r.createdTime ?? null,
  };
}

function mapParty(r: AirtableRecord): Party {
  const f = r.fields || {};
  const name =
    firstNonEmpty(f, ['Name', 'Party Name', 'Party', 'party_name', 'party']) || '';
  const abbr = firstNonEmpty(f, [
    'Ticker',
    'ticker',
    'Assignee',
    'Abbreviation',
    'Abbr',
    'Acronym',
    'Short Name',
    'abbreviation',
    'abbr',
  ]);

  const status = firstNonEmpty(f, ['Status', 'Recognition', 'Type']) || null;

  const founded =
    firstNonEmpty(f, [
      'Date of Establishment',
      'Founded',
      'Year Founded',
      'Established',
      'Formed',
      'Year',
      'D.',
    ]) || null;

  const logo =
    getFirstAttachmentUrl(f['Symbol']) ||
    getFirstAttachmentUrl(f['Logo']) ||
    getFirstAttachmentUrl(f['Emblem']) ||
    getFirstAttachmentUrl(f['Image']) ||
    null;

  const symbolText = firstNonEmpty(f, ['Attachment Summary', 'Symbol Name']) || null;

  let state =
    firstNonEmpty(f, ['State Name', 'State', 'state', 'Home State', 'Region']) || null;
  if (state && /^rec[a-zA-Z0-9]{14,}/.test(state)) state = null;

  const leaders: string[] = (() => {
    const raw = f['Key Leader(s)'] ?? f['Leaders'] ?? f['Leader'];
    if (Array.isArray(raw)) return raw.filter(Boolean).map(String).map((s) => s.trim());
    if (raw)
      return String(raw)
        .split(/\n|,|;/)
        .map((s) => s.trim())
        .filter(Boolean);
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
    ...f,
    id: r.id,
    slug,
    name,
    abbr,
    state,
    status,
    founded,
    logo,
    leaders,
    symbolText,
    seats,
    details,
  };
}

/* ---------------------------- Local search text --------------------------- */

function makeSearchText(o: Record<string, any>): string {
  const parts = [
    o.name,
    o.slug,
    o.abbr,
    o.status,
    o.founded,
    o.details,
    ...(Array.isArray(o.leaders) ? o.leaders : []),
    ...(Array.isArray(o.offices) ? o.offices : []),
    o.party,
    o.state,
    o.position,
    o.constituency,
  ]
    .filter(Boolean)
    .map(String)
    .map((s) => s.toLowerCase());
  return parts.join(' ');
}

/* ------------------------- List / Get utilities --------------------------- */

// Politicians (list)
export async function listPoliticians(
  opts: { limit?: number; query?: string } = {}
): Promise<Politician[]> {
  const max = opts.limit && opts.limit > 0 ? opts.limit : Infinity;
  const qSafe = (opts.query ?? '').trim();

  const unionById = (a: AirtableRecord[], b: AirtableRecord[]) => {
    const seen = new Set(a.map((r) => r.id));
    const out = a.slice();
    for (const r of b) if (!seen.has(r.id)) out.push(r);
    return out;
  };

  let remoteRecords: AirtableRecord[] = [];
  if (qSafe) {
    const q = qSafe.replace(/"/g, '\\"');
    try {
      remoteRecords = await cachedAll(
        T_POL,
        {
          pageSize: '100',
          filterByFormula: `OR(
            SEARCH("${q}", {Name}),
            SEARCH("${q}", {Party}),
            SEARCH("${q}", {Constituency})
          )`,
        },
        max === Infinity ? Infinity : Math.max(max, 100)
      );
    } catch {
      remoteRecords = await cachedAll(
        T_POL,
        {
          pageSize: '100',
          filterByFormula: `OR(SEARCH("${q}", {Name}), SEARCH("${q}", {Party}))`,
        },
        max === Infinity ? Infinity : Math.max(max, 100)
      );
    }
  } else {
    remoteRecords = await cachedAll(
      T_POL,
      { pageSize: '100' },
      max === Infinity ? Infinity : Math.max(max, 100)
    );
  }

  let mapped = remoteRecords.map(mapPolitician);
  if (qSafe) {
    const q = qSafe.toLowerCase();
    mapped = mapped.filter((p) => makeSearchText(p).includes(q));
  }

  if (qSafe && mapped.length < 12) {
    const allRecords = await cachedAll(T_POL, { pageSize: '100' }, 1000);
    const union = unionById(remoteRecords, allRecords);
    let mappedUnion = union.map(mapPolitician);
    const q = qSafe.toLowerCase();
    mappedUnion = mappedUnion.filter((p) => makeSearchText(p).includes(q));
    mapped = mappedUnion;
  }

  return Number.isFinite(max) ? mapped.slice(0, Number(max)) : mapped;
}

// Parties (list)
export async function listParties(
  opts: { limit?: number; query?: string } = {}
): Promise<Party[]> {
  const max = opts.limit && opts.limit > 0 ? opts.limit : Infinity;
  const qSafe = (opts.query ?? '').trim();

  const unionById = (a: AirtableRecord[], b: AirtableRecord[]) => {
    const seen = new Set(a.map((r) => r.id));
    const out = a.slice();
    for (const r of b) if (!seen.has(r.id)) out.push(r);
    return out;
  };

  let remoteRecords: AirtableRecord[] = [];
  if (qSafe) {
    const q = qSafe.replace(/"/g, '\\"');
    try {
      remoteRecords = await cachedAll(
        T_PAR,
        {
          pageSize: '100',
          filterByFormula: `OR(
            SEARCH("${q}", {Name}),
            SEARCH("${q}", {Abbreviation}),
            SEARCH("${q}", {Leaders}),
            SEARCH("${q}", {State})
          )`,
        },
        max === Infinity ? Infinity : Math.max(max, 100)
      );
    } catch {
      remoteRecords = await cachedAll(
        T_PAR,
        {
          pageSize: '100',
          filterByFormula: `OR(SEARCH("${q}", {Name}), SEARCH("${q}", {Abbreviation}))`,
        },
        max === Infinity ? Infinity : Math.max(max, 100)
      );
    }
  } else {
    remoteRecords = await cachedAll(
      T_PAR,
      { pageSize: '100' },
      max === Infinity ? Infinity : Math.max(max, 100)
    );
  }

  let mapped = remoteRecords.map(mapParty);
  if (qSafe) {
    const q = qSafe.toLowerCase();
    mapped = mapped.filter((p) => makeSearchText(p).includes(q));
  }

  if (qSafe && mapped.length < 12) {
    const allRecords = await cachedAll(T_PAR, { pageSize: '100' }, 1000);
    const union = unionById(remoteRecords, allRecords);
    let mappedUnion = union.map(mapParty);
    const q = qSafe.toLowerCase();
    mappedUnion = mappedUnion.filter((p) => makeSearchText(p).includes(q));
    mapped = mappedUnion;
  }

  return Number.isFinite(max) ? mapped.slice(0, Number(max)) : mapped;
}

// Popular / recent
export async function listTopPartiesBySeats(limit = 6): Promise<Party[]> {
  const records = await cachedAll(T_PAR, { pageSize: '100' });
  const mapped = records.map(mapParty);

  const ranked = mapped
    .map((p) => {
      const val = p.seats;
      let n: number | null = null;
      if (typeof val === 'number') n = val;
      else if (typeof val === 'string') {
        const parsed = parseInt(val.replace(/[, ]+/g, ''), 10);
        if (!Number.isNaN(parsed)) n = parsed;
      }
      return { party: p, seatsNum: n };
    })
    .filter((x) => x.seatsNum !== null)
    .sort((a, b) => b.seatsNum! - a.seatsNum!)
    .slice(0, Math.max(1, limit))
    .map((x) => x.party);

  return ranked;
}

export async function listRecentParties(limit = 4): Promise<Party[]> {
  const records = await cachedAll(T_PAR, { pageSize: '100' });
  const mapped = records.map(mapParty);

  const ranked = mapped
    .map((p) => {
      const val = p.seats;
      let n: number | null = null;
      if (typeof val === 'number') n = val;
      else if (typeof val === 'string') {
        const parsed = parseInt(val.replace(/[, ]+/g, ''), 10);
        if (!Number.isNaN(parsed)) n = parsed;
      }
      return { party: p, seatsNum: n };
    })
    .filter((x) => x.seatsNum !== null)
    .sort((a, b) => b.seatsNum! - a.seatsNum!)
    .slice(0, Math.max(1, limit))
    .map((x) => x.party);

  return ranked;
}

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
  const page = await cachedAll(T_POL, { view, pageSize: '100' });
  return page
    .slice()
    .sort((a, b) => new Date(b.createdTime).getTime() - new Date(a.createdTime).getTime())
    .slice(0, limit)
    .map(mapPolitician);
}

/* -------------------------------- Getters --------------------------------- */

export async function getPoliticianBySlug(slug: string): Promise<Politician | null> {
  const s = slug.toLowerCase().replace(/"/g, '\\"');
  try {
    const data = await atFetch(T_POL, {
      filterByFormula: `OR(LOWER({slug}) = "${s}", LOWER({Slug}) = "${s}")`,
      maxRecords: '1',
    });
    const rec = data.records?.[0];
    if (rec) return mapPolitician(rec);
  } catch {}
  const all = await cachedAll(T_POL, { pageSize: '100' });
  const rec = all.find((r) => (mapPolitician(r).slug || '').toLowerCase() === s);
  return rec ? mapPolitician(rec) : null;
}

export async function getPartyBySlug(slug: string): Promise<Party | null> {
  const s = slug.toLowerCase().replace(/"/g, '\\"');
  try {
    const data = await atFetch(T_PAR, {
      filterByFormula: `OR(LOWER({slug}) = "${s}", LOWER({Slug}) = "${s}")`,
      maxRecords: '1',
    });
    if (data.records?.[0]) return mapParty(data.records[0]);
  } catch {}
  const all = await cachedAll(T_PAR, { pageSize: '100' });
  const rec = all.find((r) => mapParty(r).slug === slug);
  return rec ? mapParty(rec) : null;
}

export async function getPolitician(slugOrId: string): Promise<Politician | null> {
  if (slugOrId.startsWith('rec')) {
    const url = `${AIRTABLE_API}/${BASE_ID}/${encodeURIComponent(T_POL)}/${slugOrId}`;
    const res = await schedule(() => fetch(url, { headers: { Authorization: `Bearer ${TOKEN}` } }));
    if (!res.ok) return null;
    const data = (await res.json()) as AirtableRecord;
    return mapPolitician(data);
  }
  return getPoliticianBySlug(slugOrId);
}

export async function allPartySlugs(): Promise<string[]> {
  const records = await cachedAll(T_PAR, { pageSize: '100' });
  return records.map((r) => mapParty(r).slug).filter(Boolean);
}
