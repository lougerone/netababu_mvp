import Link from 'next/link';

export type Party = {
  id: string;
  slug: string;
  name: string;
  abbrev?: string;
  status?: 'Active' | 'Inactive';
};

<Link href={`/parties/${party.slug}`}
  className="card p-4 block relative before:content-[''] before:block before:h-1.5 before:rounded-t-xl
             before:bg-gradient-to-r before:from-saffron-500 before:to-brand-500">


export default function CardParty({ party }: { party: Party }) {
  return (
    <Link href={`#`} className="card p-4 block">
      <div className="font-medium">{party.name}</div>
      <div className="text-xs text-white/70">{party.abbrev ? `${party.abbrev} • ` : ''}{party.status ?? '—'}</div>
    </Link>
  );
}
