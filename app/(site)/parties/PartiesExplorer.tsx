// app/(site)/parties/PartiesExplorer.tsx
'use client';

import Link from 'next/link';
import type { Party } from '@/lib/airtable';
import { useEffect, useMemo, useState } from 'react';

type Props = {
  initialParties: Party[];
  initialQuery?: string;
};

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

export default function PartiesExplorer({ initialParties, initialQuery = '' }: Props) {
  // base rows sorted by seats desc initially
  const rows = useMemo(
    () => [...initialParties].sort((a, b) => seatsNum(b) - seatsNum(a)),
    [initialParties]
  );

  // filters / sort / pagination
  const [q, setQ] = useState(initialQuery);
  const [state, setState] = useState('');
  const [status, setStatus] = useState('');
  const [seatTier, setSeatTier] = useState('');
  const [sortKey, setSortKey] = useState<'name' | 'seats' | 'founded'>('seats');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const PER = 20;

  // keep q in the URL (replaceState so it doesn't spam history)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (q) params.set('q', q);
    else params.delete('q');
    const qs = params.toString();
    const next = qs ? `${window.location.pathname}?${qs}` : window.location.pathname;
    window.history.replaceState(null, '', next);
  }, [q]);

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

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const tierMin =
      seatTier === '50+' ? 50 : seatTier === '10+' ? 10 : seatTier === '5+' ? 5 : seatTier === '1+' ? 1 : 0;

    const out = rows.filter((p) => {
      const text = [
        p.name,
        p.abbr,
        p.state,
        p.status,
        p.symbolText,
        p.details,
        ...(p.leaders || []),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      const okQ = needle ? text.includes(needle) : true;
      const okState = state ? (p.state || '') === state : true;
      const okStatus = status ? (p.status || '') === status : true;
      const okSeats = tierMin > 0 ? seatsNum(p) >= tierMin : true;
      return okQ && okState && okStatus && okSeats;
    });

    out.sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1;
      if (sortKey === 'name') return dir * (a.name || '').localeCompare(b.name || '');
      if (sortKey === 'founded') {
        const ay = (a.founded && parseInt(String(a.founded).slice(0, 4), 10)) || 0;
        const by = (b.founded && parseInt(String(b.founded).slice(0, 4), 10)) || 0;
        return dir * (ay - by);
      }
      return dir * (seatsNum(a) - seatsNum(b)); // seats
    });

    return out;
  }, [rows, q, state, status, seatTier, sortKey, sortDir]);

  useEffect(() => setPage(1), [q, state, status, seatTier, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER));
  const pageData = filtered.slice((page - 1) * PER, page * PER);

  const stats = useMemo(() => {
    const total = filtered.length;
    const seatSum = filtered.reduce((s, p) => s + seatsNum(p), 0);
    const national = filtered.filter((p) => String(p.status || '').toLowerCase().includes('national')).length;
    const stateCount = filtered.filter((p) => String(p.status || '').toLowerCase().includes('state')).length;
    return { total, seatSum, national, stateCount };
  }, [filtered]);

  const texture =
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='20' cy='20' r='2' fill='rgba(255,255,255,0.10)'/%3E%3Ccircle cx='80' cy='30' r='1.5' fill='rgba(255,255,255,0.10)'/%3E%3Ccircle cx='40' cy='70' r='1' fill='rgba(255,255,255,0.10)'/%3E%3Ccircle cx='90' cy='80' r='2.5' fill='rgba(255,255,255,0.10)'/%3E%3Ccircle cx='10' cy='90' r='1.5' fill='rgba(255,255,255,0.10)'/%3E%3C/svg%3E\")";

  return (
    <div className="max-w-[1400px] mx-auto my-6 sm:my-8 rounded-2xl shadow-2xl overflow-hidden bg-white/95 backdrop-blur">
      {/* Saffron header — shorter, title only */}
      <div
        className="relative px-6 sm:px-8 py-5 sm:py-6 text-center text-white"
        style={{ background: 'linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)' }}
      >
        <div
          className="absolute inset-0"
          style={{ backgroundImage: texture, animation: 'floatDots 20s linear infinite' }}
        />
        <style>{`@keyframes floatDots {0%{transform:translate(0,0)}100%{transform:translate(-100px,-100px)}}`}</style>
        <h1 className="relative z-10 text-2xl sm:text-3xl font-extrabold tracking-tight">
          Indian Political Parties
        </h1>
      </div>

      {/* Controls (brand: cream/ink) */}
      <div className="px-5 sm:px-8 py-6 bg-cream-200/60 border-b border-ink-200">
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
                const [k, d] = e.target.value.split(':') as [
                  'name' | 'seats' | 'founded',
                  'asc' | 'desc'
                ];
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
            </select>

            {/* Clear filters */}
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
              aria-label="Clear all filters"
              type="button"
            >
              Clear filters
            </button>
          </div>
        </div>

        {/* Stats (saffron chips) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <Stat label="Total Parties" value={stats.total} />
          <Stat label="Total LS Seats" value={stats.seatSum} />
          <Stat label="National Parties" value={stats.national} />
          <Stat label="State Parties" value={stats.stateCount} />
        </div>
      </div>

      {/* Table */}
      <div className="px-3 sm:px-6 pb-6 overflow-x-auto">
        <table className="w-full border-collapse bg-white rounded-xl overflow-hidden shadow-xl">
          <thead>
            <tr
              className="text-left text-white text-sm sticky top-0 z-10"
              style={{ background: 'linear-gradient(135deg, #0F3D5E 0%, #0A2A45 100%)' }} // ink
            >
              <Th>Logo</Th>
              <Th>Name</Th>
              <Th>Abbr</Th>
              <Th>State</Th>
              <Th>Founded</Th>
              <Th>Status</Th>
              <Th>LS Seats</Th>
              <Th>Leaders</Th>
              <Th>Page</Th>
            </tr>
          </thead>
          <tbody>
            {pageData.map((p) => (
              <tr
                key={p.id}
                className="border-b border-ink-600/10 hover:bg-ink-900/5 transition"
              >
                <td className="p-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {p.logo ? (
                    <img
                      src={p.logo}
                      alt=""
                      className="w-10 h-10 rounded-md object-contain bg-white border border-ink-200"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-md bg-ink-900/5 border border-ink-200" />
                  )}
                </td>
                <td className="p-3">
                  <div className="font-semibold text-ink-800">{p.name}</div>
                  {p.symbolText && (
                    <div className="text-xs text-ink-600/80">{p.symbolText}</div>
                  )}
                </td>
                <td className="p-3 text-ink-700">{p.abbr || '—'}</td>
                <td className="p-3 text-ink-700">{p.state || '—'}</td>
                <td className="p-3 text-ink-700">{p.founded || '—'}</td>
                <td className="p-3">
                  {p.status ? (
                    <span
                      className={cx(
                        'inline-block px-2 py-1 rounded-md text-xs font-semibold text-white',
                        String(p.status).toLowerCase().includes('national') && 'bg-emerald-600',
                        String(p.status).toLowerCase().includes('state') && 'bg-indigo-600',
                        !String(p.status).toLowerCase().includes('state') &&
                          !String(p.status).toLowerCase().includes('national') && 'bg-ink-700'
                      )}
                    >
                      {p.status}
                    </span>
                  ) : (
                    <span className="text-ink-600/60">—</span>
                  )}
                </td>
                <td className="p-3 font-semibold text-ink-800">{seatsNum(p)}</td>
                <td className="p-3 text-ink-700 truncate max-w-[320px]">
                  {p.leaders?.length ? (
                    p.leaders.join(', ')
                  ) : (
                    <span className="text-ink-600/60">—</span>
                  )}
                </td>
                <td className="p-3">
                  <Link
                    href={`/parties/${encodeURIComponent(p.slug)}`}
                    className="text-saffron-600 underline underline-offset-2"
                  >
                    Open →
                  </Link>
                </td>
              </tr>
            ))}
            {!pageData.length && (
              <tr>
                <td colSpan={9} className="p-6 text-center text-ink-600">
                  No parties match your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination (ink accents) */}
        <div className="flex justify-center items-center gap-2 mt-6">
          {page > 1 && (
            <button
              className="px-3 py-2 rounded-md border border-ink-200 hover:border-ink-500 hover:bg-ink-700 hover:text-white"
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
                    'px-3 py-2 rounded-md border',
                    n === page
                      ? 'bg-ink-700 border-ink-700 text-white'
                      : 'border-ink-200 hover:border-ink-500'
                  )}
                >
                  {n}
                </button>
              );
            })}
          {page < totalPages && (
            <button
              className="px-3 py-2 rounded-md border border-ink-200 hover:border-ink-500 hover:bg-ink-700 hover:text-white"
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

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-3 py-3 font-semibold whitespace-nowrap">{children}</th>;
}

function Stat({ label, value }: { label: string; value: number | string }) {
  // saffron chip to match brand
  return (
    <div
      className="rounded-xl text-white text-center py-4"
      style={{ background: 'linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)' }}
    >
      <div className="text-2xl font-extrabold">{value}</div>
      <div className="text-xs opacity-90">{label}</div>
    </div>
  );
}
