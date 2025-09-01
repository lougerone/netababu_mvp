'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import AvatarSquare from '@/components/AvatarSquare';
import type { Politician } from '@/lib/airtable';

/* ---------------- Locked & Optional columns ---------------- */
// Always shown + un-toggleable
const LOCKED = [
  { key: 'id_header', label: '' }, // special header row with avatar + name + party badge
  { key: 'constituency', label: 'Constituency' },
  { key: 'current_position', label: 'Current Position' },
] as const;

// Toggleable (only fields we actually map from Airtable)
const OPTIONAL: { key: keyof Politician; label: string }[] = [
  { key: 'state', label: 'State' },
  { key: 'age', label: 'Age' },
  { key: 'yearsInPolitics', label: 'Years in Politics' },
  { key: 'attendance', label: 'Parliament Attendance' },
  { key: 'assets', label: 'Declared Assets' },
  { key: 'liabilities', label: 'Declared Liabilities' },
  { key: 'criminalCases', label: 'Criminal Cases' },
  { key: 'website', label: 'Website' },
];

/* ---------------- Styling helpers ---------------- */
const PARTY_COLORS: Record<string, string> = {
  'Bharatiya Janata Party': 'bg-[#FFCC00] text-black', // saffron-ish
  'Indian National Congress': 'bg-[#138808] text-white', // green
  'Aam Aadmi Party': 'bg-[#1E90FF] text-white',
  'Trinamool Congress': 'bg-[#228B22] text-white',
};

function partyBadgeClass(party?: string | null) {
  if (!party) return 'bg-cream-300 text-ink-700';
  return PARTY_COLORS[party] || 'bg-cream-300 text-ink-700';
}

/* ---------------- Formatting helpers ---------------- */
const INR = new Intl.NumberFormat('en-IN');
function fmtVal(key: string, val: unknown): string {
  if (val == null) return '—';
  if (Array.isArray(val)) return val.length ? val.join(', ') : '—';

  if (key === 'attendance') {
    const n = Number(String(val).replace(/[^\d.]/g, ''));
    return Number.isFinite(n) ? `${n}%` : String(val);
  }
  if (key === 'assets' || key === 'liabilities') {
    const n = Number(String(val).replace(/[^\d.]/g, ''));
    return Number.isFinite(n) ? `₹${INR.format(n)}` : String(val);
  }
  if (key === 'age' || key === 'yearsInPolitics' || key === 'criminalCases') {
    const n = Number(String(val).replace(/[^\d.]/g, ''));
    return Number.isFinite(n) ? INR.format(n) : String(val);
  }
  return String(val).trim() || '—';
}

/* ---------------- Cell renderers ---------------- */
function renderWebsite(url?: string | null) {
  if (!url) return '—';
  const label = url.replace(/^https?:\/\//, '').replace(/\/$/, '');
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="underline text-saffron-700">
      {label}
    </a>
  );
}

function renderValue(field: string, p?: Politician) {
  if (!p) return '—';
  if (field === 'website') return renderWebsite(p.website ?? null);
  if (field === 'current_position') return fmtVal(field, p.current_position ?? (p as any).position);
  // generic
  return fmtVal(field, (p as any)[field]);
}

/* ---------------- Click outside + debounce ---------------- */
function useOnClickOutside(ref: React.RefObject<HTMLElement>, fn: () => void) {
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) fn();
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [fn, ref]);
}

function useDebounced<T>(value: T, ms = 250) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

/* ---------------- Async suggestions (fallback to local) ---------------- */
async function fetchSuggestions(q: string): Promise<Politician[] | null> {
  if (!q.trim()) return null;
  try {
    // Optional API route. If you don’t have it, this will 404 and we’ll fallback to local filter.
    const u = `/api/search-politicians?q=${encodeURIComponent(q.trim())}`;
    const r = await fetch(u, { cache: 'no-store' });
    if (!r.ok) return null;
    const data = await r.json();
    // Expect array of politicians; otherwise ignore
    if (Array.isArray(data)) return data as Politician[];
    if (Array.isArray(data?.items)) return data.items as Politician[];
    return null;
  } catch {
    return null;
  }
}

