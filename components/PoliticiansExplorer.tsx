// components/PoliticiansExplorer.tsx
'use client';

import { useMemo, useState } from 'react';
import CardPolitician, { Politician } from '@/components/CardPolitician';

type Props = {
  initial: Politician[];
};

function uniq<T>(arr: T[]) {
  return Array.from(new Set(arr.filter(Boolean)));
}

export default function PoliticiansExplorer({ initial }: Props) {
  const [q, setQ] = useState('');
  const [party, setParty] = useState<string>('All');
  const [state, setState] = useState<string>('All');
  const [menuOpen, setMenuOpen] = useState(false);
  const [selected, setSelected] = useState<string[]>([]); // slugs (max 2)
  const [selectMode, setSelectMode] = useState(false);

  const parties = useMemo(
    () =>
      ['All', ...uniq(initial.map((p) => p.party)).sort((a, b) => a.localeCompare(b))],
    [initial]
  );

  const states = useMemo(
    () =>
      ['All', ...uniq(initial.map((p) => (p.state ?? '').trim())).filter(Boolean).sort((a, b) => a.localeCompare(b))],
    [initial]
  );

  const results = useMemo(() => {
    const haystack = (p: Politician) =>
      `${p.name ?? ''} ${p.party ?? ''} ${p.current_position ?? ''} ${p.state ?? ''}`.toLowerCase();

    return initial
      .filter((p) => (party === 'All' ? true : p.party === party))
      .filter((p) => (state === 'All' ? true : (p.state ?? '') === state))
      .filter((p) => (q ? haystack(p).includes(q.toLowerCase()) : true))
      .sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''));
  }, [initial, party, state, q]);

  function toggleSelect(slug: string) {
    setSelected((prev) => {
      if (prev.includes(slug)) return prev.filter((s) => s !== slug);
      if (prev.length >= 2) return [prev[1], slug]; // keep most recent two
      return [...prev, slug];
    });
  }

  return (
    <div>
      {/* Controls row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Pills + search */}
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {/* Party pills (truncate to 10, then overflow menu via filter) */}
            {parties.slice(0, 10).map((p) => (
              <button
                key={p}
                onClick={() => setParty(p)}
                className={[
                  'px-3 py-1.5 rounded-full text-sm border transition',
                  party === p
                    ? 'bg-black text-white border-black'
                    : 'bg-white border-black/15 text-black hover:border-black/30',
                ].join(' ')}
                aria-pressed={party === p}
              >
                {p}
              </button>
            ))}
            {parties.length > 11 && (
              <button
                onClick={() => setMenuOpen(true)}
                className="px-3 py-1.5 rounded-full text-sm border border-black/15 hover:border-black/30"
                title="More filters"
                aria-haspopup="dialog"
              >
                +{parties.length - 10} more
              </button>
            )}
          </div>

          {/* Search */}
          <div className="mt-3 flex gap-2">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search name, party, role, state…"
              className="w-full rounded-lg border border-black/15 px-3 py-2 outline-none focus-visible:ring-2 focus-visible:ring-black/20"
              inputMode="search"
            />
          </div>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-2 self-start">
          {/* Filter button (opens menu) */}
          <button
            onClick={() => setMenuOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-black/15 px-3 py-2 hover:border-black/30"
            aria-haspopup="dialog"
            aria-expanded={menuOpen}
          >
            <svg viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor" aria-hidden>
              <path d="M3 5a1 1 0 0 1 1-1h12a1 1 0 1 1 0 2H4a1 1 0 0 1-1-1Zm2 5a1 1 0 0 1 1-1h8a1 1 0 1 1 0 2H6a1 1 0 0 1-1-1Zm3 4a1 1 0 0 1 1-1h2a1 1 0 1 1 0 2H9a1 1 0 0 1-1-1Z" />
            </svg>
            Filters
          </button>

          {/* Selection toggle */}
          <button
            onClick={() => setSelectMode((s) => !s)}
            className={[
              'inline-flex items-center gap-2 rounded-lg border px-3 py-2',
              selectMode
                ? 'border-black bg-black text-white'
                : 'border-black/15 hover:border-black/30',
            ].join(' ')}
            aria-pressed={selectMode}
            title="Select and compare"
          >
            <svg viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor" aria-hidden>
              <path d="M3 4a1 1 0 0 1 1-1h3v2H5v3H3V4Zm9-1h3a1 1 0 0 1 1 1v3h-2V5h-2V3Zm4 12v-3h2v3a1 1 0 0 1-1 1h-3v-2h2ZM5 17h3v-2H5v-2H3v3a1 1 0 0 0 1 1Z" />
            </svg>
            {selectMode ? 'Done' : 'Compare'}
          </button>
        </div>
      </div>

      {/* Results */}
      {results.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-black/80 font-medium">No results.</p>
          <button
            onClick={() => {
              setQ('');
              setParty('All');
              setState('All');
            }}
            className="mt-3 rounded-lg border border-black/15 px-3 py-2 hover:border-black/30"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <ul className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" role="list">
          {results.map((p) => (
            <li key={p.slug}>
              <CardPolitician
                p={p}
                selectMode={selectMode}
                selected={selected.includes(p.slug)}
                onSelectToggle={toggleSelect}
              />
            </li>
          ))}
        </ul>
      )}

      {/* Sticky compare bar */}
      {selectMode && selected.length > 0 && (
        <div className="fixed inset-x-0 bottom-4 z-40">
          <div className="mx-auto max-w-6xl px-4">
            <div className="rounded-2xl border border-black/15 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/70 shadow-md">
              <div className="flex items-center justify-between p-3">
                <div className="text-sm">
                  <span className="font-medium">{selected.length}</span> selected
                  {selected.length < 2 && <span className="text-black/60"> — pick one more to compare</span>}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelected([])}
                    className="rounded-lg border border-black/15 px-3 py-2 hover:border-black/30"
                  >
                    Clear
                  </button>
                  <a
                    href={`/politicians/compare?slugs=${encodeURIComponent(selected.join(','))}`}
                    className={[
                      'rounded-lg px-4 py-2',
                      selected.length === 2
                        ? 'bg-black text-white hover:bg-black/90'
                        : 'bg-black/20 text-black/60 pointer-events-none',
                    ].join(' ')}
                    aria-disabled={selected.length !== 2}
                  >
                    Compare (2)
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters dialog */}
      {menuOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50"
          onClick={() => setMenuOpen(false)}
        >
          <div className="absolute inset-0 bg-black/30" />
          <div
            className="absolute right-4 top-16 w-[min(520px,calc(100vw-2rem))] rounded-2xl border border-black/15 bg-white p-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold">Filters</h3>
              <button
                onClick={() => setMenuOpen(false)}
                className="rounded-md p-1 hover:bg-black/5"
                aria-label="Close"
              >
                <svg viewBox="0 0 20 20" className="h-5 w-5" fill="currentColor">
                  <path d="M6.707 5.293 5.293 6.707 8.586 10l-3.293 3.293 1.414 1.414L10 11.414l3.293 3.293 1.414-1.414L11.414 10l3.293-3.293-1.414-1.414L10 8.586 6.707 5.293Z" />
                </svg>
              </button>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium">Party</label>
                <select
                  value={party}
                  onChange={(e) => setParty(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-black/15 px-3 py-2"
                >
                  {parties.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium">State</label>
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-black/15 px-3 py-2"
                >
                  {states.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="text-sm font-medium">Search</label>
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Try “BJP”, “MP”, “Maharashtra”…"
                  className="mt-1 w-full rounded-lg border border-black/15 px-3 py-2"
                />
              </div>
            </div>

            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                onClick={() => {
                  setQ('');
                  setParty('All');
                  setState('All');
                }}
                className="rounded-lg border border-black/15 px-3 py-2 hover:border-black/30"
              >
                Reset
              </button>
              <button
                onClick={() => setMenuOpen(false)}
                className="rounded-lg bg-black text-white px-4 py-2 hover:bg-black/90"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
