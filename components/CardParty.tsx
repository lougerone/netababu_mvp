// components/CardParty.tsx
import Link from 'next/link';

// components/CardParty.tsx

export type Party = {
  id: string;
  slug: string;
  name: string;
  abbrev?: string;
  // Allow any string or null instead of only "Active" | "Inactive"
  status?: string | null;
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
        {/* Render the abbreviation if provided, and show the status or a placeholder if not */}
        {party.abbrev ? `${party.abbrev} • ` : ''}
        {party.status ?? '—'}
      </div>
    </Link>
  );
}
