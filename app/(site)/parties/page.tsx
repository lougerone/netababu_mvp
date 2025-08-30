'use client';
import { useMemo, useState } from 'react';
import CardParty from '@/components/CardParty';
import SearchBar from '@/components/SearchBar';
import { parties } from '@/lib/data';

export default function PartiesIndex() {
  const [query, setQuery] = useState('');
  const items = useMemo(() => {
    const q = query.toLowerCase();
    return parties.filter(p => p.name.toLowerCase().includes(q) || (p.abbrev ?? '').toLowerCase().includes(q));
  }, [query]);

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between gap-3 flex-wrap">
        <h1 className="text-2xl font-semibold">Parties</h1>
        <SearchBar value={query} onChange={setQuery} placeholder="Search parties…" />
      </header>
      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
        {items.map(p => <CardParty key={p.id} party={p} />)}
      </div>
    </div>
  );
}