/* ---------------- Combobox (parties-style search) ---------------- */
type ComboProps = {
  label: string;
  items: Politician[];      // local list fallback
  valueId?: string;
  onChangeId: (id: string) => void;
};

function ComboBox({ label, items, valueId, onChangeId }: ComboProps) {
  const me = items.find((p) => p.id === valueId);
  const [open, setOpen] = useState(false);             // dropdown is closed by default
  const [q, setQ] = useState('');                      // start empty (placeholder visible)
  const debouncedQ = useDebounced(q, 200);
  const [remote, setRemote] = useState<Politician[] | null>(null);
  const [idx, setIdx] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  useOnClickOutside(ref, () => setOpen(false));

  // keep input text in sync with a chosen value (when user picks)
  useEffect(() => {
    if (me && !open && !q) {
      // don’t prefill; we keep placeholder until user types
      // if you WANT the chosen name shown, set q to `${me.name} — ${me.party ?? ''}` here.
    }
  }, [me, open, q]);

  // async suggestions (optional API)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!debouncedQ.trim()) {
        setRemote(null);
        return;
      }
      const res = await fetchSuggestions(debouncedQ);
      if (!cancelled) setRemote(res);
    })();
    return () => {
      cancelled = true;
    };
  }, [debouncedQ]);

  const filtered = useMemo(() => {
    const base =
      remote ??
      (q.trim()
        ? items.filter((p) => {
            const s = q.toLowerCase();
            return (
              p.name.toLowerCase().includes(s) ||
              (p.party ?? '').toLowerCase().includes(s) ||
              (p.constituency ?? '').toLowerCase().includes(s) ||
              (p.state ?? '').toLowerCase().includes(s)
            );
          })
        : []);
    const seen = new Set<string>();
    const out: Politician[] = [];
    for (const p of base) {
      if (!seen.has(p.id)) {
        out.push(p);
        seen.add(p.id);
      }
      if (out.length >= 200) break; // generous but capped
    }
    return out;
  }, [items, q, remote]);

  useEffect(() => {
    if (idx >= filtered.length) setIdx(filtered.length - 1);
    if (idx < 0) setIdx(0);
  }, [idx, filtered.length]);

  const choose = (p: Politician) => {
    onChangeId(p.id);
    setOpen(false);
    setQ(''); // return to placeholder after choose (matches “search” feel)
  };

  return (
    <div ref={ref}>
      <label className="block text-sm mb-1">{label}</label>
      <div className="relative">
        {/* search icon (like Parties page) */}
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-600/70"
          viewBox="0 0 20 20" fill="currentColor"
        >
          <path fillRule="evenodd" d="M13.5 12a6 6 0 1 0-1.5 1.5l3.75 3.75a1 1 0 0 0 1.5-1.5L13.5 12Zm-5.5 1a4 4 0 1 1 0-8 4 4 0 0 1 0 8Z" clipRule="evenodd"/>
        </svg>

        <input
          className="input-pill w-full h-12 pl-9 placeholder:text-ink-600/60"
          value={q}
          placeholder="Search by name, party, constituency…"
          onChange={(e) => {
            const v = e.target.value;
            setQ(v);
            setIdx(0);
            setOpen(v.trim().length > 0);   // ← ONLY open on typing
          }}
          // no onFocus opening; list appears only when typing
          onKeyDown={(e) => {
            if (!open) return;
            if (e.key === 'ArrowDown') {
              e.preventDefault();
              setIdx((i) => Math.min(i + 1, filtered.length - 1));
            } else if (e.key === 'ArrowUp') {
              e.preventDefault();
              setIdx((i) => Math.max(i - 1, 0));
            } else if (e.key === 'Enter') {
              e.preventDefault();
              const p = filtered[idx];
              if (p) choose(p);
            } else if (e.key === 'Escape') {
              setOpen(false);
            }
          }}
        />

        {/* chosen chip (shows selected value like Parties filters) */}
        {me && (
          <div className="mt-2 text-[12px] text-ink-600/80">
            Selected: <span className="font-medium">{me.name}</span>
            {me.party ? ` — ${me.party}` : ''}
          </div>
        )}

        {open && (
          <div className="absolute z-40 mt-1 w-full rounded-xl border border-black/10 bg-white shadow-card max-h-72 overflow-auto">
            {filtered.length === 0 ? (
              <div className="px-3 py-2 text-sm text-ink-600/70">No matches</div>
            ) : (
              filtered.map((p, i) => (
                <button
                  key={p.id}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => choose(p)}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-cream-200/60 ${
                    i === idx ? 'bg-cream-200/80' : ''
                  }`}
                >
                  <div className="font-medium">{p.name}</div>
                  <div className="text-ink-600/80 text-[12px]">
                    {(p.party ?? '') + (p.constituency ? ` • ${p.constituency}` : '')}
                  </div>
                </button>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------- Multi-select dropdown ---------------- */
type MultiProps = {
  label: string;
  options: { key: keyof Politician; label: string }[];
  value: Set<keyof Politician>;
  onToggle: (k: keyof Politician) => void;
};

function MultiSelect({ label, options, value, onToggle }: MultiProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useOnClickOutside(ref, () => setOpen(false));

  const summary =
    options.filter((o) => value.has(o.key)).map((o) => o.label).join(', ') || 'None';

  return (
    <div ref={ref}>
      <label className="block text-sm mb-1">{label}</label>
      <button
        type="button"
        className="input-pill w-full text-left truncate"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        title={summary}
      >
        {summary}
      </button>
      {open && (
        <div className="relative">
          <div className="absolute z-40 mt-1 w-full rounded-xl border border-black/10 bg-white shadow-card max-h-72 overflow-auto">
            {options.map((o) => (
              <label
                key={String(o.key)}
                className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-cream-200/60 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={value.has(o.key)}
                  onChange={() => onToggle(o.key)}
                />
                {o.label}
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------- URL sync helpers ---------------- */
function toSlugOrId(p?: Politician | null) {
  if (!p) return '';
  return p.slug || p.id;
}
function uniq<T>(arr: T[]) {
  return Array.from(new Set(arr));
}

// ---------------- Main component ----------------
export default function CompareTable({ politicians }: { politicians: Politician[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const sorted = useMemo(
    () => [...politicians].sort((a, b) => a.name.localeCompare(b.name)),
    [politicians]
  );

  // Initial A/B from URL, but if not present -> undefined
  const initialA = sp?.get('a');
  const initialB = sp?.get('b');
  const initialFields = sp?.get('fields');

  const findByKey = (k?: string | null) =>
    sorted.find((p) => k && (p.slug?.toLowerCase() === k.toLowerCase() || p.id === k));

  // 👇 default to undefined instead of sorted[0], sorted[1]
  const [aId, setAId] = useState<string | undefined>(findByKey(initialA)?.id);
  const [bId, setBId] = useState<string | undefined>(findByKey(initialB)?.id);

  const [enabled, setEnabled] = useState<Set<keyof Politician>>(() => {
    const fromUrl = (initialFields || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean) as (keyof Politician)[];
    const valid = new Set(fromUrl.filter((k) => OPTIONAL.some((o) => o.key === k)));
    if (valid.size === 0) {
      valid.add('state');
      valid.add('age');
    }
    return valid;
  });

  const A = useMemo(() => sorted.find((p) => p.id === aId), [sorted, aId]);
  const B = useMemo(() => sorted.find((p) => p.id === bId), [sorted, bId]);

  // URL sync whenever A/B/fields change
  useEffect(() => {
    const params = new URLSearchParams(sp?.toString());
    if (A) params.set('a', toSlugOrId(A));
    if (B) params.set('b', toSlugOrId(B));
    const fields = OPTIONAL.filter((o) => enabled.has(o.key)).map((o) => o.key);
    if (fields.length) params.set('fields', uniq(fields).join(','));
    else params.delete('fields');

    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [A, B, enabled]);

  const toggle = (k: keyof Politician) =>
    setEnabled((prev) => {
      const next = new Set(prev);
      next.has(k) ? next.delete(k) : next.add(k);
      return next;
    });

  const activeOptional = OPTIONAL.filter((c) => enabled.has(c.key));

  // Filter out rows where BOTH A and B are '—'
  const shouldShow = (field: string) => {
    const va = field === 'current_position'
      ? (A?.current_position ?? (A as any)?.position)
      : (A as any)?.[field];
    const vb = field === 'current_position'
      ? (B?.current_position ?? (B as any)?.position)
      : (B as any)?.[field];
    const sa = fmtVal(field, field === 'website' ? A?.website : va);
    const sb = fmtVal(field, field === 'website' ? B?.website : vb);
    return !(sa === '—' && sb === '—');
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="card p-4">
        <div className="grid md:grid-cols-3 gap-4 items-start">
          <ComboBox label="Select A" items={sorted} valueId={aId} onChangeId={setAId} />
          <ComboBox label="Select B" items={sorted} valueId={bId} onChangeId={setBId} />
          <MultiSelect
            label="Add datapoints"
            options={OPTIONAL}
            value={enabled}
            onToggle={toggle}
          />
        </div>
      </div>

      {/* Comparison table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-cream-200/95 backdrop-blur z-10">
            <tr className="text-left text-ink-600/80">
              <th className="w-[240px] py-2 pr-4">Metric</th>
              <th className="py-2 pr-4">A</th>
              <th className="py-2 pr-4">B</th>
            </tr>
          </thead>
          <tbody className="[&_tr]:border-t [&_tr]:border-black/10">
            {/* Header row with avatar + name + party badge */}
            <tr>
              <td className="py-3 pr-4 font-medium">Identity</td>
              <td className="py-3 pr-4">
                {A ? (
                  <div className="flex items-center gap-2">
                    <AvatarSquare src={A.photo ?? null} alt={A.name} size={40} rounded="lg" />
                    <div className="min-w-0">
                      <div className="font-medium truncate">{A.name}</div>
                      <div
                        className={`inline-block mt-0.5 px-2 py-0.5 rounded-md text-[11px] ${partyBadgeClass(
                          A.party
                        )}`}
                        title={A.party ?? undefined}
                      >
                        {A.party || 'Unknown'}
                      </div>
                    </div>
                  </div>
                ) : (
                  '—'
                )}
              </td>
              <td className="py-3 pr-4">
                {B ? (
                  <div className="flex items-center gap-2">
                    <AvatarSquare src={B.photo ?? null} alt={B.name} size={40} rounded="lg" />
                    <div className="min-w-0">
                      <div className="font-medium truncate">{B.name}</div>
                      <div
                        className={`inline-block mt-0.5 px-2 py-0.5 rounded-md text-[11px] ${partyBadgeClass(
                          B.party
                        )}`}
                        title={B.party ?? undefined}
                      >
                        {B.party || 'Unknown'}
                      </div>
                    </div>
                  </div>
                ) : (
                  '—'
                )}
              </td>
            </tr>

            {/* Always-on rows */}
            {['constituency', 'current_position'].map((f) =>
              shouldShow(f) ? (
                <tr key={`locked-${f}`} className="odd:bg-cream-100/50">
                  <td className="py-3 pr-4 font-medium">
                    {f === 'constituency' ? 'Constituency' : 'Current Position'}
                  </td>
                  <td className="py-3 pr-4">{renderValue(f, A)}</td>
                  <td className="py-3 pr-4">{renderValue(f, B)}</td>
                </tr>
              ) : null
            )}

            {/* Optional rows (only when at least one has data) */}
            {activeOptional.map((c) =>
              shouldShow(c.key as string) ? (
                <tr key={`opt-${String(c.key)}`} className="odd:bg-cream-100/50">
                  <td className="py-3 pr-4">{c.label}</td>
                  <td className="py-3 pr-4">{renderValue(c.key as string, A)}</td>
                  <td className="py-3 pr-4">{renderValue(c.key as string, B)}</td>
                </tr>
              ) : null
            )}
          </tbody>
        </table>
      </div>

      <div className="text-xs text-ink-600/70">— means not available.</div>
    </div>
  );
}
