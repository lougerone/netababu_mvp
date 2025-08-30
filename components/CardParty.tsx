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
    <Link href={`#`} className="card p-4 block">
      <div className="font-medium">{party.name}</div>
      <div className="text-xs text-white/70">{party.abbrev ? `${party.abbrev} • ` : ''}{party.status ?? '—'}</div>
    </Link>
  );
}
