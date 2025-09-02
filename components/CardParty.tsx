// components/CardParty.tsx
import Link from 'next/link';
import type { Party } from '@/lib/airtable';
import AvatarSquare from './AvatarSquare';

/* UI */
function ScopePill({ label }: { label?: string }) {
  if (!label) return null;
  const s = String(label).toLowerCase();
  const isNational = s.includes('national');
  const isState = s.includes('state');
  const base =
    'inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium shrink-0 whitespace-nowrap';
  const color = isNational
    ? 'bg-purple-100 text-purple-700'
    : isState
    ? 'bg-teal-100 text-teal-700'
    : 'bg-black/10 text-ink-700';
  return <span className={`${base} ${color}`}>{isNational ? 'National' : isState ? 'State' : label}</span>;
}

/* helpers */
const toList = (v: any): string[] =>
  !v
    ? []
    : Array.isArray(v)
    ? v.filter(Boolean).map((x) => String(x).trim())
    : String(v).split(/[,\n;]/).map((s) => s.trim()).filter(Boolean);

const pickLeader = (p: any): string | undefined =>
  p.leader || p.leaders || p['party leader'] || p['Leader'] || undefined;

const pickStates = (p: any): string[] => {
  for (const cand of [p.states, p.state, p['active states'], p.region, p.regions]) {
    const arr = toList(cand);
    if (arr.length) return arr;
  }
  return [];
};

export default function CardParty({ party }: { party: Party }) {
  const scopeRaw =
    party.status || (party as any).scope || (party as any).level || (party as any).type || '';
  const abbr = (party as any).abbr || (party as any).short;
  const titleAbbr = abbr || party.name || '—';
  const leader = pickLeader(party as any);
  const states = pickStates(party as any);
  const stateDisplay = states.length > 1 ? `${states[0]} +${states.length - 1}` : states[0];

  return (
    <Link
      href={`/parties/${party.slug}`}
      aria-label={`Open ${party.name || titleAbbr} party page`}
      className="card card-compact p-4 block h-full hover:shadow-lg transition-shadow overflow-hidden"
      title={party.name || ''} // full name on hover
    >
      {/* Column layout with bottom row pinned and increased min-height */}
      <div className="flex h-full flex-col min-h-[140px] min-w-0">
        {/* TOP */}
        <div className="flex items-start gap-3 min-w-0">
          <AvatarSquare src={party.logo ?? undefined} alt={party.name ?? 'Party'} size={48} rounded="lg" />
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2 min-w-0">
              <div className="font-semibold text-ink-800 truncate leading-5">{titleAbbr}</div>
              <ScopePill label={scopeRaw || undefined} />
            </div>
            {leader && (
              <div className="mt-0.5 text-xs text-ink-600 truncate">{`Led by ${leader}`}</div>
            )}
          </div>
        </div>
        
        {/* BOTTOM - Active in states (pinned to bottom) */}
        {states.length > 0 && (
          <div
            className="mt-auto pt-3 text-xs text-ink-500 truncate min-w-0"
            title={states.join(', ')}
          >
            {`Active in ${stateDisplay}`}
          </div>
        )}
      </div>
    </Link>
  );
}
