// app/(site)/politicians/Client.tsx
'use client';

import { useState, useMemo } from 'react';
import CardPolitician from '@/components/CardPolitician';
import SearchBar from '@/components/SearchBar';
import type { Politician } from '@/lib/airtable';

export default function PoliticiansClient({ initialData }: { initialData: Politician[] }) {
  const [query, setQuery] = useState('');
  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return initialData.filter(p =>
      p.name.toLowerCase().includes(q) ||
      (p.party ?? '').toLowerCase().includes(q) ||
      (p.state ?? '').toLowerCase().includes(q)
    );
  }, [query, initialData]);

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between gap-3 flex-wrap">
        <h1 className="text-2xl font-semibold">Politicians</h1>
        <SearchBar value={query} onChange={setQuery} placeholder="Search politicians…" />
      </header>
      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
        {filtered.map(p => (
          <CardPolitician key={p.id} p={p} />
        ))}
      </div>
    </div>
  );
}
