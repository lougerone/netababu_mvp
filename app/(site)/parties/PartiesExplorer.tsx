// app/(site)/parties/PartiesExplorer.tsx
'use client';

import Link from 'next/link';
import type { Party } from '@/lib/airtable';
import { useEffect, useMemo, useState } from 'react';
import AvatarSquare from '@/components/AvatarSquare';
import { pickPartyLogo, proxyImage } from '@/lib/data';

type Props = { initialParties: Party[]; initialQuery?: string };

// ---------- helpers ----------
function toInt(v: unknown): number | null {
  if (v == null) return null;
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string') {
    const n = parseInt(v.replace(/[, ]+/g, ''), 10);
    return Number.isNaN(n) ? null : n;
  }
  return null;
}
const seatsNum = (p: Party) => toInt(p.seats) ?? 0;
const cx = (...c: Array<string | false | null | undefined>) => c.filter(Boolean).join(' ');

type Badge = 'National' | 'State' | null;

// Normalize status from Airtable (handles casing/spacing)
function getStatusLabel(s: string | null | undefined): Badge {
  const t = (s ?? '').replace(/\s+/g, ' ').trim().toLowerCase();
  if (!t) return null;
  if (t.includes('national')) return 'National';
  if (t.includes('state')) return 'State';
  return null;
}

const pillBase = 'inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ring-1';
function pillClass(b: Exclude<Badge, null>) {
  switch (b) {
    case 'National':
      return 'bg-purple-100 text-purple-700 ring-purple-200';
    case 'State':
      return 'bg-teal-100 text-teal-700 ring-teal-200';
  }
}

const normalize = (s = '') =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/\s+/g, ' ')
    .trim();

