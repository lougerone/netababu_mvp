// app/(site)/politicians/[slug]/page.tsx

import Image from 'next/image';
import { notFound } from 'next/navigation';
import type { Politician } from '@/lib/airtable';
import { getPolitician } from '@/lib/airtable';

/**
 * Render this page at request time rather than during the build.
 * This avoids build failures if Airtable is unreachable.
 */
export const dynamic = 'force-dynamic';

/**
 * Extend the base Politician type with any additional
 * fields we expect to display. All of these are optional,
 * so TypeScript won’t complain if they’re undefined.
 */
interface FullPolitician extends Politician {
  position?: string;
  party?: string;
  constituency?: string;
  age?: number;
  yearsInPolitics?: number;
  attendance?: string;
  assets?: string;
  liabilities?: string;
  criminalCases?: number;
  website?: string;
}

export default async function PoliticianPage({
  params,
}: {
  params: { slug: string };
}) {
  // Fetch by slug or record ID; returns null if not found
  const p = await getPolitician(params.slug);

  if (!p) {
    // Show a 404 page if no record is returned
    notFound();
  }

  // Cast to the extended interface so we can access extra fields
  const politician = p as FullPolitician;

  return (
    <main className="mx-auto max-w-3xl p-6 space-y-6">
      {/* Hero section with photo and basic info */}
      <header className="flex items-start gap-4">
        {politician.photo?.url ? (
          <Image
            src={politician.photo.url}
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

      {/* Optional stats section */}
      <section className="grid grid-cols-2 gap-4 text-sm">
        {politician.age && (
          <div>
            <span className="font-medium">Age:</span> {politician.age}
          </div>
        )}
        {politician.yearsInPolitics && (
          <div>
            <span className="font-medium">Years in politics:</span>{' '}
            {politician.yearsInPolitics}
          </div>
        )}
        {politician.attendance && (
          <div>
            <span className="font-medium">Parliament attendance:</span>{' '}
            {politician.attendance}
          </div>
        )}
        {politician.assets && (
          <div>
            <span className="font-medium">Declared assets:</span>{' '}
            {politician.assets}
          </div>
        )}
        {politician.liabilities && (
          <div>
            <span className="font-medium">Declared liabilities:</span>{' '}
            {politician.liabilities}
          </div>
        )}
        {politician.criminalCases !== undefined && (
          <div>
            <span className="font-medium">Criminal cases:</span>{' '}
            {politician.criminalCases}
          </div>
        )}
      </section>

      {/* Life events */}
      {politician.life_events && (
        <section>
          <h2 className="text-lg font-semibold mb-2">Key life events</h2>
          <div className="prose prose-sm max-w-none whitespace-pre-line">
            {politician.life_events}
          </div>
        </section>
      )}

      {/* External links list */}
      {politician.links && politician.links.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-2">Links</h2>
          <ul className="list-disc pl-5 space-y-1">
            {politician.links.map((link, i) => (
              <li key={i}>
                <a
                  href={link}
                  target="_blank"
                  rel="noreferrer"
                  className="underline"
                >
                  {link}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Personal website */}
      {politician.website && (
        <section>
          <h2 className="text-lg font-semibold mb-2">Website</h2>
          <a
            href={politician.website}
            target="_blank"
            rel="noreferrer"
            className="underline"
          >
            {politician.website}
          </a>
        </section>
      )}
    </main>
  );
}
