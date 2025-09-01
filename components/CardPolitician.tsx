// components/CardPolitician.tsx
import Link from 'next/link';
import AvatarSquare from './AvatarSquare';

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
      className="card card-compact p-4 block"
      aria-label={`Open ${p.name} profile`}
    >
      <div className="flex items-center gap-3">
        {/* Square image; AvatarSquare should use object-cover object-top internally */}
        <AvatarSquare src={p.photo} alt={p.name} size={48} rounded="lg" />

        <div className="min-w-0">
          <div className="font-medium text-ink-700 truncate">{p.name}</div>
          <div className="text-xs text-ink-600/80 truncate">
            {p.party}
            {p.state && ` • ${p.state}`}
          </div>
        </div>
      </div>

      {p.current_position && (
        <div className="text-xs text-ink-600/70 mt-2">{p.current_position}</div>
      )}
    </Link>
  );
}
