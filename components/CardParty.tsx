// components/CardParty.tsx
import Link from 'next/link';
import AvatarSquare from './AvatarSquare';
import { pickPartyLogoUrl, partyBadgeLabel } from '@/lib/media';
console.debug('party logo →', party.slug, pickPartyLogoUrl(party));

type PartyCard = {
  id: string;
  slug: string;
  name: string;
  abbr?: string | null;
  status?: string | null;
  founded?: string | null;
  leaders?: string[];
  logo?: any; // can be attachment array or string — we normalize via helper
};

export default function CardParty({ party }: { party: PartyCard }) {
  const label = partyBadgeLabel(party as any);
  const logo = pickPartyLogoUrl(party as any) ?? undefined; // ✅ only a string URL reaches AvatarSquare

  const leadersText =
    Array.isArray(party.leaders) && party.leaders.length
      ? `Led by ${party.leaders[0]}${party.leaders.length > 1 ? ' +' + (party.leaders.length - 1) : ''}`
      : '';

  return (
    <Link
      href={`/parties/${encodeURIComponent(party.slug)}`}
      aria-label={`Open ${party.name || label} party page`}
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
          label={label}
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
          <div className="mt-0.5 text-sm text-black/70 truncate">{leadersText || '—'}</div>
          <div className="mt-0.5 text-xs text-black/50">{party.founded ? `Founded ${party.founded}` : ''}</div>
        </div>
      </div>
    </Link>
  );
}
