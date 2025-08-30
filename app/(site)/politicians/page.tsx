// app/(site)/politicians/[slug]/page.tsx

import Image from 'next/image';
import { notFound } from 'next/navigation';
import type { Politician } from '@/lib/airtable';
import { getPolitician } from '@/lib/airtable';

export const dynamic = 'force-dynamic';

export default async function PoliticianPage({
  params,
}: {
  params: { slug: string };
}) {
  const p = await getPolitician(params.slug);
  if (!p) notFound();

  // no need to cast; `p` is already a Politician
  const politician: Politician = p;

  return (
    <main className="mx-auto max-w-3xl p-6 space-y-6">
      <header className="flex items-start gap-4">
        {politician.photo ? (
          <Image
            src={politician.photo} // photo is a string URL now
            alt={politician.name}
            width={96}
            height={96}
            className="rounded-lg object-cover"
          />
        ) : (
          <div className="w-24 h-24 rounded-lg bg-black/10" />
        )}
        <div>
          <h1 className="text-2xl font-semibold">{politician.name}</h1>
          {politician.position && (
            <p className="text-sm text-black/60">{politician.position}</p>
          )}
          {/* party is now guaranteed to be a string, but you can still show it conditionally */}
          {politician.party && (
            <p className="text-sm text-black/60">Party: {politician.party}</p>
          )}
          {politician.constituency && (
            <p className="text-sm text-black/60">
              Constituency: {politician.constituency}
            </p>
          )}
          {politician.dob && (
            <p className="text-sm text-black/60">DOB: {politician.dob}</p>
          )}
        </div>
      </header>
      {/* rest of the component remains unchanged */}
    </main>
  );
}
