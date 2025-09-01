// lib/airtable.ts

// Guard: prevent use from Client Components.
if (typeof window !== 'undefined') {
  throw new Error(
    'Do not import lib/airtable.ts from Client Components. Use it only on the server.'
  );
}

/* ----------------------------- Small helpers ----------------------------- */

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
  if (Array.isArray(value))
    return value.filter(Boolean).map(String).map((s) => s.trim());
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
  s
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

function toText(v: any): string | undefined {
  if (v == null) return undefined;

  if (typeof v === 'string') {
    const s = v.trim();
    return s ? s : undefined;
  }

  if (typeof v === 'number' || typeof v === 'boolean') {
    return String(v);
  }

  if (Array.isArray(v)) {
    if (!v.length) return undefined;
    return toText(v[0]);
  }

  if (typeof v === 'object' && 'name' in v) {
    return toText((v as any).name);
  }

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
  state?: string | null;
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

/* -------------------------- Local text search ----------------------------- */

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

/* ------------------------- List / Get utilities -------------------------- */

// ✅ Safe: only {Name} and {Party} (universally present)
//    Local filter still searches state/constituency/leaders/etc.
export async function listPoliticians(
  opts: { limit?: number; query?: string } = {}
): Promise<Politician[]> {
  const max = opts.limit && opts.limit > 0 ? opts.limit : Infinity;
  const qSafe = (opts.query ?? '').trim();

  // Helper to dedupe by id
  const unionById = (a: AirtableRecord[], b: AirtableRecord[]) => {
    const seen = new Set(a.map(r => r.id));
    const out = a.slice();
    for (const r of b) if (!seen.has(r.id)) out.push(r);
    return out;
  };

  // --- 1) Try a remote filter that includes Constituency (if present) ---
  let remoteRecords: AirtableRecord[] = [];
  if (qSafe) {
    const q = qSafe.replace(/"/g, '\\"');

    // Try Name + Party + Constituency
    let params: Record<string, string> = {
      pageSize: '100',
      filterByFormula: `OR(
        SEARCH("${q}", {Name}),
        SEARCH("${q}", {Party}),
        SEARCH("${q}", {Constituency})
      )`,
    };

    try {
      remoteRecords = await atFetchAll(
        T_POL,
        params,
        max === Infinity ? Infinity : Math.max(max, 100)
      );
    } catch {
      // Fallback: Name + Party only (schema-safe)
      params = {
        pageSize: '100',
        filterByFormula: `OR(
          SEARCH("${q}", {Name}),
          SEARCH("${q}", {Party})
        )`,
      };
      try {
        remoteRecords = await atFetchAll(
          T_POL,
          params,
          max === Infinity ? Infinity : Math.max(max, 100)
        );
      } catch {
        // If Airtable still rejects, just fetch without a filter
        remoteRecords = await atFetchAll(
          T_POL,
          { pageSize: '100' },
          max === Infinity ? Infinity : Math.max(max, 100)
        );
      }
    }
  } else {
    // No query: regular fetch (no filter)
    remoteRecords = await atFetchAll(
      T_POL,
      { pageSize: '100' },
      max === Infinity ? Infinity : Math.max(max, 100)
    );
  }

  // Map + local rich filter (this searches constituency/state/position/etc.)
  let mapped = remoteRecords.map(mapPolitician);
  if (qSafe) {
    const q = qSafe.toLowerCase();
    mapped = mapped.filter((p) => makeSearchText(p).includes(q));
  }

  // --- 2) If results look thin, broaden by fetching a larger slice w/o formula ---
  // (helps cases like “gandhi” -> Gandhinagar when remote filter missed it)
  if (qSafe && mapped.length < 12) {
    const allRecords = await atFetchAll(
      T_POL,
      { pageSize: '100' },
      // fetch a bigger chunk so local filter has coverage
      1000
    );
    const union = unionById(remoteRecords, allRecords);
    let mappedUnion = union.map(mapPolitician);
    const q = qSafe.toLowerCase();
    mappedUnion = mappedUnion.filter((p) => makeSearchText(p).includes(q));
    mapped = mappedUnion;
  }

  return Number.isFinite(max) ? mapped.slice(0, Number(max)) : mapped;
}

// ✅ Safe: use only {Name} (and optionally {Abbreviation} if present).
//    We still do a rich local filter afterward.
export async function listParties(
  opts: { limit?: number; query?: string } = {}
): Promise<Party[]> {
  const max = opts.limit && opts.limit > 0 ? opts.limit : Infinity;
  const qSafe = (opts.query ?? '').trim();

  // Helper: dedupe AirtableRecords by id
  const unionById = (a: AirtableRecord[], b: AirtableRecord[]) => {
    const seen = new Set(a.map(r => r.id));
    const out = a.slice();
    for (const r of b) if (!seen.has(r.id)) out.push(r);
    return out;
  };

  // 1) Try a broader remote filter first (Name + Abbreviation + Leaders + State).
  //    If Airtable rejects any unknown field (422), fall back to a safe formula.
  let remoteRecords: AirtableRecord[] = [];
  if (qSafe) {
    const q = qSafe.replace(/"/g, '\\"');

    let params: Record<string, string> = {
      pageSize: '100',
      filterByFormula: `OR(
        SEARCH("${q}", {Name}),
        SEARCH("${q}", {Abbreviation}),
        SEARCH("${q}", {Leaders}),
        SEARCH("${q}", {State})
      )`,
    };

    try {
      remoteRecords = await atFetchAll(
        T_PAR,
        params,
        max === Infinity ? Infinity : Math.max(max, 100)
      );
    } catch {
      // Safe fallback: only fields very likely to exist
      params = {
        pageSize: '100',
        filterByFormula: `OR(
          SEARCH("${q}", {Name}),
          SEARCH("${q}", {Abbreviation})
        )`,
      };
      try {
        remoteRecords = await atFetchAll(
          T_PAR,
          params,
          max === Infinity ? Infinity : Math.max(max, 100)
        );
      } catch {
        // Last resort: no formula at all; we'll filter locally.
        remoteRecords = await atFetchAll(
          T_PAR,
          { pageSize: '100' },
          max === Infinity ? Infinity : Math.max(max, 100)
        );
      }
    }
  } else {
    // No query → plain fetch
    remoteRecords = await atFetchAll(
      T_PAR,
      { pageSize: '100' },
      max === Infinity ? Infinity : Math.max(max, 100)
    );
  }

  // Local rich filter (covers details, leaders, state, etc.)
  let mapped = remoteRecords.map(mapParty);
  if (qSafe) {
    const q = qSafe.toLowerCase();
    mapped = mapped.filter((p) => makeSearchText(p).includes(q));
  }

  // 2) If results are thin, broaden by fetching a larger slice without formula and locally filter.
  if (qSafe && mapped.length < 12) {
    const allRecords = await atFetchAll(
      T_PAR,
      { pageSize: '100' },
      1000 // get a wider slice to ensure coverage
    );
    const union = unionById(remoteRecords, allRecords);
    let mappedUnion = union.map(mapParty);
    const q = qSafe.toLowerCase();
    mappedUnion = mappedUnion.filter((p) => makeSearchText(p).includes(q));
    mapped = mappedUnion;
  }

  return Number.isFinite(max) ? mapped.slice(0, Number(max)) : mapped;
}



/* -------------------- Other existing exports (unchanged) ------------------ */

export async function listTopPartiesBySeats(limit = 6): Promise<Party[]> {
  const records = await atFetchAll(T_PAR, { pageSize: '100' });
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

export async function getPoliticianBySlug(slug: string): Promise<Politician | null> {
  const data = await atFetch(T_POL, {
    filterByFormula: `{slug} = "${slug}"`,
    maxRecords: '1',
  });
  const rec = data.records[0];
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

  const all = await atFetchAll(T_PAR, { pageSize: '100' });
  const rec = all.find((r) => mapParty(r).slug === slug);
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
  return records.map((r) => mapParty(r).slug).filter(Boolean);
}

export async function listRecentParties(limit = 4): Promise<Party[]> {
  const records = await atFetchAll(T_PAR, { pageSize: '100' });
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
  const page = await atFetch(T_POL, { view, pageSize: '100' });
  return page.records
    .slice()
    .sort(
      (a, b) =>
        new Date(b.createdTime).getTime() - new Date(a.createdTime).getTime()
    )
    .slice(0, limit)
    .map(mapPolitician);
}
