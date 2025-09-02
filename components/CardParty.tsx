// components/CardParty.tsx
import Link from 'next/link';
import type { Party } from '@/lib/airtable';
import AvatarSquare from './AvatarSquare';

/* ----------------------------- Small UI bits ----------------------------- */
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

  return (
    <span className={`${base} ${color}`}>
      {isNational ? 'National' : isState ? 'State' : label}
    </span>
  );
}

/* ----------------------------- Data helpers ----------------------------- */
function toList(value: any): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean).map((x) => String(x).trim());
  return String(value)
    .split(/[,\n;]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function pickLeader(party: any): string | undefined {
  return (
    party.leader ||
    party.leaders ||
    party['party leader'] ||
    party['Leader'] ||
    undefined
  );
}

function pickStates(party: any): string[] {
  const candidates = [
    party.states,
    party.state,
    party['active states'],
    party.region,
    party.regions,
  ];
  for (const c of candidates) {
    const arr = toList(c);
    if (arr.length) return arr;
  }
  return [];
}

/* --------------------------------- Card --------------------------------- */
export default function CardParty({ party }: { party: Party }) {
  const scopeRaw =
    party.status ||
    (party as any).scope ||
    (party as any).level ||
    (party as any).type ||
    '';

  const abbr = (party as any).abbr || (party as any).short;
  const titleAbbr = abbr || party.name || '—';

  const leader = pickLeader(party as any);
  const states = pickStates(party as any);
  const stateDisplay =
    states.length > 1 ? `${states[0]} +${states.length - 1}` : states[0];

  return (
    <Link
      href={`/parties/${party.slug}`}
      aria-label={`Open ${party.name || titleAbbr} party page`}
      className="card p-4 block hover:shadow-lg transition-shadow"
      title={party.name || ''} // hover shows full party name
    >
      {/* Slightly taller to comfortably fit 3 rows on one line each */}
      <div className="min-h-[104px]">
        {/* Row 1: Logo | ABBR (left) + Scope pill (right) */}
        <div className="flex items-start gap-3">
          <AvatarSquare
            src={party.logo ?? undefined}
            alt={party.name ?? 'Party'}
            size={48}
            rounded="lg"
          />

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2 min-w-0">
              <div className="font-semibold text-ink-800 truncate leading-5">
                {titleAbbr}
              </div>
              <ScopePill label={scopeRaw || undefined} />
            </div>

            {/* Row 2: Leader (omit if missing) */}
            {leader && (
              <div className="mt-0.5 text-xs text-ink-600 truncate">
                Led by {leader}
              </div>
            )}

            {/* Row 3: Active in <states> (omit if missing) */}
            {states.length > 0 && (
              <div className="mt-0.5 text-xs text-ink-500 truncate" title={states.join(', ')}>
                Active in {stateDisplay}
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
