// app/(site)/parties/page.tsx
import Link from 'next/link';
import Image from 'next/image';
import { listParties } from '@/lib/airtable'; // should return normalized Party[]

export const dynamic = 'force-dynamic';

type Party = {
  id: string;
  slug: string;
  name: string;
  abbr?: string;
  status?: string;
  founded?: string;
  logo?: string;
};

export default async function PartiesPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const viewParam =
    typeof searchParams?.view === 'string' ? searchParams!.view.toLowerCase() : 'grid';
  const view: 'grid' | 'list' = viewParam === 'list' ? 'list' : 'grid';

  const parties = (await listParties()) as Party[];
  const count = parties.length;

  // Keep any future query params when toggling view
  const baseQuery = new URLSearchParams();
  Object.entries(searchParams ?? {}).forEach(([k, v]) => {
    if (k !== 'view') baseQuery.set(k, String(v));
  });

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Parties</h1>
          <p className="text-sm text-black/60">Showing {count} parties</p>
        </div>

        <div className="inline-flex overflow-hidden rounded-lg border border-black/10">
          <Link
            href={{ pathname: '/parties', query: { ...Object.fromEntries(baseQuery), view: 'grid' } }}
            className={`px-3 py-2 text-sm ${
              view === 'grid' ? 'bg-black/5 font-medium' : 'hover:bg-black/5'
            }`}
          >
            Grid
          </Link>
          <Link
            href={{ pathname: '/parties', query: { ...Object.fromEntries(baseQuery), view: 'list' } }}
            className={`px-3 py-2 text-sm border-l border-black/10 ${
              view === 'list' ? 'bg-black/5 font-medium' : 'hover:bg-black/5'
            }`}
          >
            List
          </Link>
        </div>
      </header>

      {view === 'grid' ? (
        <GridView parties={parties} />
      ) : (
        <ListView parties={parties} />
      )}
    </main>
  );
}

/* ------------------------------- Views -------------------------------- */

function GridView({ parties }: { parties: Party[] }) {
  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {parties.map((p) => (
        <Link
          key={p.id}
          href={`/parties/${p.slug}`}
          className="group rounded-xl border border-black/10 bg-white shadow-sm transition hover:border-black/20 hover:shadow-md"
        >
          <article className="p-4">
            <div className="mb-3 flex items-center gap-3">
              <LogoBox src={p.logo} alt={`${p.name} logo`} />
              <div className="min-w-0">
                <h2 className="truncate text-base font-medium group-hover:underline">{p.name}</h2>
                <p className="truncate text-xs text-black/60">
                  {[p.abbr, p.status].filter(Boolean).join(' • ') || '—'}
                </p>
              </div>
            </div>
            {p.founded ? (
              <p className="text-xs text-black/60">Founded: {p.founded}</p>
            ) : null}
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
            <LogoBox src={p.logo} alt={`${p.name} logo`} />
            <div className="min-w-0 flex-1">
              <h2 className="truncate text-sm font-medium">{p.name}</h2>
              <p className="truncate text-xs text-black/60">
                {[p.abbr, p.status].filter(Boolean).join(' • ') || '—'}
              </p>
            </div>
            {p.founded ? (
              <span className="whitespace-nowrap text-xs text-black/60">Founded {p.founded}</span>
            ) : null}
          </article>
        </Link>
      ))}
    </section>
  );
}

/* ------------------------------ Atoms ---------------------------------- */

function LogoBox({ src, alt }: { src?: string; alt: string }) {
  const fallback = '/party-fallback.svg'; // add a simple silhouette to /public
  return (
    <div className="h-8 w-8 shrink-0 overflow-hidden rounded bg-black/5">
      {src ? (
        <Image
          src={src}
          alt={alt}
          width={64}
          height={64}
          className="h-full w-full object-cover"
          onError={(e) => ((e.currentTarget as HTMLImageElement).src = fallback)}
        />
      ) : (
        <Image src={fallback} alt="" width={64} height={64} className="h-full w-full object-cover" />
      )}
    </div>
  );
}
