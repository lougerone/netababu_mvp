// app/(site)/politicians/page.tsx
import Link from 'next/link';
import Image from 'next/image';
import type { Politician } from '@/lib/airtable';
import { listPoliticians } from '@/lib/airtable';

export const dynamic = 'force-dynamic';

export default async function PoliticiansPage() {
  try {
    const politicians = await listPoliticians();
    
    return (
      <main className="mx-auto max-w-6xl p-6">
        <header className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Politicians</h1>
          <p className="text-black/60">
            Browse profiles of politicians and their key information
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {politicians.map((politician) => (
            <Link
              key={politician.slug}
              href={`/politicians/${politician.slug}`}
              className="block p-4 border border-black/10 rounded-lg hover:border-black/20 transition-colors"
            >
              <div className="flex items-start gap-3">
                {politician.photo ? (
                  <Image
                    src={politician.photo}
                    alt={politician.name}
                    width={60}
                    height={60}
                    className="rounded-lg object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-15 h-15 rounded-lg bg-black/10 flex-shrink-0" />
                )}
                <div className="min-w-0 flex-1">
                  <h2 className="font-semibold text-lg truncate">
                    {politician.name}
                  </h2>
                  {politician.position && (
                    <p className="text-sm text-black/60 truncate">
                      {politician.position}
                    </p>
                  )}
                  <p className="text-sm text-black/60">
                    {politician.party}
                  </p>
                  {politician.constituency && (
                    <p className="text-xs text-black/50 truncate">
                      {politician.constituency}
                    </p>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {politicians.length === 0 && (
          <div className="text-center py-12">
            <p className="text-black/60">No politicians found.</p>
          </div>
        )}
      </main>
    );
  } catch (error) {
    console.error('Error loading politicians:', error);
    return (
      <main className="mx-auto max-w-3xl p-6">
        <h1 className="text-2xl font-bold mb-4">Politicians</h1>
        <p className="text-red-600">
          Unable to load politicians data. Please try again later.
        </p>
      </main>
    );
  }
}
