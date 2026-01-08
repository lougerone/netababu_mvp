// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';
import { unstable_noStore as noStore } from 'next/cache';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
   throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/* ────────────────────────────────────────────────────────────────────────────── 
 Types
─────────────────────────────────────────────────────────────────────────────── */

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
   age?: string | null;
   years_in_politics?: string | null;
   attendance?: string | null;
   assets?: string | null;
   liabilities?: string | null;
   criminal_cases?: string | null;
   website?: string | null;
   twitter?: string | null;
   created_at?: string | null;
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
   symbol_text?: string | null;
   seats?: number | null;
   details?: string | null;
   created_at?: string | null;
};

/* ────────────────────────────────────────────────────────────────────────────── 
 Helpers
─────────────────────────────────────────────────────────────────────────────── */

function parseIntOrNull(v: unknown): number | null {
   if (v === null || v === undefined || v === '') return null;
   const n = parseInt(String(v), 10);
   return Number.isNaN(n) ? null : n;
}

function ensureArray(v: unknown): string[] {
   if (Array.isArray(v)) return v.filter(Boolean);
   if (typeof v === 'string' && v) return [v];
   return [];
}

/* ────────────────────────────────────────────────────────────────────────────── 
 Politicians
─────────────────────────────────────────────────────────────────────────────── */

export async function listPoliticians(
   opts: { limit?: number; query?: string } = {}
  ): Promise<Politician[]> {
   noStore();

 let query = supabase
   .from('politicians')
   .select('*')
   .order('Name', { ascending: true });

 // Search: name, party, constituency, state
 if (opts.query) {
    const q = opts.query.toLowerCase();
    query = query.or(
       `Name.ilike.%${q}%,Party.ilike.%${q}%,Constituency.ilike.%${q}%,state.ilike.%${q}%`
       );
 }

 const limit = opts.limit && opts.limit > 0 ? opts.limit : 500;
   query = query.limit(limit);

 const { data, error } = await query;
     console.log('DEBUG: Query result -', { data, error, dataLength: data?.length });

 if (error) {
    console.error('Supabase error fetching politicians:', error);
    return [];
 }

 return (data || []).map(row => ({
    id: row.id,
    slug: row.slug,
    name: row.Name,
    dob: row.dob || null,
    offices: ensureArray(row.offices),
    life_events: row.life_events || null,
    photo: row.photo,
    links: ensureArray(row.links),
    party: row.Party || '',
    state: row.state,
    current_position: row.current_position,
    position: row.Position,
    constituency: row.Constituency,
    age: row.Age,
    years_in_politics: row['Years in Politics'],
    attendance: row['Parliament Attendance'],
    assets: row['Declared Assets'],
    liabilities: row.liabilities,
    criminal_cases: row['Criminal Cases'],
    website: row.Website,
    twitter: row.Twitter,
    created_at: row.created,
 }));
}

export async function getPoliticianBySlug(slug: string): Promise<Politician | null> {
   noStore();

 const { data, error } = await supabase
   .from('politicians')
   .select('*')
   .eq('slug', slug.toLowerCase())
   .single();

 if (error || !data) return null;

 return {
    id: data.id,
    slug: data.slug,
    name: data.Name,
    dob: data.dob || null,
    offices: ensureArray(data.offices),
    life_events: data.life_events || null,
    photo: data.photo,
    links: ensureArray(data.links),
    party: data.Party || '',
    state: data.state,
    current_position: data.current_position,
    position: data.Position,
    constituency: data.Constituency,
    age: data.Age,
    years_in_politics: data['Years in Politics'],
    attendance: data['Parliament Attendance'],
    assets: data['Declared Assets'],
    liabilities: data.liabilities,
    criminal_cases: data['Criminal Cases'],
    website: data.Website,
    twitter: data.Twitter,
    created_at: data.created,
 };
}

export async function getPolitician(slugOrId: string): Promise<Politician | null> {
   noStore();

      if (slugOrId.startsWith('rec')) {
         // Try by ID
   const { data, error } = await supabase
         .from('politicians')
         .select('*')
         .eq('id', slugOrId)
         .single();

   if (error || !data) return null;

   return {
      id: data.id,
      slug: data.slug,
      name: data.Name,
      dob: data.dob || null,
      offices: ensureArray(data.offices),
      life_events: data.life_events || null,
      photo: data.photo,
      links: ensureArray(data.links),
      party: data.Party || '',
      state: data.state,
      current_position: data.current_position,
      position: data.Position,
      constituency: data.Constituency,
      age: data.Age,
      years_in_politics: data['Years in Politics'],
      attendance: data['Parliament Attendance'],
      assets: data['Declared Assets'],
      liabilities: data.liabilities,
      criminal_cases: data['Criminal Cases'],
      website: data.Website,
      twitter: data.Twitter,
      created_at: data.created,
   };
      }

 return getPoliticianBySlug(slugOrId);
}

