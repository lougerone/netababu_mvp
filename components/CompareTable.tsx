// app/components/CompareTable.tsx
'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import AvatarSquare from '@/components/AvatarSquare';
import type { Politician } from '@/lib/airtable';

/* ---------------- utils ---------------- */
const norm = (s: string) =>
  s.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

const INR = new Intl.NumberFormat('en-IN');

function formatINRCompact(n: number) {
  if (!Number.isFinite(n)) return '';
  if (n >= 1e7) return `₹${(n / 1e7).toFixed(n % 1e7 ? 1 : 0)} cr`;
  if (n >= 1e5) return `₹${(n / 1e5).toFixed(n % 1e5 ? 1 : 0)} lakh`;
  return `₹${INR.format(n)}`;
}

const toTitle = (s: string) => s.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());

function fmtVal(key: string, val: unknown): string {
  if (val == null) return '—';
  if (Array.isArray(val)) return val.length ? val.join(', ') : '—';

  const num = Number(String(val).replace(/[^\d.-]/g, ''));
  if (key === 'attendance') return Number.isFinite(num) ? `${num}%` : String(val);
  if (key === 'assets') return Number.isFinite(num) ? formatINRCompact(num) : String(val);
  if (key === 'age' || key === 'yearsInPolitics' || key === 'criminalCases') {
    if (Number.isFinite(num)) return key === 'criminalCases' && num === 0 ? 'None' : INR.format(num);
  }
  if (key === 'constituency') {
    const s = String(val).trim();
    const m = s.match(/^(.+?)\s*\(([A-Za-z]{2})\)$/);
    if (m) return `${toTitle(m[1].trim())} (${m[2].toUpperCase()})`;
    return toTitle(s);
  }
  if (key === 'current_position') {
    const s = String(val).trim();
    if (s.toLowerCase() === 'mop') return 'MP';
    return toTitle(s);
  }
  return String(val).trim() || '—';
}

function renderWebsite(url?: string | null) {
  if (!url) return '—';
  const href = /^https?:\/\//i.test(url) ? url : `https://${url}`;
  const label = href.replace(/^https?:\/\//, '').replace(/\/$/, '');
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="underline text-saffron-700">
      {label}
    </a>
  );
}

function renderTwitter(tw?: string | null) {
  if (!tw) return '—';
  let handle = String(tw).trim();
  if (/^https?:\/\//i.test(handle)) {
    try { handle = new URL(handle).pathname.replace(/^\/+/, ''); } catch {}
  }
  if (handle.startsWith('@')) handle = handle.slice(1);
  if (!handle) return '—';
  return (
    <a href={`https://x.com/${handle}`} target="_blank" rel="noopener noreferrer" className="underline text-saffron-700">
      @{handle}
    </a>
  );
}

