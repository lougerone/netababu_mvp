// app/(site)/parties/page.tsx
import Link from 'next/link';
import Image from 'next/image';
import { listParties } from '@/lib/airtable';
import type { Party } from '@/lib/airtable';   // ← use the source of truth

export const dynamic = 'force-dynamic';

export default async function PartiesPage({
  searchParams,
}: { searchParams?: { [key: string]: string | undefined } }) {
  const view: 'grid' | 'list' =
    (searchParams?.view?.toLowerCase() as 'grid' | 'list') === 'list' ? 'list' : 'grid';

  const parties = await listParties();        // ← no manual annotation
  const count = parties.length;

  const base = new URLSearchParams();
  Object.entries(searchParams ?? {}).forEach(([k, v]) => {
    if (k !== 'view' && typeof v === 'string') base.set(k, v);
  });
  const baseObj = Object.fromEntries(base);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Parties</h1>
          <p className="text-sm text-black/60">Showing {count} parties</p>
        </div>
        <div className="inline-flex overflow-hidden rounded-lg border border-black/10">
          <Link href={{ pathname: '/parties', query: { ...baseObj, view: 'grid' } }}
                className={`px-3 py-2 text-sm ${view === 'grid' ? 'bg-black/5 font-medium' : 'hover:bg-black/5'}`}>
            Grid
          </Link>
          <Link href={{ pathname: '/parties', query: { ...baseObj, view: 'list' } }}
                className={`px-3 py-2 text-sm border-l border-black/10 ${view === 'list' ? 'bg-black/5 font-medium' : 'hover:bg-black/5'}`}>
            List
          </Link>
        </div>
      </header>

      {view === 'grid' ? <GridView parties={parties} /> : <ListView parties={parties} />}
    </main>
  );
}

function GridView({ parties }: { parties: Party[] }) {
  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {parties.map((p) => (
        <Link key={p.id} href={`/parties/${p.slug}`}
              className="group rounded-xl border border-black/10 bg-white shadow-sm transition hover:border-black/20 hover:shadow-md">
          <article className="p-4">
            <div className="mb-3 flex items-center gap-3">
              <LogoBox src={p.logo ?? undefined} alt={`${p.name} logo`} name={p.name} abbr={p.abbr} />
              <div className="min-w-0">
                <h2 className="truncate text-base font-medium group-hover:underline">{p.name || '—'}</h2>
                <p className="truncate text-xs text-black/60">
                  {[p.abbr, p.status].filter(Boolean).join(' • ') || '—'}
                </p>
              </div>
            </div>
            {p.founded ? <p className="text-xs text-black/60">Founded: {p.founded}</p> : null}
          </article>
        </Link>
      ))}
    </section>
  );
}

function ListView({ parties }: { parties: Party[] }) {
  return (
    <section className="divide-y divide-black/10 rounded-xl border border-black/10 bg-white">
      {parties.map((p) => (
        <Link key={p.id} href={`/parties/${p.slug}`} className="block">
          <article className="flex items-center gap-4 px-4 py-3 hover:bg-black/[.03]">
            <LogoBox src={p.logo ?? undefined} alt={`${p.name} logo`} name={p.name} abbr={p.abbr} />
            <div className="min-w-0 flex-1">
              <h2 className="truncate text-sm font-medium">{p.name || '—'}</h2>
              <p className="truncate text-xs text-black/60">
                {[p.abbr, p.status].filter(Boolean).join(' • ') || '—'}
              </p>
            </div>
            {p.founded ? <span className="whitespace-nowrap text-xs text-black/60">Founded {p.founded}</span> : null}
          </article>
        </Link>
      ))}
    </section>
  );
}

function LogoBox({
  src,
  alt,
  name,
  abbr,
}: { src?: string; alt: string; name?: string; abbr?: string }) {
  if (!src) {
    return (
      <div className="flex h-8 w-8 items-center justify-center rounded bg-black/5 text-[10px] font-semibold">
        {initials(name, abbr)}
      </div>
    );
  }
  return (
    <div className="h-8 w-8 overflow-hidden rounded bg-black/5">
      <Image src={src} alt={alt} width={64} height={64} className="h-full w-full object-cover" />
    </div>
  );
}

function initials(name?: string, abbr?: string) {
  const s = (abbr || name || '').trim();
  if (!s) return '—';
  const parts = s.split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]).join('').toUpperCase();
}
