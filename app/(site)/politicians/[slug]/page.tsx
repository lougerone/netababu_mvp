// app/(site)/politicians/[slug]/page.tsx

import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getPolitician } from '@/lib/airtable';

/**
 * We set the page to render at request time rather than during the build,
 * so you don’t get build failures when Airtable is unreachable.
 */
export const dynamic = 'force-dynamic';

/**
 * PoliticianPage – displays information about a single politician.
 */
export default async function PoliticianPage({
  params,
}: {
  params: { slug: string };
}) {
  // Attempt to fetch the politician by slug; falls back to record ID if needed.
  const p = await getPolitician(params.slug);

  // If no record is found, show the Next.js 404 page.
  if (!p) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-3xl p-6 space-y-6">
      {/* Hero section with photo and basic info */}
      <header className="flex items-start gap-4">
        {p.photo?.url ? (
          <Image
            src={p.photo.url}
            alt={p.name}
            width={96}
            height={96}
            className="rounded-lg object-cover"
          />
        ) : (
          <div className="w-24 h-24 rounded-lg bg-black/10" />
        )}
        <div>
          <h1 className="text-2xl font-semibold">{p.name}</h1>
          {p.Position && (
            <p className="text-sm text-black/60">{p.Position}</p>
          )}
          {p.party && (
            <p className="text-sm text-black/60">Party: {p.party}</p>
          )}
          {p.constituency && (
            <p className="text-sm text-black/60">
              Constituency: {p.constituency}
            </p>
          )}
          {p.dob && (
            <p className="text-sm text-black/60">DOB: {p.dob}</p>
          )}
        </div>
      </header>

      {/* Optional stats section */}
      <section className="grid grid-cols-2 gap-4 text-sm">
        {p.age && (
          <div>
            <span className="font-medium">Age:</span> {p.age}
          </div>
        )}
        {p.yearsInPolitics && (
          <div>
            <span className="font-medium">Years in politics:</span>{' '}
            {p.yearsInPolitics}
          </div>
        )}
        {p.attendance && (
          <div>
            <span className="font-medium">Parliament attendance:</span>{' '}
            {p.attendance}
          </div>
        )}
        {p.assets && (
          <div>
            <span className="font-medium">Declared assets:</span>{' '}
            {p.assets}
          </div>
        )}
        {p.liabilities && (
          <div>
            <span className="font-medium">Declared liabilities:</span>{' '}
            {p.liabilities}
          </div>
        )}
        {p.criminalCases && (
          <div>
            <span className="font-medium">Criminal cases:</span>{' '}
            {p.criminalCases}
          </div>
        )}
      </section>

      {/* Life events, if any */}
      {p.life_events && (
        <section>
          <h2 className="text-lg font-semibold mb-2">Key life events</h2>
          <div className="prose prose-sm max-w-none whitespace-pre-line">
            {p.life_events}
          </div>
        </section>
      )}

      {/* External links */}
      {!!p.links?.length && (
        <section>
          <h2 className="text-lg font-semibold mb-2">Links</h2>
          <ul className="list-disc pl-5 space-y-1">
            {p.links.map((link, i) => (
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

      {/* Personal website, if available */}
      {p.website && (
        <section>
          <h2 className="text-lg font-semibold mb-2">Website</h2>
          <a
            href={p.website}
            target="_blank"
            rel="noreferrer"
            className="underline"
          >
            {p.website}
          </a>
        </section>
      )}
    </main>
  );
}
