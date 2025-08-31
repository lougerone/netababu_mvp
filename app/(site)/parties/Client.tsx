// app/(site)/parties/Client.tsx
// Enhanced version that includes all database columns while keeping your existing structure
'use client';
import { useState, useMemo } from 'react';
import CardParty from '@/components/CardParty';
import SearchBar from '@/components/SearchBar';
import type { Party } from '@/lib/airtable';

export default function PartiesClient({ initialData }: { initialData: Party[] }) {
  // Query state for the search bar
  const [query, setQuery] = useState('');
  // Additional filter states for all your columns
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');

  // Debug log to see what data we're getting
  console.log('PartiesClient initialData:', initialData);

  // Enhanced filtering that includes all your Airtable columns
  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    
    let filteredParties = initialData.filter(party => {
      // Search across all relevant fields from your Airtable
      const searchableFields = [
        party.name,
        party.slug,
        party.status,
        party['Key Leader(s)'] || party.keyLeaders, // Handle different field naming
        party.assignee,
        party.details,
        party.notes
      ].filter(Boolean).join(' ').toLowerCase();

      const matchesSearch = searchableFields.includes(q);
      const matchesStatus = statusFilter === 'all' || party.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });

    // Sort the results
    filteredParties.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'seats':
          const aSeats = a['Lok Sabha Seats (2019)'] || a.lokSabhaSeats || 0;
          const bSeats = b['Lok Sabha Seats (2019)'] || b.lokSabhaSeats || 0;
          return bSeats - aSeats;
        case 'status':
          return (a.status || '').localeCompare(b.status || '');
        default:
          return 0;
      }
    });

    return filteredParties;
  }, [query, initialData, statusFilter, sortBy]);

  // Get unique statuses for filter
  const uniqueStatuses = useMemo(() => {
    const statuses = [...new Set(initialData.map(party => party.status).filter(Boolean))];
    return statuses;
  }, [initialData]);

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold">Parties</h1>
          <p className="text-gray-600 text-sm mt-1">
            {initialData.length} total parties • {filtered.length} showing
          </p>
        </div>
        <SearchBar value={query} onChange={setQuery} placeholder="Search parties…" />
      </header>

      {/* Quick Filters */}
      <div className="flex flex-wrap gap-3">
        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="all">All Status</option>
          {uniqueStatuses.map(status => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>

        {/* Sort By */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="name">Sort by Name</option>
          <option value="seats">Sort by Lok Sabha Seats</option>
          <option value="status">Sort by Status</option>
        </select>

        {/* Additional info display toggle */}
        <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-md text-sm">
          <span className="text-gray-600">National:</span>
          <span className="font-medium text-blue-600">
            {initialData.filter(p => p.status === 'National').length}
          </span>
          <span className="text-gray-400">|</span>
          <span className="text-gray-600">State:</span>
          <span className="font-medium text-purple-600">
            {initialData.filter(p => p.status === 'State').length}
          </span>
        </div>
      </div>

      {/* Results Grid - using your existing CardParty component */}
      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
        {filtered.map(party => (
          <CardParty key={party.id} party={party} />
        ))}
      </div>

      {/* Empty State */}
      {filtered.length === 0 && query && (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg mb-2">No parties found for "{query}"</p>
          <p className="text-sm">Try a different search term or clear the filters</p>
        </div>
      )}

      {/* Optional: Data Debug Panel (remove in production) */}
      {process.env.NODE_ENV === 'development' && (
        <details className="mt-8 p-4 bg-gray-100 rounded-lg">
          <summary className="cursor-pointer text-sm font-medium text-gray-700">
            Debug: View Raw Data Structure
          </summary>
          <pre className="mt-2 text-xs bg-white p-3 rounded border overflow-auto max-h-40">
            {JSON.stringify(initialData[0], null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
}
