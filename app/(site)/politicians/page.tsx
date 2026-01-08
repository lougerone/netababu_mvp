// app/(site)/politicians/page.tsx
import { listPoliticians } from '@/lib/supabase';
import PoliticiansExplorer from '@/components/PoliticiansExplorer';
import type { Politician } from '@/components/CardPolitician';

export const dynamic = 'force-dynamic';

export default async function PoliticiansPage() {
  const politicians = (await listPoliticians()) as unknown as Politician[];

  return (
    <main className="mx-auto max-w-6xl p-6">
      <header className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Politicians</h1>
        <p className="text-black/60">Browse, filter, and compare leaders</p>
      </header>

      {(!politicians || politicians.length === 0) ? (
        <div className="text-center py-16 text-black/60">No politicians found.</div>
      ) : (
        <PoliticiansExplorer initial={politicians} />
      )}
    </main>
  );
}
