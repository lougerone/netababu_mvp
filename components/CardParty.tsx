// components/CardParty.tsx
import Link from 'next/link';
import Image from 'next/image';
import type { Party } from '@/lib/airtable';

export default function CardParty({ party }: { party: Party }) {
  const status = (party.status || '').toLowerCase();
  const statusLabel = status.includes('national') ? 'National' : 'State';
  const subtitle = [party.abbr, party.status ? statusLabel : undefined]
    .filter(Boolean)
    .join(' • ') || '—';

  return (
    <Link
      href={`/parties/${party.slug}`}
      aria-label={`Open ${party.name} party page`}
      className="card block p-4 hover:shadow-lg transition-shadow
                 before:content-[''] before:block before:h-1.5 before:rounded-t-xl
                 before:bg-gradient-to-r before:from-saffron-500 before:to-ink-600
                 h-[116px]"  // match politician card height
    >
      <div className="flex h-full items-start gap-3">
        <LogoBox src={party.logo ?? undefined} name={party.name} abbr={party.abbr} />

        {/* same layout as CardPolitician: title, subtitle, bottom spacer */}
        <div className="min-w-0 flex-1 flex flex-col">
          <div className="font-medium text-ink-700 leading-snug line-clamp-1">
            {party.name || '—'}
          </div>
          <div className="text-xs text-ink-600/80 line-clamp-1">
            {subtitle}
          </div>

          {/* bottom line kept empty to give breathing room & align bottoms */}
          <div className="mt-auto text-xs text-ink-600/60">&nbsp;</div>
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
      <div
        className="h-10 w-10 rounded-lg bg-black/5 flex items-center justify-center
                   text-[11px] font-semibold"
        aria-hidden
      >
        {initials(name, abbr)}
      </div>
    );
  }
  return (
    <div className="h-10 w-10 overflow-hidden rounded-lg bg-white">
      <Image
        src={src}
        alt={`${name ?? ''} logo`}
        width={40}
        height={40}
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
