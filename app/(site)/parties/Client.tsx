// app/(site)/parties/Client.tsx
// Enhanced version with proper TypeScript handling for dynamic Airtable fields
'use client';
import { useState, useMemo } from 'react';
import CardParty from '@/components/CardParty';
import SearchBar from '@/components/SearchBar';
import type { Party } from '@/lib/airtable';

// Extend the Party type to include all your Airtable fields
interface ExtendedParty extends Party {
  [key: string]: any; // Allow dynamic property access for Airtable fields
}

export default function PartiesClient({ initialData }: { initialData: Party[] }) {
  // Existing query state
  const [query, setQuery] = useState('');
  
  // Additional filter states
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');

  // Debug: Log the data structure
  console.log('PartiesClient received data:', initialData);
  console.log('First party structure:', initialData[0]);

  // Enhanced filtering with safe property access
  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    
    let filteredParties = initialData.filter(party => {
      const extParty = party as ExtendedParty;
      
      // Safe property access for all searchable fields
      const searchableFields = [
        extParty.name,
        extParty.slug,
        extParty.status,
        extParty['Key Leader(s)'],
        extParty.assignee,
        extParty.details,
        extParty.notes
      ];

      const searchMatch = searchableFields
        .filter(field => field != null)
        .some(field => String(field).toLowerCase().includes(q));

      const statusMatch = statusFilter === 'all' || extParty.status === statusFilter;
      
      return searchMatch && statusMatch;
    });

    // Sort the results with safe property access
    filteredParties.sort((a, b) => {
      const extA = a as ExtendedParty;
      const extB = b as ExtendedParty;
      
      switch (sortBy) {
        case 'name':
          return (extA.name || '').localeCompare(extB.name || '');
        case 'seats':
          const aSeats = extA['Lok Sabha Seats (2019)'] || 0;
          const bSeats = extB['Lok Sabha Seats (2019)'] || 0;
          return Number(bSeats) - Number(aSeats);
        case 'status':
          return (extA.status || '').localeCompare(extB.status || '');
        default:
          return 0;
      }
    });

    return filteredParties;
  }, [query, initialData, statusFilter, sortBy]);

  // Get unique statuses for the filter dropdown
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
            Showing {filtered.length} of {initialData.length} parties
          </p>
        </div>
        <SearchBar value={query} onChange={setQuery} placeholder="Search parties…" />
      </header>

      {/* Quick Filters Row */}
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
            {uniqueStatuses.map(status => (
              <option key={status} value={status}>
                {status} ({initialData.filter(p => p.status === status).length})
              </option>
            ))}
          </select>
        </div>

        {/* Sort By */}
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-700">Sort:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="name">Name</option>
            <option value="seats">Lok Sabha Seats</option>
            <option value="status">Status</option>
          </select>
        </div>

        {/* Quick Stats */}
        <div className="ml-auto flex items-center gap-4 text-sm">
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            National: {initialData.filter(p => p.status === 'National').length}
          </span>
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            State: {initialData.filter(p => p.status === 'State').length}
          </span>
        </div>
      </div>

      {/* Parties Grid - using your existing CardParty component */}
      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
        {filtered.map(party => (
          <CardParty key={party.id} party={party} />
        ))}
      </div>

      {/* Empty State */}
      {filtered.length === 0 && query && (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg mb-2">No parties found</p>
          <p className="text-sm">Try adjusting your search or filters</p>
        </div>
      )}

      {/* Debug Panel (only in development) */}
      {process.env.NODE_ENV === 'development' && initialData.length > 0 && (
        <details className="mt-8 p-4 bg-gray-100 rounded-lg">
          <summary className="cursor-pointer text-sm font-medium text-gray-700">
            Debug: View Data Structure
          </summary>
          <pre className="mt-2 text-xs bg-white p-3 rounded border overflow-auto max-h-40">
            {JSON.stringify(initialData[0], null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
}
