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
  const candidates = [p.states, p.state, p['active states'], p.region, p.regions];
  for (const c of candidates) {
    const arr = toList(c);
    if (arr.length) return arr;
  }
  return [];
};

export default function CardParty({ party }: { party: Party }) {
  const scopeRaw =
    (party as any).status ||
    (party as any).scope ||
    (party as any).level ||
    (party as any).type ||
    '';

  const abbr = (party as any).abbr || (party as any).short;
  const titleAbbr = abbr || party.name || '—';

  const leader = pickLeader(party as any);
  const statesList = pickStates(party as any);

  // Build the bottom-line label with safe fallbacks
  let activeLabel = '';
  if (statesList.length > 1) activeLabel = `${statesList[0]} +${statesList.length - 1}`;
  else if (statesList.length === 1) activeLabel = statesList[0];
  else {
    const s = String(scopeRaw).toLowerCase();
    if (s.includes('national')) activeLabel = 'India';
    else if (s.includes('state') && (party as any).state) activeLabel = String((party as any).state);
  }

  return (
    <Link
      href={`/parties/${party.slug}`}
      aria-label={`Open ${party.name || titleAbbr} party page`}
      className="card card-compact p-4 block h-full hover:shadow-lg transition-shadow overflow-hidden"
      title={party.name || ''} // full name on hover
    >
      {/* 3-row grid: title, (leader grows), bottom line pinned */}
      <div className="grid grid-rows-[auto,1fr,auto] min-h-[112px] h-full min-w-0">
        {/* Row 1 */}
        <div className="flex items-start gap-3 min-w-0">
          <AvatarSquare
            src={party.logo ?? undefined}
            alt={party.name ?? 'Party'}
            size={48}
            rounded="lg"
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2 min-w-0">
              <div className="font-semibold text-ink-800 truncate leading-5">{titleAbbr}</div>
              <ScopePill label={scopeRaw || undefined} />
            </div>
          </div>
        </div>

        {/* Row 2 (flexible middle) */}
        <div className="min-w-0">
          {leader && (
            <div className="mt-1 text-xs text-ink-600 truncate">
              Led by {leader}
            </div>
          )}
        </div>

        {/* Row 3 (bottom pinned) */}
        {activeLabel && (
          <div
            className="pt-1 text-xs leading-4 text-ink-500 truncate min-w-0"
            title={statesList.length ? statesList.join(', ') : activeLabel}
          >
            Active in {activeLabel}
          </div>
        )}
      </div>
    </Link>
  );
}
