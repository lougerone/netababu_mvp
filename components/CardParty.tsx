// components/CardParty.tsx
import Link from 'next/link';
import Image from 'next/image';
import type { Party } from '@/lib/airtable';

export default function CardParty({ party }: { party: Party }) {
  const status = (party.status || '').toLowerCase();
  const isNational = status.includes('national');
  const statusLabel = isNational ? 'National' : 'State';

  return (
    <Link
      href={`/parties/${party.slug}`}
      aria-label={`Open ${party.name} party page`}
      className="card block relative p-4 hover:shadow-lg transition-shadow
                 before:content-[''] before:block before:h-1.5 before:rounded-t-xl
                 before:bg-gradient-to-r before:from-saffron-500 before:to-ink-600
                 h-[96px]" /* fixed height for consistent cards */
    >
      <div className="flex h-full items-start gap-3">
        <LogoBox src={party.logo ?? undefined} name={party.name} abbr={party.abbr} />

        <div className="min-w-0 flex-1">
          {/* Name: clamp to 2 lines; reserve space so cards align */}
          <div className="mb-1 font-medium text-ink-700 leading-snug line-clamp-2 min-h-[2.4em]">
            {party.name || '—'}
          </div>

          {/* Meta row + compact badge on the right */}
          <div className="flex items-center justify-between text-xs text-ink-600/80">
            <span className="truncate">
              {[party.abbr, statusLabel].filter(Boolean).join(' • ') || '—'}
            </span>
            {party.status && (
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                  isNational ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                }`}
              >
                {statusLabel}
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
