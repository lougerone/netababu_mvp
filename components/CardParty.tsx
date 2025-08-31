// components/CardParty.tsx
import Link from 'next/link';
import type { Party } from '@/lib/airtable';

// Extended interface to handle dynamic Airtable fields
interface ExtendedParty extends Party {
  [key: string]: any;
}

export default function CardParty({ party }: { party: Party }) {
  // Cast to extended type for safe dynamic property access
  const extParty = party as ExtendedParty;
  return (
    <Link
      href={`/parties/${party.slug}`}
      className="card p-4 block relative group hover:shadow-lg transition-shadow
                 before:content-[''] before:block before:h-1.5 before:rounded-t-xl
                 before:bg-gradient-to-r before:from-saffron-500 before:to-ink-600"
      aria-label={`Open ${party.name} party page`}
    >
      {/* Header */}
      <div className="mb-3">
        <div className="font-medium text-ink-700 mb-1">{party.name}</div>
        <div className="flex items-center justify-between text-xs text-ink-600/80">
          <span>
            {party.abbrev ? `${party.abbrev} • ` : ''}
            {party.status ?? '—'}
          </span>
          {/* Status Badge */}
          {party.status && (
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
              party.status === 'National' 
                ? 'bg-blue-100 text-blue-700' 
                : 'bg-purple-100 text-purple-700'
            }`}>
              {party.status}
            </span>
          )}
        </div>
      </div>

      {/* Key Leader */}
      {extParty['Key Leader(s)'] && (
        <div className="mb-2">
          <div className="text-xs text-ink-600/60 uppercase tracking-wide">Leader</div>
          <div className="text-sm text-ink-700 font-medium">{extParty['Key Leader(s)']}</div>
        </div>
      )}

      {/* Lok Sabha Seats */}
      {extParty['Lok Sabha Seats (2019)'] !== undefined && (
        <div className="mb-2">
          <div className="text-xs text-ink-600/60 uppercase tracking-wide">Lok Sabha Seats (2019)</div>
          <div className="text-lg font-bold text-ink-800">{extParty['Lok Sabha Seats (2019)']}</div>
        </div>
      )}

      {/* Symbol/Notes */}
      {extParty.notes && (
        <div className="mb-2">
          <div className="text-xs text-ink-600/60 uppercase tracking-wide">Symbol</div>
          <div className="text-sm text-ink-700">{extParty.notes}</div>
        </div>
      )}

      {/* Details Preview */}
      {extParty.details && (
        <div className="mb-2">
          <div className="text-xs text-ink-600/60 uppercase tracking-wide">About</div>
          <div className="text-sm text-ink-700 leading-relaxed">
            {extParty.details.length > 80 
              ? `${extParty.details.substring(0, 80)}...` 
              : extParty.details
            }
          </div>
        </div>
      )}

      {/* Year/Attachment Sum */}
      {extParty['Attachment Sum'] && (
        <div className="mb-2">
          <div className="text-xs text-ink-600/60 uppercase tracking-wide">Established</div>
          <div className="text-sm text-ink-700 font-medium">{extParty['Attachment Sum']}</div>
        </div>
      )}

      {/* Footer with additional info */}
      <div className="mt-3 pt-3 border-t border-ink-100 flex items-center justify-between text-xs">
        {/* Assignee */}
        {extParty.assignee && (
          <span className="text-ink-600/70">
            Assigned to: {extParty.assignee}
          </span>
        )}
        
        {/* Attachments indicator */}
        {extParty.attachments && extParty.attachments.length > 0 && (
          <span className="bg-ink-100 text-ink-600 px-2 py-1 rounded-full">
            {extParty.attachments.length} files
          </span>
        )}
      </div>

      {/* Hover indicator */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <svg className="w-4 h-4 text-ink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </Link>
  );
}
