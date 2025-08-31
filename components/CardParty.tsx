// components/CardParty.tsx
import Link from 'next/link';
import Image from 'next/image';
import type { Party } from '@/lib/airtable';

export default function CardParty({ party }: { party: Party }) {
  const isNational = (party.status || '').toLowerCase().includes('national');

  return (
    <Link
      href={`/parties/${party.slug}`}
      className="card p-4 block relative group hover:shadow-lg transition-shadow
                 before:content-[''] before:block before:h-1.5 before:rounded-t-xl
                 before:bg-gradient-to-r before:from-saffron-500 before:to-ink-600"
      aria-label={`Open ${party.name} party page`}
    >
      {/* Header only (minimal card) */}
      <div className="flex items-start gap-3">
        <LogoBox src={party.logo ?? undefined} name={party.name} abbr={party.abbr} />
        <div className="min-w-0 flex-1">
          <div className="font-medium text-ink-700 mb-1 truncate">{party.name || '—'}</div>
          <div className="flex items-center justify-between text-xs text-ink-600/80">
            {/* Show ticker, and for national parties also show "National" in the meta row */}
            <span className="truncate">
              {[party.abbr, isNational ? 'National' : undefined]
                .filter(Boolean)
                .join(' • ') || '—'}
            </span>

            {/* Right badge: National (blue) or literal State (purple) */}
            {party.status && (
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  isNational ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                }`}
              >
                {isNational ? 'National' : 'State'}
              </span>
            )}
          </div>
        </div>
      </div>
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
