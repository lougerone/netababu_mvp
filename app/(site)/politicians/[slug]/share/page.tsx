/* app/p/[slug]/share/page.tsx */
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

type Props = {
  params: { slug: string };
  searchParams: {
    name?: string;
    party?: string;
    state?: string;
    statKey?: string;
    statValue?: string;
    statSuffix?: string;
    photo?: string;
  };
};

export function generateMetadata({ params, searchParams }: Props): Metadata {
  const { slug } = params;
  if (!slug) notFound();

  const title =
    `${searchParams.statKey || 'Stat'} — ${searchParams.name || 'Politician'} | Netababu`;

  const ogUrl = new URL(
    `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.netababu.com'}/og/politician/${slug}`
  );

  // Forward all query params to image route
  Object.entries(searchParams).forEach(([k, v]) => {
    if (v) ogUrl.searchParams.set(k, String(v));
  });

  return {
    title,
    openGraph: {
      title,
      type: 'website',
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/p/${slug}/share`,
      images: [{ url: ogUrl.toString(), width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      images: [ogUrl.toString()],
    },
  };
}

export default function SharePage({ searchParams }: Props) {
  // Optional: Render a minimal preview (platforms will scrape meta anyway)
  return (
    <main className="container max-w-3xl mx-auto py-10">
      <h1 className="text-2xl font-semibold">Share ready ✅</h1>
      <p className="opacity-70">You can share this link anywhere. Platforms will show the image.</p>
      <pre className="mt-6 rounded-lg bg-black/5 p-4 text-sm overflow-x-auto">
        {JSON.stringify(searchParams, null, 2)}
      </pre>
    </main>
  );
}
