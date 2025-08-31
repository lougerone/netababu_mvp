// components/CardParty.tsx
import Link from 'next/link';
import type { Party } from '@/lib/airtable';

type ExtParty = Party & Record<string, any>;

export default function CardParty({ party }: { party: Party }) {
  const ext = party as ExtParty;

  // --- Dynamic Airtable extras (case-sensitive keys) ---
  const leadersRaw = ext['Key Leader(s)'];
  const leaders = Array.isArray(leadersRaw) ? leadersRaw.join(', ') : leadersRaw;

  const seatsKey = Object.keys(ext).find((k) => /^Lok Sabha Seats/i.test(k));
  const seats = seatsKey ? ext[seatsKey] : undefined;

  const details = (ext['Details'] as string | undefined) ?? undefined;
  const founded = party.founded ?? (ext['Founded'] as string | undefined);
  const symbolText = (ext['Attachment Summary'] as string | undefined) ?? undefined;

  const attachmentsCount = Array.isArray(ext['Attachments'])
    ? ext['Attachments'].length
    : 0;

  const assignee = (ext['Assignee'] as string | undefined) ?? undefined;

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
        <div className="font-medium text-ink-700 mb-1">{party.name || '—'}</div>
        <div className="flex items-center justify-between text-xs text-ink-600/80">
          <span>{[party.abbr, party.status].filter(Boolean).join(' • ') || '—'}</span>

          {/* Status Badge */}
          {party.status && (
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                party.status === 'National'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-purple-100 text-purple-700'
              }`}
            >
              {party.status}
            </span>
          )}
        </div>
      </div>

      {/* Founded */}
      {founded && (
        <div className="mb-2">
          <div className="text-xs text-ink-600/60 uppercase tracking-wide">Founded</div>
          <div className="text-sm text-ink-700 font-medium">{founded}</div>
        </div>
      )}

      {/* Key Leader(s) */}
      {leaders && (
        <div className="mb-2">
          <div className="text-xs text-ink-600/60 uppercase tracking-wide">Leader</div>
          <div className="text-sm text-ink-700 font-medium">{leaders}</div>
        </div>
      )}

      {/* Lok Sabha Seats (any year) */}
      {seats !== undefined && (
        <div className="mb-2">
          <div className="text-xs text-ink-600/60 uppercase tracking-wide">
            {seatsKey}
          </div>
          <div className="text-lg font-bold text-ink-800">{seats}</div>
        </div>
      )}

      {/* Symbol text (Attachment Summary) */}
      {symbolText && (
        <div className="mb-2">
          <div className="text-xs text-ink-600/60 uppercase tracking-wide">Symbol</div>
          <div className="text-sm text-ink-700">{symbolText}</div>
        </div>
      )}

      {/* Details */}
      {details && (
        <div className="mb-2">
          <div className="text-xs text-ink-600/60 uppercase tracking-wide">About</div>
          <div className="text-sm text-ink-700 leading-relaxed">
            {details.length > 120 ? `${details.slice(0, 120)}…` : details}
          </div>
        </div>
      )}

      {/* Footer */}
      {(assignee || attachmentsCount > 0) && (
        <div className="mt-3 pt-3 border-t border-ink-100 flex items-center justify-between text-xs">
          {assignee && <span className="text-ink-600/70">Assigned to: {assignee}</span>}
          {attachmentsCount > 0 && (
            <span className="bg-ink-100 text-ink-600 px-2 py-1 rounded-full">
              {attachmentsCount} file{attachmentsCount > 1 ? 's' : ''}
            </span>
          )}
        </div>
      )}

      {/* Hover indicator */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <svg className="w-4 h-4 text-ink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </Link>
  );
}
