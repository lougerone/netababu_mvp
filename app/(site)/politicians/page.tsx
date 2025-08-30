'use client';
import { useMemo, useState } from 'react';
import CardPolitician from '@/components/CardPolitician';
import SearchBar from '@/components/SearchBar';
import { politicians } from '@/lib/data';

export default function PoliticiansIndex() {
  const [query, setQuery] = useState('');
  const items = useMemo(() => {
    const q = query.toLowerCase();
    return politicians.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.party.toLowerCase().includes(q) ||
      (p.state ?? '').toLowerCase().includes(q)
    );
  }, [query]);

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between gap-3 flex-wrap">
        <h1 className="text-2xl font-semibold">Politicians</h1>
        <SearchBar value={query} onChange={setQuery} placeholder="Search politicians…" />
      </header>
      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
        {items.map(p => <CardPolitician key={p.id} p={p} />)}
      </div>
    </div>
  );
}
