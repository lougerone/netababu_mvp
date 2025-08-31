// components/CardParty.tsx
import Link from 'next/link';
import Image from 'next/image';
import type { Party } from '@/lib/airtable';

type ExtParty = Party & Record<string, any>;

export default function CardParty({ party }: { party: Party }) {
  const ext = party as ExtParty;

  // Airtable extras (case-sensitive keys)
  const leadersRaw = ext['Key Leader(s)'];
  const leaders = Array.isArray(leadersRaw) ? leadersRaw.join(', ') : leadersRaw;
  const seatsKey = Object.keys(ext).find((k) => /^Lok Sabha Seats/i.test(k));
  const seats = seatsKey ? ext[seatsKey] : undefined;
  const details = (ext['Details'] as string | undefined) ?? undefined;
  const founded = party.founded ?? (ext['Founded'] as string | undefined);
  const symbolText = (ext['Attachment Summary'] as string | undefined) ?? undefined;
  const attachmentsCount = Array.isArray(ext['Attachments']) ? ext['Attachments'].length : 0;
  const assignee = (ext['Assignee'] as string | undefined) ?? undefined;

  // 👇 new: determine national/state + state name
const isNational = (party.status || '').toLowerCase().includes('national');
const stateName = party.state; // rely on mapped field only

{party.status && (
  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
    isNational ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
  }`}>
    {isNational ? 'National' : (stateName || 'State')}
  </span>
)}


  return (
    <Link
      href={`/parties/${party.slug}`}
      className="card p-4 block relative group hover:shadow-lg transition-shadow
                 before:content-[''] before:block before:h-1.5 before:rounded-t-xl
                 before:bg-gradient-to-r before:from-saffron-500 before:to-ink-600"
      aria-label={`Open ${party.name} party page`}
    >
      {/* Header */}
      <div className="mb-3 flex items-start gap-3">
        <LogoBox src={party.logo ?? undefined} name={party.name} abbr={party.abbr} />
        <div className="min-w-0 flex-1">
          <div className="font-medium text-ink-700 mb-1">{party.name || '—'}</div>
          <div className="flex items-center justify-between text-xs text-ink-600/80">
            <span>{[party.abbr, party.status].filter(Boolean).join(' • ') || '—'}</span>
            {party.status && (
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  isNational ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                }`}
              >
                {isNational ? 'National' : (stateName || 'State')}
              </span>
            )}
          </div>
        </div>
      </div>

      {founded && (
        <div className="mb-2">
          <div className="text-xs text-ink-600/60 uppercase tracking-wide">Founded</div>
          <div className="text-sm text-ink-700 font-medium">{founded}</div>
        </div>
      )}

      {leaders && (
        <div className="mb-2">
          <div className="text-xs text-ink-600/60 uppercase tracking-wide">Leader</div>
          <div className="text-sm text-ink-700 font-medium">{leaders}</div>
        </div>
      )}

      {seats !== undefined && (
        <div className="mb-2">
          <div className="text-xs text-ink-600/60 uppercase tracking-wide">{seatsKey}</div>
          <div className="text-lg font-bold text-ink-800">{seats}</div>
        </div>
      )}

      {symbolText && (
        <div className="mb-2">
          <div className="text-xs text-ink-600/60 uppercase tracking-wide">Symbol</div>
          <div className="text-sm text-ink-700">{symbolText}</div>
        </div>
      )}

      {details && (
        <div className="mb-2">
          <div className="text-xs text-ink-600/60 uppercase tracking-wide">About</div>
          <div className="text-sm text-ink-700 leading-relaxed">
            {details.length > 120 ? `${details.slice(0, 120)}…` : details}
          </div>
        </div>
      )}

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
    </Link>
  );
}

/* ------------------------------ atoms ----------------------------------- */

function LogoBox({
  src,
  name,
  abbr,
}: {
  src?: string;
  name?: string;
  abbr?: string;
}) {
  if (!src) {
    return (
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-black/5 text-[11px] font-semibold">
        {initials(name, abbr)}
      </div>
    );
  }
  return (
    <div className="h-10 w-10 overflow-hidden rounded-lg bg-white p-1">
      <Image
        src={src}
        alt={`${name ?? ''} logo`}
        width={64}
        height={64}
        className="h-full w-full object-contain"
      />
    </div>
  );
}

function initials(name?: string, abbr?: string) {
  const s = (abbr || name || '').trim();
  if (!s) return '—';
  const parts = s.split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]).join('').toUpperCase();
}
