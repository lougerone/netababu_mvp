// app/compare/page.tsx
import type { Metadata } from 'next';
import CompareTable from '@/components/CompareTable';
import { listPoliticians, type Politician } from '@/lib/airtable';

export const dynamic = 'force-dynamic'; // always fresh
export const runtime = 'edge';          // faster on Vercel Edge

export const metadata: Metadata = {
  title: 'Compare Netas | Netababu',
  description:
    'Head-to-head comparisons of Indian politicians — constituencies, attendance, assets, cases, and more.',
  alternates: { canonical: '/compare' },
  openGraph: {
    title: 'Compare Netas — Netababu',
    description:
      'Run side-by-side comparisons of Indian politicians across key public metrics.',
    url: '/compare',
    type: 'website',
  },
};

export default async function Page() {
  let politicians: Politician[] = [];
  let error: string | null = null;

  try {
    politicians = (await listPoliticians({ limit: 500 })) as Politician[];
  } catch {
    error = 'Failed to load politicians.';
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-6">
      <h1 className="mb-4 text-2xl font-extrabold text-saffron-600 md:text-3xl">
        Compare Netas
      </h1>

      {error ? (
        <p className="text-sm text-ink-600/80">{error} Please try again.</p>
      ) : politicians.length === 0 ? (
        <p className="text-sm text-ink-600/80">No politicians found.</p>
      ) : (
        <CompareTable politicians={politicians} />
      )}
    </main>
  );
}
