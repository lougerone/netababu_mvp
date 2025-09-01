// components/CardParty.tsx
import Link from 'next/link';
import type { Party } from '@/lib/airtable';
import AvatarSquare from './AvatarSquare';

export default function CardParty({ party }: { party: Party }) {
  const status = (party.status || '').toLowerCase();
  const isNational = status.includes('national');
  const statusLabel = party.status ? (isNational ? 'National' : 'State') : undefined;

  return (
    <Link
      href={`/parties/${party.slug}`}
      aria-label={`Open ${party.name} party page`}
      className="card card-compact p-4 block hover:shadow-lg transition-shadow
                 bg-indigo-50 border-indigo-100"
    >
      {/* top row: logo + name */}
      <div className="flex items-center gap-3">
        {/* Square image, top-anchored crop (extra height trims from bottom) */}
        <AvatarSquare src={party.logo ?? undefined} alt={party.name ?? 'Party'} size={48} rounded="lg" />

        <div className="min-w-0">
          <div className="font-medium text-ink-700 truncate">{party.name || '—'}</div>
          <div className="text-xs text-ink-600/80 truncate">{party.abbr || '—'}</div>
        </div>
      </div>

      {/* bottom row: ticker left + pill right */}
      <div className="mt-2 flex items-center justify-between text-xs text-ink-600/80 gap-2">
        <span className="truncate min-w-0">{party.abbr || '—'}</span>

        {statusLabel && (
          <span
            className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-medium ${
              isNational ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
            }`}
          >
            {statusLabel}
          </span>
        )}
      </div>
    </Link>
  );
}
