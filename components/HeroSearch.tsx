'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

type Hit = { type: 'politician' | 'party'; name: string; slug: string };

export default function HeroSearch({
  popular = ['Modi', 'Gandhi', 'BJP', 'RSS'],
}: { popular?: string[] }) {
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [hits, setHits] = useState<Hit[]>([]);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!boxRef.current?.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener('click', onClick);
    return () => window.removeEventListener('click', onClick);
  }, []);

  const debouncedQ = useMemo(() => q.trim(), [q]);
  useEffect(() => {
    let on = true;
    if (!debouncedQ) { setHits([]); setOpen(false); return; }
    const run = async () => {
      const u = new URL('/api/search', window.location.origin);
      u.searchParams.set('q', debouncedQ);
      const r = await fetch(u.toString(), { cache: 'no-store' });
      if (!on) return;
      const data = await r.json();
      setHits(data.results as Hit[]);
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

  return (
    <div className="relative max-w-2xl mx-auto mt-3" ref={boxRef}>
      {/* Pill search */}
      <div className="flex items-stretch gap-2 rounded-full bg-white border border-black/10 p-2 shadow-sm">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => q && setOpen(true)}
          placeholder="Search politicians, parties…"
          className="flex-1 px-4 outline-none bg-transparent text-ink-800 placeholder-black/40"
        />
        <button onClick={() => submit()} className="btn">Search</button>
      </div>

      {/* Typeahead (only when typing) */}
      {open && hits.length > 0 && (
        <div className="absolute z-20 mt-2 w-full rounded-xl border border-black/10 bg-white shadow-lg overflow-hidden">
          <ul className="max-h-72 overflow-auto divide-y divide-black/5">
            {hits.map((h, i) => (
              <li key={i}>
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
          </ul>
        </div>
      )}

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
