// app/(site)/parties/Client.tsx
// This client component is responsible for rendering the list of parties and
// handling client-side search/filtering. It receives a list of Party objects
// via the `initialData` prop from the server component.

'use client';

import { useState, useMemo } from 'react';
import CardParty from '@/components/CardParty';
import SearchBar from '@/components/SearchBar';
import type { Party } from '@/lib/airtable';

export default function PartiesClient({ initialData }: { initialData: Party[] }) {
  // Query state for the search bar. Typed as a simple string.
  const [query, setQuery] = useState('');
  // Filter the list of parties on the client side based on the search query.
  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return initialData.filter(party =>
      party.name.toLowerCase().includes(q) ||
      (party.slug ?? '').toLowerCase().includes(q) ||
      (party.status ?? '').toLowerCase().includes(q)
    );
  }, [query, initialData]);

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between gap-3 flex-wrap">
        <h1 className="text-2xl font-semibold">Parties</h1>
        <SearchBar value={query} onChange={setQuery} placeholder="Search parties…" />
      </header>
      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
        {filtered.map(party => (
          <CardParty key={party.id} party={party} />
        ))}
      </div>
    </div>
  );
}