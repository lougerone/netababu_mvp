// components/CardParty.tsx
import Link from 'next/link';
import Image from 'next/image';
import type { Party } from '@/lib/airtable';

export default function CardParty({ party }: { party: Party }) {
  const status = (party.status || '').toLowerCase();
  const hasStatus = Boolean(party.status);
  const statusLabel = hasStatus ? (status.includes('national') ? 'National' : 'State') : undefined;

  return (
    <Link
      href={`/parties/${party.slug}`}
      aria-label={`Open ${party.name} party page`}
      className="
        card p-4 block hover:shadow-lg transition-shadow
        bg-violet-50 border-violet-200
      "
    >
      {/* top row: logo + name */}
      <div className="flex items-center gap-3">
        <LogoBox src={party.logo ?? undefined} name={party.name} abbr={party.abbr} />

        <div className="min-w-0">
          <div className="font-medium text-ink-700 truncate">{party.name || '—'}</div>
          <div className="text-xs text-ink-600/80 truncate">{party.abbr || '—'}</div>
        </div>
      </div>

      {/* bottom row: ticker left + pill right */}
      <div className="mt-3 flex items-center justify-between text-xs text-ink-600/80 gap-2">
        <span className="truncate min-w-0">{party.abbr || '—'}</span>

        {statusLabel && (
          <span className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-medium bg-purple-100 text-purple-700">
            {statusLabel}
          </span>
        )}
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
        className="h-12 w-12 rounded-lg bg-black/5 flex items-center justify-center text-[11px] font-semibold"
        aria-hidden
      >
        {initials(name, abbr)}
      </div>
    );
  }
  return (
    <div className="h-12 w-12 overflow-hidden rounded-lg bg-white">
      <Image
        src={src}
        alt={`${name ?? ''} logo`}
        width={48}
        height={48}
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
