// app/(site)/politicians/Client.tsx
'use client';

import { useMemo, useState } from 'react';
import CardPolitician from '@/components/CardPolitician';
import SearchBar from '@/components/SearchBar';
import type { Politician } from '@/lib/airtable';
import { NATIONAL_PARTIES, pillStyleFor } from '@/lib/partyStyles';

type P = Politician & { slug: string; party?: string | null; state?: string | null };

export default function PoliticiansClient({ initialData }: { initialData: P[] }) {
  const [query, setQuery] = useState('');
  const [party, setParty] = useState<string>('All');
  const [state, setState] = useState<string>('All');
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);

  // pills: only national parties, keep site order
  const partyPills = useMemo(() => ['All', ...NATIONAL_PARTIES], []);

  const states = useMemo(
    () => ['All', ...Array.from(new Set(initialData.map(p => (p.state ?? '').trim()))).filter(Boolean).sort()],
    [initialData]
  );

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return (initialData ?? [])
      .filter(p => (party === 'All' ? true : (p.party ?? '') === party))
      .filter(p => (state === 'All' ? true : (p.state ?? '') === state))
      .filter(p =>
        !q
          ? true
          : (p.name ?? '').toLowerCase().includes(q) ||
            (p.party ?? '').toLowerCase().includes(q) ||
            (p.state ?? '').toLowerCase().includes(q)
      )
      .sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''));
  }, [initialData, query, party, state]);

  function toggleSelect(slug: string) {
    setSelected(prev => (prev.includes(slug) ? prev.filter(s => s !== slug) : prev.length >= 2 ? [prev[1], slug] : [...prev, slug]));
  }

  return (
    <div className="space-y-6">
      {/* header & buttons unchanged */}
      {/* … */}

      {/* Party pills (national only) */}
      <div className="flex flex-wrap items-center gap-2">
        {partyPills.map(p => {
          const { bg, fg, border } = pillStyleFor(p);
          const active = party === p;
          return (
            <button
              key={p}
              onClick={() => setParty(p)}
              aria-pressed={active}
              className="px-3 py-1.5 rounded-full text-sm border transition shadow-sm"
              style={{
                backgroundColor: active ? fg : bg,
                color: active ? '#FFFFFF' : fg,
                borderColor: border,
              }}
            >
              {p === 'All' ? 'All' : p}
            </button>
          );
        })}
      </div>

      {/* search + grid */}
      <SearchBar value={query} onChange={setQuery} placeholder="Search name, party, role, state…" />

      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
        {filtered.map(p => (
          <CardPolitician
            key={p.id}
            p={p as any}
            surfaceClassName="bg-white"          // <- original card color
            selectMode={selectMode}
            selected={selected.includes((p as any).slug)}
            onSelectToggle={toggleSelect}
          />
        ))}
      </div>

      {/* sticky compare + filters dialog blocks stay same as your last version */}
      {/* … */}
    </div>
  );
}
