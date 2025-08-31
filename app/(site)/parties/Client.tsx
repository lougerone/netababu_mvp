// app/(site)/parties/Client.tsx
'use client';

import { useState, useMemo } from 'react';
import CardParty from '@/components/CardParty';
import SearchBar from '@/components/SearchBar';
import type { Party } from '@/lib/airtable';

type SortKey = 'name' | 'seats' | 'status';

// Ensure we always work with a string status in the UI
const toStatus = (s: Party['status']): string => (s == null || s === '' ? 'Unknown' : String(s));

export default function PartiesClient({ initialData }: { initialData: Party[] }) {
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortKey>('name');

  // Build a stable, string-only list of statuses for the dropdown
  const uniqueStatuses = useMemo<string[]>(() => {
    const set = new Set<string>();
    for (const p of initialData) set.add(toStatus(p.status));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [initialData]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();

    let out = initialData.filter((p) => {
      const s = toStatus(p.status);
      const searchMatch =
        p.name.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q) ||
        s.toLowerCase().includes(q);

      const statusMatch = statusFilter === 'all' || s === statusFilter;
      return searchMatch && statusMatch;
    });

    out.sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'status') return toStatus(a.status).localeCompare(toStatus(b.status));
      if (sortBy === 'seats') {
        // Safely coerce possible numeric-ish Airtable field
        const aSeats = Number((a as any)['Lok Sabha Seats (2019)'] ?? 0);
        const bSeats = Number((b as any)['Lok Sabha Seats (2019)'] ?? 0);
        return bSeats - aSeats;
      }
      return 0;
    });

    return out;
  }, [initialData, query, statusFilter, sortBy]);

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold">Parties</h1>
          <p className="text-gray-600 text-sm mt-1">
            Showing {filtered.length} of {initialData.length} parties
          </p>
        </div>
        <SearchBar value={query} onChange={setQuery} placeholder="Search parties…" />
      </header>

      <div className="flex flex-wrap gap-3 items-center">
        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-700">Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All</option>
            {uniqueStatuses.map((status) => (
              <option key={`status-${status}`} value={status}>
                {status} ({initialData.filter((p) => toStatus(p.status) === status).length})
              </option>
            ))}
          </select>
        </div>

        {/* Sort By */}
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-700">Sort:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortKey)}
            className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="name">Name</option>
            <option value="seats">Lok Sabha Seats</option>
            <option value="status">Status</option>
          </select>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
        {filtered.map((party) => (
          <CardParty key={party.id} party={party} />
        ))}
      </div>

      {filtered.length === 0 && query && (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg mb-2">No parties found</p>
          <p className="text-sm">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
}