export async function listRecentPoliticians(limit = 4): Promise<Politician[]> {
   noStore();

 const { data, error } = await supabase
   .from('politicians')
   .select('*')
   .order('created', { ascending: false })
   .limit(limit);

 if (error) return [];

 return (data || []).map(row => ({
    id: row.id,
    slug: row.slug,
    name: row.Name,
    dob: row.dob || null,
    offices: ensureArray(row.offices),
    life_events: row.life_events || null,
    photo: row.photo,
    links: ensureArray(row.links),
    party: row.Party || '',
    state: row.state,
    current_position: row.current_position,
    position: row.Position,
    constituency: row.Constituency,
    age: row.Age,
    years_in_politics: row['Years in Politics'],
    attendance: row['Parliament Attendance'],
    assets: row['Declared Assets'],
    liabilities: row.liabilities,
    criminal_cases: row['Criminal Cases'],
    website: row.Website,
    twitter: row.Twitter,
    created_at: row.created,
 }));
}

/* ────────────────────────────────────────────────────────────────────────────── 
 Parties
─────────────────────────────────────────────────────────────────────────────── */

export async function listParties(
   opts: { limit?: number; query?: string } = {}
  ): Promise<Party[]> {
   noStore();

 let query = supabase
   .from('parties')
   .select('*')
   .order('name', { ascending: true });

 if (opts.query) {
    const q = opts.query.toLowerCase();
    query = query.or(
       `name.ilike.%${q}%,abbr.ilike.%${q}%,state.ilike.%${q}%`
       );
 }

 const limit = opts.limit && opts.limit > 0 ? opts.limit : 500;
   query = query.limit(limit);

 const { data, error } = await query;

 if (error) {
    console.error('Supabase error fetching parties:', error);
    return [];
 }

 return (data || []).map(row => ({
    id: row.id,
    slug: row.slug,
    name: row.name,
    abbr: row.abbr,
    state: row.state || null,
    status: row.status || null,
    founded: row.founded || null,
    logo: row.logo,
    leaders: ensureArray(row.leaders),
    symbol_text: row.symbol_text || null,
    seats: parseIntOrNull(row.seats),
    details: row.details || null,
    created_at: row.created_at,
 }));
}

export async function getPartyBySlug(slug: string): Promise<Party | null> {
   noStore();

 const { data, error } = await supabase
   .from('parties')
   .select('*')
   .eq('slug', slug.toLowerCase())
   .single();

 if (error || !data) return null;

 return {
    id: data.id,
    slug: data.slug,
    name: data.name,
    abbr: data.abbr,
    state: data.state || null,
    status: data.status || null,
    founded: data.founded || null,
    logo: data.logo,
    leaders: ensureArray(data.leaders),
    symbol_text: data.symbol_text || null,
    seats: parseIntOrNull(data.seats),
    details: data.details || null,
    created_at: data.created_at,
 };
}

export async function listTopPartiesBySeats(limit = 6): Promise<Party[]> {
   noStore();

 const { data, error } = await supabase
   .from('parties')
   .select('*')
   .order('seats', { ascending: false })
   .limit(limit);

 if (error) return [];

 return (data || []).map(row => ({
    id: row.id,
    slug: row.slug,
    name: row.name,
    abbr: row.abbr,
    state: row.state || null,
    status: row.status || null,
    founded: row.founded || null,
    logo: row.logo,
    leaders: ensureArray(row.leaders),
    symbol_text: row.symbol_text || null,
    seats: parseIntOrNull(row.seats),
    details: row.details || null,
    created_at: row.created_at,
 }));
}

export async function listRecentParties(limit = 4): Promise<Party[]> {
   noStore();

 const { data, error } = await supabase
   .from('parties')
   .select('*')
   .order('created_at', { ascending: false })
   .limit(limit);

 if (error) return [];

 return (data || []).map(row => ({
    id: row.id,
    slug: row.slug,
    name: row.name,
    abbr: row.abbr,
    state: row.state || null,
    status: row.status || null,
    founded: row.founded || null,
    logo: row.logo,
    leaders: ensureArray(row.leaders),
    symbol_text: row.symbol_text || null,
    seats: parseIntOrNull(row.seats),
    details: row.details || null,
    created_at: row.created_at,
 }));
}

export async function allPartySlugs(): Promise<string[]> {
   noStore();

 const { data, error } = await supabase
   .from('parties')
   .select('slug');

 if (error) return [];
   return (data || []).map(p => p.slug).filter(Boolean);
}
