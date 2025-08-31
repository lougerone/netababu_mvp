// components/CardPolitician.tsx
import Image from 'next/image';
import Link from 'next/link';

export type Politician = {
  id: string;
  slug: string;
  name: string;
  party: string;
  state?: string;
  photo?: string;
  current_position?: string;
};

export default function CardPolitician({ p }: { p: Politician }) {
  return (
    <Link
      href={`/politicians/${p.slug}`}
      className="card p-4 block hover:shadow-lg transition-shadow h-24"
      aria-label={`Open ${p.name} profile`}
    >
      {/* Top row: avatar + name/party */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-lg overflow-hidden bg-cream-200 shrink-0">
          <Image
            src={p.photo || '/placeholder-avatar.png'}
            alt={p.name}
            width={48}
            height={48}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="min-w-0">
          <div className="font-medium text-ink-700 truncate">{p.name}</div>
          <div className="text-xs text-ink-600/80 truncate">
            {p.party}
            {p.state ? ` • ${p.state}` : ''}
          </div>
        </div>
      </div>

      {/* Bottom row: always present, matches CardParty pattern */}
      <div className="mt-3 text-xs text-ink-600/70">
        {p.current_position || '—'}
      </div>
    </Link>
  );
}
