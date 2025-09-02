// components/HeroSearch.tsx
'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

type Hit = { type: 'politician' | 'party'; name: string; slug: string };

export default function HeroSearch({
  popular = ['Modi', 'Gandhi', 'BJP', 'RSS'],
}: { popular?: string[] }) {
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [hits, setHits] = useState<Hit[]>([]);
  const [counts, setCounts] = useState<{ politicians: number; parties: number }>({ politicians: 0, parties: 0 });

  // Anchor the dropdown to the INPUT only
  const inputWrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!inputWrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener('click', onClick);
    return () => window.removeEventListener('click', onClick);
  }, []);

  const debouncedQ = useMemo(() => q.trim(), [q]);

  useEffect(() => {
    let on = true;
    if (!debouncedQ) { setHits([]); setOpen(false); setCounts({ politicians: 0, parties: 0 }); return; }
    const run = async () => {
      const u = new URL('/api/search', window.location.origin);
      u.searchParams.set('q', debouncedQ);
      const r = await fetch(u.toString(), { cache: 'no-store' });
      if (!on) return;
      const data = await r.json();
      setHits(data.results as Hit[]);
      setCounts(data.counts || { politicians: 0, parties: 0 });
      setOpen(true);
    };
    const t = setTimeout(run, 150);
    return () => { on = false; clearTimeout(t); };
  }, [debouncedQ]);

  const submit = (term?: string) => {
    const s = (term ?? q).trim();
    if (!s) return;
    window.location.href = `/search?query=${encodeURIComponent(s)}`;
  };

  const totalShown = hits.length;
  const totalFound = counts.politicians + counts.parties;
  const hasMore = totalFound > totalShown;

  return (
    <div className="max-w-2xl mx-auto mt-4">
      {/* Separate pills */}
      <div className="flex items-center justify-center gap-3">
        {/* Input pill + dropdown anchor */}
        <div className="relative flex-1" ref={inputWrapRef}>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onFocus={() => q && setOpen(true)}
            placeholder="Search politicians, parties…"
            className="input-pill w-full"
          />

          {/* Typeahead dropdown (aligned to input width) */}
          {open && hits.length > 0 && (
            <div className="absolute z-50 left-0 right-0 mt-2 rounded-xl border border-black/10 bg-white shadow-lg overflow-hidden">
              <ul className="max-h-72 overflow-auto divide-y divide-black/5">
                {hits.map((h, i) => (
                  <li key={`${h.type}-${h.slug}-${i}`}>
                    <a
                      href={`/${h.type === 'party' ? 'parties' : 'politicians'}/${h.slug}`}
                      className="flex items-center gap-2 px-4 py-3 hover:bg-cream-100"
                    >
                      <span className="text-xs rounded-full px-2 py-0.5 bg-black/5">
                        {h.type === 'party' ? 'Party' : 'Politician'}
                      </span>
                      <span className="truncate">{h.name}</span>
                    </a>
                  </li>
                ))}

                {hasMore && (
                  <li>
                    <button
                      onClick={() => submit()}
                      className="w-full text-left px-4 py-3 text-sm text-saffron-600 hover:bg-cream-100"
                    >
                      See all results for “{q}” ({totalFound})
                    </button>
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>

        {/* Button pill (separate) */}
        <button onClick={() => submit()} className="btn whitespace-nowrap">
          Search
        </button>
      </div>

      {/* Popular row */}
      <div className="mt-2 text-sm font-medium text-ink-700">
        Popular:{' '}
        {popular.map((term, i) => (
          <span key={term}>
            <a href={`/search?query=${encodeURIComponent(term)}`} className="underline">{term}</a>
            {i < popular.length - 1 && ' • '}
          </span>
        ))}
      </div>
    </div>
  );
}