// ---------- component ----------
export default function PartiesExplorer({ initialParties, initialQuery = '' }: Props) {
  // base rows sorted by seats desc initially
  const rows = useMemo(() => [...initialParties].sort((a, b) => seatsNum(b) - seatsNum(a)), [initialParties]);

  // filters / sort / pagination
  const [q, setQ] = useState(initialQuery);
  const [state, setState] = useState('');
  const [status, setStatus] = useState('');
  const [seatTier, setSeatTier] = useState('');
  const [sortKey, setSortKey] = useState<'name' | 'seats' | 'founded' | 'status'>('seats');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const PER = 20;

  // Sync ALL filters to URL (replaceState so it doesn't spam history)
  useEffect(() => {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (state) params.set('state', state);
    if (status) params.set('status', status);
    if (seatTier) params.set('seats', seatTier);
    if (sortKey) params.set('sort', sortKey);
    if (sortDir) params.set('dir', sortDir);
    const qs = params.toString();
    const url = qs ? `${window.location.pathname}?${qs}` : window.location.pathname;
    window.history.replaceState(null, '', url);
  }, [q, state, status, seatTier, sortKey, sortDir]);

  useEffect(() => setQ(initialQuery), [initialQuery]);

  const allStates = useMemo(() => {
    const s = new Set<string>();
    for (const p of rows) if (p.state) s.add(p.state);
    return [...s].sort((a, b) => a.localeCompare(b));
  }, [rows]);

  const allStatuses = useMemo(() => {
    const s = new Set<string>();
    for (const p of rows) if (p.status) s.add(p.status);
    return [...s].sort((a, b) => a.localeCompare(b));
  }, [rows]);

  // PRE-INDEX: compute normalized text + normalized status once
  const indexed = useMemo(() => {
    return rows.map((p) => {
      const text = normalize(
        [p.name, p.abbr, p.state, p.status, p.symbolText, p.details, ...(p.leaders || [])]
          .filter(Boolean)
          .join(' ')
      );
      const statusNorm = normalize(p.status || '');
      const statusLabel = getStatusLabel(p.status);
      return { p, text, statusNorm, statusLabel };
    });
  }, [rows]);

  // FILTER
  const filtered = useMemo(() => {
    const tokens = normalize(q).split(' ').filter(Boolean); // multi-token AND
    const tierMin =
      seatTier === '50+' ? 50 :
      seatTier === '10+' ? 10 :
      seatTier === '5+'  ? 5  :
      seatTier === '1+'  ? 1  : 0;

    const wantNational = status ? normalize(status).includes('national') : null;
    const wantState    = status ? normalize(status).includes('state')    : null;

    const out = indexed
      .filter(({ p, text, statusNorm }) => {
        // text match: every token must be contained
        const okQ = tokens.length ? tokens.every((t) => text.includes(t)) : true;

        const okState = state ? normalize(p.state || '') === normalize(state) : true;

        // status match (accepts “National”/“State” variants from Airtable)
        const okStatus = status
          ? (wantNational ? statusNorm.includes('national') : false) ||
            (wantState    ? statusNorm.includes('state')    : false)
          : true;

        const okSeats = tierMin > 0 ? seatsNum(p) >= tierMin : true;

        return okQ && okState && okStatus && okSeats;
      })
      .map(({ p }) => p);

    // sort
    out.sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1;
      if (sortKey === 'name') return dir * (a.name || '').localeCompare(b.name || '');
      if (sortKey === 'founded') {
        const ay = (a.founded && parseInt(String(a.founded).slice(0, 4), 10)) || 0;
        const by = (b.founded && parseInt(String(b.founded).slice(0, 4), 10)) || 0;
        return dir * (ay - by);
      }
      if (sortKey === 'status') {
        const an = (a.status || '').toLowerCase();
        const bn = (b.status || '').toLowerCase();
        return dir * an.localeCompare(bn);
      }
      return dir * (seatsNum(a) - seatsNum(b)); // seats
    });

    return out;
  }, [indexed, q, state, status, seatTier, sortKey, sortDir]);

  useEffect(() => setPage(1), [q, state, status, seatTier, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER));
  const pageData = filtered.slice((page - 1) * PER, page * PER);

  const stats = useMemo(() => {
    const total = filtered.length;
    const seatSum = filtered.reduce((s, p) => s + seatsNum(p), 0);
    const national = filtered.filter((p) => normalize(p.status || '').includes('national')).length;
    const stateCount = filtered.filter((p) => normalize(p.status || '').includes('state')).length;
    return { total, seatSum, national, stateCount };
  }, [filtered]);

  const tdBase = 'p-3 first:pl-6 last:pr-6 align-middle';

  // Keyboard: prevent form submits from Enter jumping pages
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && (document.activeElement as HTMLElement)?.tagName === 'INPUT') {
        e.preventDefault();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Export CSV of filtered view
  const exportCSV = () => {
    const rowsOut = filtered.map((p) => ({
      id: p.id,
      name: p.name,
      abbr: p.abbr || '',
      state: p.state || '',
      status: p.status || '',
      founded: p.founded || '',
      seats: seatsNum(p),
      leaders: (p.leaders || []).join('; '),
    }));
    const headers = Object.keys(rowsOut[0] || { id: '', name: '', abbr: '', state: '', status: '', founded: '', seats: '', leaders: '' });
    const csv = [
      headers.join(','),
      ...rowsOut.map((r) => headers.map((h) => JSON.stringify((r as any)[h] ?? '')).join(',')),
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'parties_filtered.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-[1400px] mx-auto my-6 sm:my-8 rounded-2xl overflow-hidden bg-white shadow-2xl">
      {/* Header (cream, no gradient) */}
      <div className="px-6 sm:px-8 py-5 sm:py-6 text-center bg-cream-200 border-b border-ink-200">
        <h1 className="text-ink-800 text-2xl sm:text-3xl font-extrabold tracking-tight">
          Indian Political Parties
        </h1>
      </div>

     {/* Controls */}
      <div className="px-5 sm:px-8 py-6 bg-cream-200/50 border-b border-ink-200">
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-4">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name, abbreviation, leader, state…"
            className="flex-1 min-w-[240px] rounded-xl border border-ink-200 bg-white px-4 py-2.5 text-[15px] outline-none
                       focus:border-ink-500 focus:ring-2 focus:ring-ink-200"
          />

          <div className="flex flex-wrap gap-2">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm"
            >
              <option value="">All Status</option>
              {allStatuses.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            <select
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm"
            >
              <option value="">All States</option>
              {allStates.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            <select
              value={seatTier}
              onChange={(e) => setSeatTier(e.target.value)}
              className="rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm"
            >
              <option value="">All Seats</option>
              <option value="1+">1+ seats</option>
              <option value="5+">5+ seats</option>
              <option value="10+">10+ seats</option>
              <option value="50+">50+ seats</option>
            </select>

            <select
              value={`${sortKey}:${sortDir}`}
              onChange={(e) => {
                const [k, d] = e.target.value.split(':') as ['name' | 'seats' | 'founded' | 'status', 'asc' | 'desc'];
                setSortKey(k);
                setSortDir(d);
              }}
              className="rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm"
            >
              <option value="seats:desc">Sort: Seats ↓</option>
              <option value="seats:asc">Sort: Seats ↑</option>
              <option value="name:asc">Sort: Name A→Z</option>
              <option value="name:desc">Sort: Name Z→A</option>
              <option value="founded:desc">Sort: Founded ↓</option>
              <option value="founded:asc">Sort: Founded ↑</option>
              <option value="status:asc">Sort: Status A→Z</option>
              <option value="status:desc">Sort: Status Z→A</option>
            </select>

            <button
              onClick={() => {
                setQ('');
                setState('');
                setStatus('');
                setSeatTier('');
                setSortKey('seats');
                setSortDir('desc');
              }}
              className="rounded-lg border border-ink-200 px-3 py-2 text-sm hover:border-ink-500 hover:bg-ink-900/5"
              type="button"
            >
              Clear filters
            </button>

            <button
              onClick={exportCSV}
              className="rounded-lg border border-ink-200 px-3 py-2 text-sm hover:border-ink-500 hover:bg-ink-900/5"
              type="button"
            >
              Export CSV
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <Stat label="Total Parties" value={stats.total} />
          <Stat label="Total LS Seats" value={stats.seatSum} />
          <Stat label="National Parties" value={stats.national} />
          <Stat label="State Parties" value={stats.stateCount} />
        </div>
      </div>


      {/* Table */}
      <div className="pb-6 overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="sticky top-0 z-10">
            <tr className="bg-cream-100/90 backdrop-blur supports-[backdrop-filter]:bg-cream-100/80 text-ink-700 border-y border-ink-200 text-sm">
              <Th>Logo</Th>
              <Th sort={sortKey==='name' ? (sortDir==='asc'?'ascending':'descending') : 'none'}>Name</Th>
              <Th>Abbr</Th>
              <Th>State</Th>
              <Th align="right" sort={sortKey==='founded' ? (sortDir==='asc'?'ascending':'descending') : 'none'}>Founded</Th>
              <Th sort={sortKey==='status' ? (sortDir==='asc'?'ascending':'descending') : 'none'}>Status</Th>
              <Th align="right" sort={sortKey==='seats' ? (sortDir==='asc'?'ascending':'descending') : 'none'}>LS Seats</Th>
              <Th>Leaders</Th>
              <Th>Details</Th>
            </tr>
          </thead>
          <tbody>
            {pageData.map((p) => {
              const label = getStatusLabel(p.status);
              return (
                <tr key={p.id} className="border-b border-ink-600/10 hover:bg-ink-900/5 transition">
                  <td className={tdBase}>
  {(() => {
    const url = proxyImage(pickPartyLogo(p as any));
    return (
      <AvatarSquare
        variant="party"
        src={url}
        alt={`${p.name ?? 'Party'} logo`}
        size={40}
        rounded="rounded-md"
        label={p.abbr || p.name}
      />
    );
  })()}
</td>

                  <td className={tdBase}>
                    <div className="font-semibold text-ink-800">{p.name}</div>
                    {p.symbolText && <div className="text-xs text-ink-600/80">{p.symbolText}</div>}
                  </td>
                  <td className={cx(tdBase, 'text-ink-700')}>{p.abbr || '—'}</td>
                  <td className={cx(tdBase, 'text-ink-700')}>{p.state || '—'}</td>
                  <td className={cx(tdBase, 'text-right tabular-nums text-ink-700')}>{p.founded || '—'}</td>
                  <td className={tdBase}>
                    {label ? (
                      <span className={`${pillBase} ${pillClass(label)}`}>{label}</span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] bg-black/5 text-ink-700/70">
                        N/A
                      </span>
                    )}
                  </td>
                  <td className={cx(tdBase, 'text-right tabular-nums font-semibold text-ink-800')}>
                    {seatsNum(p)}
                  </td>
                  <td className={cx(tdBase, 'text-ink-700 truncate max-w-[28ch] md:max-w-[40ch]')}>
                    {p.leaders?.length ? p.leaders.join(', ') : <span className="text-ink-600/60">—</span>}
                  </td>
                  <td className={cx(tdBase, 'whitespace-nowrap')}>
                    <Link
                      href={`/parties/${encodeURIComponent(p.slug)}`}
                      className="text-saffron-700 hover:text-saffron-800 underline underline-offset-2"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              );
            })}
            {!pageData.length && (
              <tr>
                <td colSpan={9} className="p-6 text-center text-ink-600">
                  No parties match your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex justify-center items-center gap-2 mt-6">
          {page > 1 && (
            <button
              className="w-20 px-3 py-2 rounded-md border border-ink-200 hover:border-ink-500 hover:bg-ink-700 hover:text-white"
              onClick={() => setPage(page - 1)}
            >
              ‹ Prev
            </button>
          )}
          {Array.from({ length: totalPages })
            .slice(Math.max(0, page - 3), page + 2)
            .map((_, i) => {
              const n = Math.max(1, page - 2) + i;
              if (n > totalPages) return null;
              return (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  className={cx(
                    'min-w-10 px-3 py-2 rounded-md border',
                    n === page ? 'bg-ink-700 border-ink-700 text-white' : 'border-ink-200 hover:border-ink-500'
                  )}
                >
                  {n}
                </button>
              );
            })}
          {page < totalPages && (
            <button
              className="w-20 px-3 py-2 rounded-md border border-ink-200 hover:border-ink-500 hover:bg-ink-700 hover:text-white"
              onClick={() => setPage(page + 1)}
            >
              Next ›
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Th({
  children,
  align = 'left',
  sort = 'none',
}: {
  children: React.ReactNode;
  align?: 'left' | 'right';
  sort?: 'ascending' | 'descending' | 'none';
}) {
  return (
    <th
      aria-sort={sort}
      className={cx(
        'px-3 py-3 first:pl-6 last:pr-6 font-semibold whitespace-nowrap',
        align === 'right' ? 'text-right' : 'text-left'
      )}
    >
      {children}
    </th>
  );
}

function Stat({ label, value }: { label: string | number; value: string | number }) {
  return (
    <div className="rounded-xl bg-white text-center py-4 shadow-sm border border-ink-200 ring-1 ring-cream-300/60">
      <div className="text-2xl font-extrabold text-saffron-600">{value}</div>
      <div className="text-xs text-ink-700">{label}</div>
    </div>
  );
}
