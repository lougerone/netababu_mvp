import Link from 'next/link';
import type { Party } from '@/lib/airtable';
import AvatarSquare from './AvatarSquare';

function ScopePill({ label }: { label?: string }) {
  if (!label) return null;
  const s = label.toLowerCase();
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

export default function CardParty({ party }: { party: Party }) {
  const scopeRaw =
    party.status ||
    (party as any).scope ||
    (party as any).level ||
    (party as any).type ||
    '';

  return (
    <Link
      href={`/parties/${party.slug}`}
      aria-label={`Open ${party.name} party page`}
      className="card p-4 block hover:shadow-lg transition-shadow"
    >
      {/* Lock a consistent internal height so grids align perfectly */}
      <div className="min-h-[76px]">
        {/* Top row: logo + name + scope pill */}
        <div className="flex items-start gap-3">
          <AvatarSquare
            src={party.logo ?? undefined}
            alt={party.name ?? 'Party'}
            size={48}
            rounded="lg"
          />

          <div className="min-w-0 flex-1">
            <div className="flex items-start gap-2 min-w-0">
              <div className="font-medium text-ink-700 truncate leading-5">
                {party.name || '—'}
              </div>
              <ScopePill label={scopeRaw || undefined} />
            </div>

            {/* Subline: abbr chip + state (single line, no overflow) */}
            <div className="mt-0.5 flex items-center gap-2 text-xs text-black/60 min-w-0">
              {party.abbr && (
                <span className="rounded bg-black/5 px-1.5 py-0.5 shrink-0">
                  {party.abbr}
                </span>
              )}
              {(party as any).state && (
                <span className="truncate">{(party as any).state}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
