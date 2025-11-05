// components/CardParty.tsx
'use client';

import Link from 'next/link';
import AvatarSquare from './AvatarSquare';
import { pickPartyLogoUrl } from '@/lib/data';

type PartyCard = {
  id: string;
  slug: string;          // URL slug (encode when linking)
  name: string;
  abbr?: string | null;  // ticker/short name
  status?: string | null; // National/State/— etc.
  founded?: string | null;
  leaders?: string[];    // array of names
  logo?: string | null;  // direct URL if already mapped
};

export default function CardParty({ party }: { party: PartyCard }) {
  const abbr = party.abbr ?? '';
  const titleAbbr = abbr || (party.name ? party.name.slice(0, 3).toUpperCase() : '');

  // Prefer mapped `logo`, then pick from fields/attachments
  const logo =
    (party as any).logo ??
    pickPartyLogoUrl(party as any) ??
    undefined;

  const leadersText =
    Array.isArray(party.leaders) && party.leaders.length
      ? `Led by ${party.leaders[0]}${party.leaders.length > 1 ? ' +' + (party.leaders.length - 1) : ''}`
      : '';

  return (
    <Link
      href={`/parties/${encodeURIComponent(party.slug)}`}
      aria-label={`Open ${party.name || titleAbbr} party page`}
      className="card card-compact p-4 block h-full hover:shadow-lg transition-shadow overflow-hidden"
      title={party.name || ''}
    >
      <div className="flex items-start gap-3">
        <AvatarSquare
          variant="party"
          src={logo}
          alt={party.name ?? 'Party'}
          size={64}
          rounded="rounded-xl"
          label={abbr || party.name}
        />

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold leading-snug truncate">{party.name}</h3>
            {!!party.status && (
              <span className="shrink-0 text-[11px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                {party.status}
              </span>
            )}
          </div>

          <div className="mt-0.5 text-sm text-black/70 truncate">
            {leadersText || '—'}
          </div>

          <div className="mt-0.5 text-xs text-black/50">
            {party.founded ? `Founded ${party.founded}` : ''}
          </div>
        </div>
      </div>
    </Link>
  );
}
