// app/(site)/politicians/[slug]/share/page.tsx
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

type Props = {
  params: { slug: string };
  searchParams: {
    name?: string;
    party?: string;
    statKey?: string;
    statValue?: string;
    statSuffix?: string;
    photo?: string;
  };
};

export function generateMetadata({ params, searchParams }: Props): Metadata {
  const { slug } = params;
  if (!slug) notFound();

  const title = `${searchParams.statKey || 'Stat'} — ${searchParams.name || 'Politician'} | Netababu`;

  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.netababu.com';
  const og = new URL(`${base}/og/politicians/${slug}`);

  // Only forward the allowed fields (no state, no extras)
  if (searchParams.name) og.searchParams.set('name', searchParams.name);
  if (searchParams.party) og.searchParams.set('party', searchParams.party);
  if (searchParams.photo) og.searchParams.set('photo', searchParams.photo);
  if (searchParams.statKey) og.searchParams.set('statKey', searchParams.statKey);
  if (searchParams.statValue) og.searchParams.set('statValue', searchParams.statValue);
  if (searchParams.statSuffix) og.searchParams.set('statSuffix', searchParams.statSuffix);

  const pageUrl = `${base}/politicians/${slug}/share`;

  return {
    title,
    openGraph: {
      title,
      type: 'website',
      url: pageUrl,
      images: [{ url: og.toString(), width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      images: [og.toString()],
    },
  };
}

export default function SharePage({ searchParams }: Props) {
  // Optional tiny preview for humans (platforms use metadata)
  return (
    <main className="mx-auto max-w-3xl p-10">
      <h1 className="text-xl font-semibold mb-2">Share ready ✅</h1>
      <p className="text-black/60">This link renders a social image for your selection.</p>
      <pre className="mt-6 rounded-lg bg-black/5 p-4 text-sm overflow-x-auto">
        {JSON.stringify(searchParams, null, 2)}
      </pre>
    </main>
  );
}