function renderCreated(created?: string | Date | null) {
  if (!created) return '—';
  const d = new Date(created);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function renderValue(field: string, p?: Politician) {
  if (!p) return '—';
  if (field === 'website') return renderWebsite((p as any).website ?? null);
  if (field === 'twitter') return renderTwitter((p as any).twitter ?? (p as any).twitter_profile ?? (p as any).twitter_url ?? (p as any).x ?? null);
  if (field === 'created') return renderCreated((p as any).Created ?? (p as any).created ?? (p as any).createdTime);
  if (field === 'current_position') return fmtVal(field, (p as any).current_position ?? (p as any).position);
  return fmtVal(field, (p as any)[field]);
}

/* ---------------- optional rows ---------------- */
// keep assets, remove liabilities; include twitter + created
const OPTIONAL: { key: keyof Politician; label: string }[] = [
  { key: 'age', label: 'Age' },
  { key: 'yearsInPolitics', label: 'Years in Politics' },
  { key: 'attendance', label: 'Parliament Attendance' },
  { key: 'assets', label: 'Declared Assets' },
  { key: 'criminalCases', label: 'Criminal Cases' },
  { key: 'website', label: 'Website' },
  { key: 'twitter' as keyof Politician, label: 'Twitter' },
  { key: 'created' as keyof Politician, label: 'Last Updated' },
];

/* ---------------- party badge ---------------- */
const PARTY_COLORS: Record<string, string> = {
  'Bharatiya Janata Party': 'bg-[#FFCC00] text-black',
  'Indian National Congress': 'bg-[#138808] text-white',
  'Aam Aadmi Party': 'bg-[#1E90FF] text-white',
  'Trinamool Congress': 'bg-[#228B22] text-white',
};
function partyBadgeClass(party?: string | null) {
  if (!party) return 'bg-cream-300 text-ink-700';
  return PARTY_COLORS[party] || 'bg-cream-300 text-ink-700';
}

/* ---------------- click outside + debounce ---------------- */
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

/* ---------------- optional remote suggestions ---------------- */
async function fetchSuggestions(q: string): Promise<Politician[] | null> {
  if (!q.trim()) return null;
  try {
    const u = `/api/search-politicians?q=${encodeURIComponent(q.trim())}`;
    const r = await fetch(u, { cache: 'no-store' });
    if (!r.ok) return null;
    const data = await r.json();
    if (Array.isArray(data)) return data as Politician[];
    if (Array.isArray(data?.items)) return data.items as Politician[];
    return null;
  } catch {
    return null;
  }
}

/* ---------------- combobox ---------------- */
type ComboProps = {
  label: string;
  items: Politician[];
  valueId?: string;
  onChangeId: (id: string) => void;
};

function ComboBox({ label, items, valueId, onChangeId }: ComboProps) {
  const me = items.find((p) => p.id === valueId);
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const debouncedQ = useDebounced(q, 200);
  const [remote, setRemote] = useState<Politician[] | null>(null);
  const [idx, setIdx] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  useOnClickOutside(ref, () => setOpen(false));

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
    return () => { cancelled = true; };
  }, [debouncedQ]);

  const filtered = useMemo(() => {
    const base =
      remote ??
      (q.trim()
        ? items.filter((p) => {
            const hay = norm(
              [p.name, p.party, p.constituency, (p as any).state].filter(Boolean).join(' ')
            );
            const needle = norm(q);
            return hay.includes(needle);
          })
        : []);
    const seen = new Set<string>();
    const out: Politician[] = [];
    for (const p of base) {
      if (!seen.has(p.id)) {
        out.push(p);
        seen.add(p.id);
      }
      if (out.length >= 200) break;
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
    setQ('');
  };

  return (
    <div ref={ref}>
      <label className="block text-sm mb-1">{label}</label>
      <div className="relative">
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-600/70"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M13.5 12a6 6 0 1 0-1.5 1.5l3.75 3.75a1 1 0 0 0 1.5-1.5L13.5 12Zm-5.5 1a4 4 0 1 1 0-8 4 4 0 0 1 0 8Z"
            clipRule="evenodd"
          />
        </svg>

        <input
          type="search"
          className="input-pill input-pill--with-icon w-full h-12 placeholder:text-ink-600/60"
          placeholder="Search by name, party, constituency…"
          value={q}
          onChange={(e) => {
            const v = e.target.value;
            setQ(v);
            setIdx(0);
            setOpen(v.trim().length > 0);
          }}
          onKeyDown={(e) => {
            if (!open) return;
            if (e.key === 'ArrowDown') { e.preventDefault(); setIdx((i) => Math.min(i + 1, filtered.length - 1)); }
            else if (e.key === 'ArrowUp') { e.preventDefault(); setIdx((i) => Math.max(i - 1, 0)); }
            else if (e.key === 'Enter') { e.preventDefault(); const p = filtered[idx]; if (p) choose(p); }
            else if (e.key === 'Escape') { setOpen(false); }
          }}
        />

        {me && (
          <div className="mt-2 text-[12px] text-ink-600/80">
            Selected: <span className="font-medium">{me.name}</span>{me.party ? ` — ${me.party}` : ''}
          </div>
        )}

        {open && (
          <div className="absolute z-[200] mt-1 w-full rounded-xl border border-black/10 bg-white shadow-card max-h-72 overflow-auto">
            {filtered.length === 0 ? (
              <div className="px-3 py-2 text-sm text-ink-600/70">No matches</div>
            ) : (
              filtered.map((p, i) => (
                <button
                  key={p.id}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => choose(p)}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-cream-200/60 ${i === idx ? 'bg-cream-200/80' : ''}`}
                >
                  <div className="font-medium">{p.name}</div>
                  <div className="text-ink-600/80 text-[12px]">
                    {(p.party ?? '') + (p.constituency ? ` • ${fmtVal('constituency', p.constituency)}` : '')}
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

/* ---------------- multi-select (no 'state') ---------------- */
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
          <div className="absolute z-[200] mt-1 w-full rounded-xl border border-black/10 bg-white shadow-card max-h-72 overflow-auto">
            {options.map((o) => (
              <label
                key={String(o.key)}
                className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-cream-200/60 cursor-pointer"
              >
                <input type="checkbox" checked={value.has(o.key)} onChange={() => onToggle(o.key)} />
                {o.label}
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------- helpers ---------------- */
function toSlugOrId(p?: Politician | null) {
  if (!p) return '';
  return p.slug || p.id;
}
function uniq<T>(arr: T[]) {
  return Array.from(new Set(arr));
}

/* ---------------- main ---------------- */
export default function CompareTable({ politicians }: { politicians: Politician[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const sorted = useMemo(
    () => [...politicians].sort((a, b) => a.name.localeCompare(b.name)),
    [politicians]
  );

  const initialA = sp?.get('a');
  const initialB = sp?.get('b');
  const initialFields = sp?.get('fields');

  const findByKey = (k?: string | null) =>
    sorted.find((p) => k && (p.slug?.toLowerCase() === k.toLowerCase() || p.id === k));

  const [aId, setAId] = useState<string | undefined>(findByKey(initialA)?.id);
  const [bId, setBId] = useState<string | undefined>(findByKey(initialB)?.id);

  // Default attributes
  const [enabled, setEnabled] = useState<Set<keyof Politician>>(() => {
    const fromUrl = (initialFields || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean) as (keyof Politician)[];
    const valid = new Set(fromUrl.filter((k) => OPTIONAL.some((o) => o.key === k)));
    if (valid.size === 0) {
      valid.add('age');
      valid.add('yearsInPolitics');
      valid.add('twitter' as keyof Politician);
      valid.add('created' as keyof Politician);
    }
    return valid;
  });

  const A = useMemo(() => sorted.find((p) => p.id === aId), [sorted, aId]);
  const B = useMemo(() => sorted.find((p) => p.id === bId), [sorted, bId]);

  useEffect(() => {
    const params = new URLSearchParams(sp?.toString());
    if (A) params.set('a', toSlugOrId(A));
    if (B) params.set('b', toSlugOrId(B));
    const fields = OPTIONAL.filter((o) => enabled.has(o.key)).map((o) => o.key);
    if (fields.length) params.set('fields', uniq(fields).join(',')); else params.delete('fields');
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

  const shouldShow = (field: string) => {
    const sa = renderValue(field, A);
    const sb = renderValue(field, B);
    return !(sa === '—' && sb === '—');
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="card p-4">
        <div className="grid items-start gap-4 md:grid-cols-3">
          <ComboBox label="Neta A" items={sorted} valueId={aId} onChangeId={setAId} />
          <ComboBox label="Neta B" items={sorted} valueId={bId} onChangeId={setBId} />
          <MultiSelect label="Add attributes" options={OPTIONAL} value={enabled} onToggle={toggle} />
        </div>
      </div>

      {/* Comparison table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <caption className="sr-only">Compare Netas</caption>

          {/* Header: BIGGER photo + name (no A/B letters) */}
          <thead className="sticky top-[64px] z-[150] bg-cream-200/95 backdrop-blur">
            <tr className="text-left text-ink-600/80 align-middle">
              <th scope="col" className="w-[240px] py-3 pr-4">Attribute</th>

              <th scope="col" className="py-3 pr-4">
                {A ? (
                  <div className="flex min-w-0 items-center gap-3">
                    <AvatarSquare src={A.photo ?? null} alt={A.name} size={44} rounded="lg" />
                    <span className="max-w-[220px] truncate font-semibold text-ink-700">{A.name}</span>
                  </div>
                ) : (
                  <span className="text-ink-500">Select Neta</span>
                )}
              </th>

              <th scope="col" className="py-3 pr-4">
                {B ? (
                  <div className="flex min-w-0 items-center gap-3">
                    <AvatarSquare src={B.photo ?? null} alt={B.name} size={44} rounded="lg" />
                    <span className="max-w-[220px] truncate font-semibold text-ink-700">{B.name}</span>
                  </div>
                ) : (
                  <span className="text-ink-500">Select Neta</span>
                )}
              </th>
            </tr>
          </thead>

          <tbody className="[&_tr]:border-t [&_tr]:border-black/10">
            {/* Always-on rows */}
            {['party', 'constituency', 'current_position'].map((f) =>
              shouldShow(f) ? (
                <tr key={`locked-${f}`} className="odd:bg-cream-100/50">
                  <th scope="row" className="py-3 pr-4 font-medium">
                    {f === 'party' ? 'Party' : f === 'constituency' ? 'Constituency' : 'Current Position'}
                  </th>
                  <td className="py-3 pr-4">{renderValue(f, A)}</td>
                  <td className="py-3 pr-4">{renderValue(f, B)}</td>
                </tr>
              ) : null
            )}

            {/* Optional rows */}
            {activeOptional.map((c) =>
              shouldShow(c.key as string) ? (
                <tr key={`opt-${String(c.key)}`} className="odd:bg-cream-100/50">
                  <th scope="row" className="py-3 pr-4">{c.label}</th>
                  <td className="py-3 pr-4">{renderValue(String(c.key), A)}</td>
                  <td className="py-3 pr-4">{renderValue(String(c.key), B)}</td>
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
