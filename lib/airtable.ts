// lib/airtable.ts
const AIRTABLE_API = "https://api.airtable.com/v0";

const BASE_ID = process.env.AIRTABLE_BASE_ID!;
const TOKEN = process.env.AIRTABLE_TOKEN!;
const T_POL = process.env.AIRTABLE_TABLE_POLITICIANS || "Politicians";
const T_PAR = process.env.AIRTABLE_TABLE_PARTIES || "Parties";

export type Attachment = { url: string; filename?: string; width?: number; height?: number };

export type Politician = {
  id: string;           // Airtable record id
  slug: string;
  name: string;
  dob?: string | null;
  offices?: string[];
  life_events?: string | null;
  photo?: Attachment | null;
  links?: string[];     // normalized to array
};

export type Party = {
  id: string;
  slug: string;
  name: string;
  founded?: string | null;
  status?: "Active" | "Dormant" | string | null;
  symbol?: Attachment | null;
  leaders?: string[];   // names or slugs if you prefer
};

async function atFetch(table: string, params: Record<string, string | undefined> = {}) {
  const search = new URLSearchParams(params as Record<string, string>);
  const url = `${AIRTABLE_API}/${BASE_ID}/${encodeURIComponent(table)}?${search.toString()}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${TOKEN}` },
    // cache on Next server, ISR controlled per page using `revalidate`
    next: { revalidate: Number(process.env.REVALIDATE_SECONDS || 3600) }
  });
  if (!res.ok) throw new Error(`Airtable error ${res.status}: ${await res.text()}`);
  return res.json() as Promise<{ records: any[]; offset?: string }>;
}

// --- mappers (rename fields here if your Airtable names differ) ---
function mapPolitician(r: any): Politician {
  const f = r.fields || {};
  const getFirst = (arr?: any[]) => (Array.isArray(arr) && arr.length ? arr[0] : null);
  return {
    id: r.id,
    slug: f.slug || r.id,
    name: f.name || "",
    dob: f.dob || null,
    offices: Array.isArray(f.offices) ? f.offices : (f.offices ? String(f.offices).split(",").map((s:string)=>s.trim()) : []),
    life_events: f.life_events || null,
    photo: getFirst(f.photo),
    links: Array.isArray(f.links)
      ? f.links
      : f.links
      ? String(f.links).split(/\n|,|;/).map((s:string)=>s.trim()).filter(Boolean)
      : []
  };
}

function mapParty(r: any): Party {
  const f = r.fields || {};
  const getFirst = (arr?: any[]) => (Array.isArray(arr) && arr.length ? arr[0] : null);
  return {
    id: r.id,
    slug: f.slug || r.id,
    name: f.name || "",
    founded: f.founded || null,
    status: f.status || null,
    symbol: getFirst(f.symbol),
    leaders: Array.isArray(f.leaders)
      ? f.leaders
      : f.leaders
      ? String(f.leaders).split(/\n|,|;/).map((s:string)=>s.trim()).filter(Boolean)
      : []
  };
}

// --- list + get utilities ---
export async function listPoliticians(opts: { limit?: number; query?: string } = {}): Promise<Politician[]> {
  const filter = opts.query
    ? `FIND(LOWER("${opts.query}"), LOWER({name}&" "&{slug}&" "&{offices}))`
    : undefined;

  const data = await atFetch(T_POL, {
    ...(filter ? { filterByFormula: filter } : {}),
    ...(opts.limit ? { maxRecords: String(opts.limit) } : {})
  });

  return data.records.map(mapPolitician);
}

export async function listParties(opts: { limit?: number; query?: string } = {}): Promise<Party[]> {
  const filter = opts.query
    ? `FIND(LOWER("${opts.query}"), LOWER({name}&" "&{slug}&" "&{status}))`
    : undefined;

  const data = await atFetch(T_PAR, {
    ...(filter ? { filterByFormula: filter } : {}),
    ...(opts.limit ? { maxRecords: String(opts.limit) } : {})
  });

  return data.records.map(mapParty);
}

export async function getPoliticianBySlug(slug: string): Promise<Politician | null> {
  const data = await atFetch(T_POL, {
    filterByFormula: `{slug} = "${slug}"`
  });
  const rec = data.records[0];
  return rec ? mapPolitician(rec) : null;
}

export async function getPartyBySlug(slug: string): Promise<Party | null> {
  const data = await atFetch(T_PAR, {
    filterByFormula: `{slug} = "${slug}"`
  });
  const rec = data.records[0];
  return rec ? mapParty(rec) : null;
}

export async function allPoliticianSlugs(): Promise<string[]> {
  const data = await atFetch(T_POL, { fields: "slug" });
  return data.records.map((r:any) => r.fields?.slug || r.id).filter(Boolean);
}

export async function allPartySlugs(): Promise<string[]> {
  const data = await atFetch(T_PAR, { fields: "slug" });
  return data.records.map((r:any) => r.fields?.slug || r.id).filter(Boolean);
}
