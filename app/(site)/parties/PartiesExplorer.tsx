// app/parties/PartiesExplorer.tsx
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState, useEffect } from 'react';
import type { Party } from '@/lib/airtable';

type Props = { initialParties: Party[] };

function toInt(v: unknown): number | null {
  if (v == null) return null;
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string') {
    const n = parseInt(v.replace(/[, ]+/g, ''), 10);
    return Number.isNaN(n) ? null : n;
  }
  return null;
}

function seatsNum(p: Party): number {
  const n = toInt(p.seats ?? null);
  return n ?? 0;
}

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

export default function PartiesExplorer({ initialParties }: Props) {
  // --- raw dataset (stable)
  const rows = useMemo(() => {
    // sort by seats desc by default (nice initial view)
    return [...initialParties].sort((a, b) => seatsNum(b) - seatsNum(a));
  }, [initialParties]);

  // --- filter state
  const [q, setQ] = useState('');
  const [state, setState] = useState<string>('');
  const [status, setStatus] = useState<string>(''); // National / State / Registered / etc.
  const [seatTier, setSeatTier] = useState<string>(''); // '', '1+', '5+', '10+', '50+'
  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState<'name' | 'seats' | 'founded'>('seats');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const ITEMS_PER_PAGE = 20;

  // --- derived filter options
  const states = useMemo(() => {
    const s = new Set<string>();
    rows.forEach((p) => {
      if (p.state && typeof p.state === 'string') s.add(p.state);
    });
    return Array.from(s).sort((a, b) => a.localeCompare(b));
  }, [rows]);

  const statuses = useMemo(() => {
    const s = new Set<string>();
    rows.forEach((p) => {
      if (p.status && typeof p.status === 'string') s.add(p.status);
    });
    return Array.from(s).sort((a, b) => a.localeCompare(b));
  }, [rows]);

  // --- filtering
  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const tierMin =
      seatTier === '50+' ? 50 :
      seatTier === '10+' ? 10 :
      seatTier === '5+'  ? 5  :
      seatTier === '1+'  ? 1  : 0;

    const out = rows.filter((p) => {
      const txt = [
        p.name,
        p.abbr,
        p.state,
        p.status,
        p.leaders?.join(' '),
        p.symbolText,
        p.details
      ].filter(Boolean).join(' ').toLowerCase();

      const okQ = needle ? txt.includes(needle) : true;
      const okState = state ? (p.state || '') === state : true;
      const okStatus = status ? (p.status || '') === status : true;
      const okSeats = tierMin > 0 ? seatsNum(p) >= tierMin : true;

      return okQ && okState && okStatus && okSeats;
    });

    // sort
    out.sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1;
      if (sortKey === 'name') {
        return dir * (a.name || '').localeCompare(b.name || '');
      }
      if (sortKey === 'founded') {
        const ay = (a.founded && parseInt(String(a.founded).slice(0, 4), 10)) || 0;
        const by = (b.founded && parseInt(String(b.founded).slice(0, 4), 10)) || 0;
        return dir * (ay - by);
      }
      // seats
      return dir * (seatsNum(a) - seatsNum(b));
    });

    return out;
  }, [rows, q, state, status, seatTier, sortKey, sortDir]);

  // reset page on filter change
  useEffect(() => setPage(1), [q, state, status, seatTier, sortKey, sortDir]);

  // --- pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const pageData = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  // --- stats
  const stats = useMemo(() => {
    const total = filtered.length;
    const seatSum = filtered.reduce((sum, p) => sum + seatsNum(p), 0);
    const national = filtered.filter((p) => String(p.status || '').toLowerCase().includes('national')).length;
    const stateCount = filtered.filter((p) => String(p.status || '').toLowerCase().includes('state')).length;
    return { total, seatSum, national, stateCount };
  }, [filtered]);

  // header bg dot texture (CSS-only, similar to your HTML)
  const texture =
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='20' cy='20' r='2' fill='rgba(255,255,255,0.14)'/%3E%3Ccircle cx='80' cy='30' r='1.5' fill='rgba(255,255,255,0.14)'/%3E%3Ccircle cx='40' cy='70' r='1' fill='rgba(255,255,255,0.14)'/%3E%3Ccircle cx='90' cy='80' r='2.5' fill='rgba(255,255,255,0.14)'/%3E%3Ccircle cx='10' cy='90' r='1.5' fill='rgba(255,255,255,0.14)'/%3E%3C/svg%3E\")";

  return (
    <div className="max-w-[1400px] mx-auto my-6 sm:my-8 rounded-2xl shadow-2xl overflow-hidden bg-white/95 backdrop-blur">
      {/* Header */}
      <div
        className="relative px-6 sm:px-8 py-8 sm:py-10 text-center text-white"
        style={{
          background:
            'linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)',
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: texture,
            animation: 'floatDots 20s linear infinite',
          }}
        />
        <style>{`
          @keyframes floatDots {
            0% { transform: translate(0,0); }
            100% { transform: translate(-100px,-100px); }
          }
        `}</style>

        <h1 className="relative z-10 text-2xl sm:text-3xl font-extrabold tracking-tight">
          🏳️ Indian Political Parties
        </h1>
        <p className="relative z-10 mt-1 opacity-90">
          Airtable-powered directory of recognized and registered parties
        </p>
      </div>

      {/* Controls */}
      <div className="px-5 sm:px-8 py-6 bg-slate-50/80 border-b border-slate-200">
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-4">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name, abbreviation, leader, state…"
            className="flex-1 min-w-[240px] rounded-xl border-2 border-slate-200 bg-white px-4 py-2.5 text-[15px] outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          />

          <div className="flex flex-wrap gap-2">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="rounded-lg border-2 border-slate-200 bg-white px-3 py-2 text-sm"
            >
              <option value="">All Status</option>
              {statuses.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            <select
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="rounded-lg border-2 border-slate-200 bg-white px-3 py-2 text-sm"
            >
              <option value="">All States</option>
              {states.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            <select
              value={seatTier}
              onChange={(e) => setSeatTier(e.target.value)}
              className="rounded-lg border-2 border-slate-200 bg-white px-3 py-2 text-sm"
            >
              <option value="">All Seats</option>
              <option value="1+">1+ seats</option>
              <option value="5+">5+ seats</option>
              <option value="10+">10+ seats</option>
              <option value="50+">50+ seats</option>
            </select>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <StatCard label="Total Parties" value={stats.total} />
          <StatCard label="Total LS Seats" value={stats.seatSum} />
          <StatCard label="National Parties" value={stats.national} />
          <StatCard label="State Parties" value={stats.stateCount} />
        </div>
      </div>

      {/* Table */}
      <div className="px-3 sm:px-6 pb-6 overflow-x-auto">
        <table className="w-full border-collapse bg-white rounded-xl overflow-hidden shadow-xl">
          <thead>
            <tr className="text-left text-white text-sm sticky top-0 z-10"
                style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)' }}>
              <Th>Logo</Th>
              <Th onSort={() => toggleSort('name')} active={sortKey==='name'} dir={sortDir}>
                Name
              </Th>
              <Th>Abbr</Th>
              <Th>State</Th>
              <Th onSort={() => toggleSort('founded')} active={sortKey==='founded'} dir={sortDir}>
                Founded
              </Th>
              <Th>Status</Th>
              <Th onSort={() => toggleSort('seats')} active={sortKey==='seats'} dir={sortDir}>
                LS Seats
              </Th>
              <Th>Leaders</Th>
              <Th>Page</Th>
            </tr>
          </thead>
          <tbody>
            {pageData.map((p) => (
              <tr key={p.id} className="border-b border-slate-100 hover:bg-blue-50/40 transition">
                <td className="p-3">
                  {p.logo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.logo} alt="" className="w-10 h-10 rounded-md object-contain bg-white border border-slate-200" />
                  ) : (
                    <div className="w-10 h-10 rounded-md bg-slate-100 border border-slate-200" />
                  )}
                </td>
                <td className="p-3">
                  <div className="font-semibold">{p.name}</div>
                  {p.symbolText && (
                    <div className="text-xs text-slate-500">{p.symbolText}</div>
                  )}
                </td>
                <td className="p-3 text-slate-700">{p.abbr || '-'}</td>
                <td className="p-3 text-slate-700">{p.state || '-'}</td>
                <td className="p-3 text-slate-700">{p.founded || '-'}</td>
                <td className="p-3">
                  {p.status ? (
                    <span className={cx(
                      'inline-block px-2 py-1 rounded-md text-xs font-semibold text-white',
                      String(p.status).toLowerCase().includes('national') && 'bg-emerald-600',
                      String(p.status).toLowerCase().includes('state') && 'bg-indigo-600',
                      !String(p.status).toLowerCase().includes('state') &&
                        !String(p.status).toLowerCase().includes('national') && 'bg-slate-500'
                    )}>
                      {p.status}
                    </span>
                  ) : (
                    <span className="text-slate-400">—</span>
                  )}
                </td>
                <td className="p-3 font-semibold">{seatsNum(p)}</td>
                <td className="p-3 text-slate-700 truncate max-w-[280px]">
                  {p.leaders?.length ? p.leaders.join(', ') : <span className="text-slate-400">—</span>}
                </td>
                <td className="p-3">
                  {/* If you have party pages by slug, link to /parties/[slug] */}
                  <Link
                    href={`/parties/${encodeURIComponent(p.slug)}`}
                    className="text-blue-600 underline underline-offset-2"
                  >
                    Open →
                  </Link>
                </td>
              </tr>
            ))}

            {!pageData.length && (
              <tr>
                <td colSpan={9} className="p-6 text-center text-slate-500">
                  No parties match your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex justify-center items-center gap-2 mt-6">
          {page > 1 && (
            <button className="page-btn px-3 py-2 rounded-md border-2 border-slate-200 hover:border-blue-500 hover:bg-blue-500 hover:text-white"
                    onClick={() => setPage(page - 1)}>
              ‹ Prev
            </button>
          )}
          {Array.from({ length: totalPages }).slice(Math.max(0, page-3), page+2).map((_, i) => {
            const n = Math.max(1, page - 2) + i;
            if (n > totalPages) return null;
            return (
              <button key={n}
                onClick={() => setPage(n)}
                className={cx(
                  'px-3 py-2 rounded-md border-2',
                  n === page ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-200 hover:border-blue-500'
                )}>
                {n}
              </button>
            );
          })}
          {page < totalPages && (
            <button className="page-btn px-3 py-2 rounded-md border-2 border-slate-200 hover:border-blue-500 hover:bg-blue-500 hover:text-white"
                    onClick={() => setPage(page + 1)}>
              Next ›
            </button>
          )}
        </div>
      </div>
    </div>
  );

  function toggleSort(k: 'name' | 'seats' | 'founded') {
    if (sortKey === k) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(k);
      setSortDir(k === 'name' ? 'asc' : 'desc');
    }
  }
}

function Th({
  children,
  onSort,
  active,
  dir,
}: {
  children: React.ReactNode;
  onSort?: () => void;
  active?: boolean;
  dir?: 'asc' | 'desc';
}) {
  const clickable = !!onSort;
  return (
    <th
      className={cx(
        'px-3 py-3 font-semibold select-none whitespace-nowrap',
        clickable && 'cursor-pointer hover:bg-white/10'
      )}
      onClick={onSort}
    >
      <div className="flex items-center gap-1">
        <span>{children}</span>
        {active && (
          <span className="text-white/80 text-xs">{dir === 'asc' ? '▲' : '▼'}</span>
        )}
      </div>
    </th>
  );
}

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-xl text-white text-center py-4"
         style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <div className="text-2xl font-extrabold">{value}</div>
      <div className="text-xs opacity-90">{label}</div>
    </div>
  );
}
