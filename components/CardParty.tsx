// components/CardParty.tsx
import Link from 'next/link';

export type Party = {
  id: string;
  slug: string;
  name: string;
  abbrev?: string;
  status?: 'Active' | 'Inactive';
};

export default function CardParty({ party }: { party: Party }) {
  return (
    <Link
      href={`/parties/${party.slug}`}
      className="card p-4 block relative
                 before:content-[''] before:block before:h-1.5 before:rounded-t-xl
                 before:bg-gradient-to-r before:from-saffron-500 before:to-ink-600"
      aria-label={`Open ${party.name} party page`}
    >
      <div className="font-medium text-ink-700">{party.name}</div>
      <div className="text-xs text-ink-600/80">
        {party.abbrev ? `${party.abbrev} • ` : ''}{party.status ?? '—'}
      </div>
    </Link>
  );
}
