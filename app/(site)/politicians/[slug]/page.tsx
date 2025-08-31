// app/(site)/politicians/[slug]/page.tsx
import Image from 'next/image';
import { notFound } from 'next/navigation';
import type { Politician } from '@/lib/airtable';
import { getPolitician } from '@/lib/airtable';

function parseList(value: any): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    // Handle comma-separated values or newline-separated values
    return value.split(/[,\n]/).map(item => item.trim()).filter(Boolean);
  }
  return [];
}

// Render at request time so we don't fail builds if Airtable is down.
export const dynamic = 'force-dynamic';

export default async function PoliticianPage({
  params,
}: { params: { slug: string } }) {
  const p = await getPolitician(params.slug);
  if (!p) return notFound();

  // p already conforms to Politician from airtable.ts
  const politician: Politician = p;

  return (
    <main className="mx-auto max-w-3xl p-6 space-y-6">
      <header className="flex items-start gap-4">
        {politician.photo ? (
          <Image
            src={politician.photo}               // <-- photo is string | undefined
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
          <p className="text-sm text-black/60">Party: {politician.party}</p>
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

      <section className="grid grid-cols-2 gap-4 text-sm">
        {politician.age !== undefined && (
          <div><span className="font-medium">Age:</span> {politician.age}</div>
        )}
        {politician.yearsInPolitics !== undefined && (
          <div><span className="font-medium">Years in politics:</span> {politician.yearsInPolitics}</div>
        )}
        {politician.attendance && (
          <div><span className="font-medium">Parliament attendance:</span> {politician.attendance}</div>
        )}
        {politician.assets && (
          <div><span className="font-medium">Declared assets:</span> {politician.assets}</div>
        )}
        {politician.liabilities && (
          <div><span className="font-medium">Declared liabilities:</span> {politician.liabilities}</div>
        )}
        {politician.criminalCases !== undefined && (
          <div><span className="font-medium">Criminal cases:</span> {politician.criminalCases}</div>
        )}
      </section>

      {politician.life_events && (
        <section>
          <h2 className="text-lg font-semibold mb-2">Key life events</h2>
          <div className="prose prose-sm max-w-none whitespace-pre-line">
            {politician.life_events}
          </div>
        </section>
      )}

      {politician.links && politician.links.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-2">Links</h2>
          <ul className="list-disc pl-5 space-y-1">
            {politician.links.map((link, i) => (
              <li key={i}>
                <a href={link} target="_blank" rel="noreferrer" className="underline">
                  {link}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      {politician.website && (
        <section>
          <h2 className="text-lg font-semibold mb-2">Website</h2>
          <a href={politician.website} target="_blank" rel="noreferrer" className="underline">
            {politician.website}
          </a>
        </section>
      )}
    </main>
  );
}
