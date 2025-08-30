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
    <Link href={`#`} className="card p-4 block">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-lg overflow-hidden bg-white/10">
          <Image src={p.photo || '/placeholder-avatar.png'} alt={p.name} width={48} height={48} />
        </div>
        <div className="min-w-0">
          <div className="font-medium truncate">{p.name}</div>
          <div className="text-xs text-white/70 truncate">{p.party} {p.state ? `• ${p.state}` : ''}</div>
        </div>
      </div>
      <div className="flex items-center gap-2">
  <div className="text-xs text-white/70 truncate">{p.party} {p.state ? `• ${p.state}` : ''}</div>
  <span className="ml-auto px-2 py-0.5 text-[11px] rounded-full bg-saffron-500/15 text-saffron-500 border border-saffron-500/30">
    {p.party}
  </span>
</div>

      {p.current_position && (
        <div className="text-xs text-white/60 mt-3">{p.current_position}</div>
      )}
    </Link>
  );
}
