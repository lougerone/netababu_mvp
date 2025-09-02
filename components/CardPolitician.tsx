// components/CardPolitician.tsx
import Link from 'next/link';
import AvatarSquare from './AvatarSquare';

export type Politician = {
  id: string;
  slug: string;
  name: string;
  party: string;
  state?: string | null;
  photo?: string | null;
  current_position?: string | null;
};

export default function CardPolitician({ p }: { p: Politician }) {
  return (
    <Link
      href={`/politicians/${p.slug}`}
      className="card card-compact p-4 block"
      aria-label={`Open ${p.name} profile`}
    >
      <div className="flex items-center gap-3">
        {/* Safe avatar with fallback */}
        <AvatarSquare
  src={p.photo ?? undefined}
  alt={p.name}
  size={48}
  rounded="lg"
  variant="person"
  label={p.name}
/>


        <div className="min-w-0 flex-1">
          <div className="font-medium text-ink-700 truncate">{p.name}</div>
          <div className="text-xs text-ink-600/80 truncate">
            {p.party}
            {p.state ? ` • ${p.state}` : ''}
          </div>
        </div>
      </div>

      {p.current_position && (
        <div className="text-xs text-ink-600/70 mt-2 truncate">
          {p.current_position}
        </div>
      )}
    </Link>
  );
}
