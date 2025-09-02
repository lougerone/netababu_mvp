// app/(site)/politicians/[slug]/page.tsx
import Image from 'next/image';
import { notFound } from 'next/navigation';
import type { Politician } from '@/lib/airtable';
import { getPolitician } from '@/lib/airtable';
import ShareSheet from '@/components/ShareSheet';

// Render at request time so we don't fail builds if Airtable is down.
export const dynamic = 'force-dynamic';

export default async function PoliticianPage({
  params,
}: { params: { slug: string } }) {
  const p = await getPolitician(params.slug);
  if (!p) return notFound();

  // p already conforms to Politician from airtable.ts
  const politician: Politician = p;

  /* ---------------------------- Null-safe helpers --------------------------- */
  const toUndef = <T,>(v: T | null | undefined): T | undefined =>
    v == null ? undefined : v;

  const fmtPct = (v: string | number | null | undefined) => {
    const x = toUndef(v);
    if (x === undefined) return undefined;
    const s = String(x).trim();
    return s === '' ? undefined : s.replace('%', '');
  };

  const fmtStrNum = (v: string | number | null | undefined) => {
    const x = toUndef(v);
    if (x === undefined) return undefined;
    const s = String(x).trim();
    return s === '' ? undefined : s;
  };

  /* ----------------------- Build shareable stats safely ---------------------- */
  const attendance = fmtPct(politician.attendance);                 // string | undefined
  const assets = fmtStrNum(politician.assets);                      // string | undefined
  const liabilities = fmtStrNum(politician.liabilities);            // string | undefined
  const criminalCases =
    typeof politician.criminalCases === 'number'
      ? String(politician.criminalCases)
      : undefined;
  const age =
    typeof politician.age === 'number' ? String(politician.age) : undefined;
  // Optional: only if this field exists in your mapping
  const electionsWon =
    typeof (politician as any).electionsWon === 'number'
      ? String((politician as any).electionsWon)
      : undefined;

  const stats: { key: string; value: string; suffix?: string }[] = [
    ...(attendance ? [{ key: 'Attendance', value: attendance, suffix: '%' }] : []),
    ...(assets ? [{ key: 'Assets', value: assets }] : []),
    ...(liabilities ? [{ key: 'Liabilities', value: liabilities }] : []),
    ...(criminalCases ? [{ key: 'Criminal Cases', value: criminalCases }] : []),
    ...(age ? [{ key: 'Age', value: age, suffix: ' yrs' }] : []),
    ...(electionsWon ? [{ key: 'Won Elections', value: electionsWon }] : []),
  ];

  return (
    <main className="mx-auto max-w-3xl p-6 space-y-8">
      <header className="flex items-start gap-4">
        <div className="w-24 h-24 rounded-lg overflow-hidden bg-black/10 flex-shrink-0">
          {politician.photo ? (
            <Image
              src={politician.photo} // string | undefined is fine here
              alt={politician.name}
              width={96}
              height={96}
              className="object-cover w-full h-full"
            />
          ) : null}
        </div>

        <div className="min-w-0">
          <h1 className="text-2xl font-semibold truncate">{politician.name}</h1>

          {/* Use the correct field name from your Airtable mapping */}
          {politician.current_position && (
            <p className="text-sm text-black/60 truncate">
              {politician.current_position}
            </p>
          )}

          <p className="text-sm text-black/60 truncate">
            Party: {politician.party}
            {politician.state ? ` • ${politician.state}` : ''}
            {politician.constituency ? ` • ${politician.constituency}` : ''}
          </p>

          {politician.dob && (
            <p className="text-sm text-black/60">DOB: {politician.dob}</p>
          )}
        </div>
      </header>

      <section className="grid grid-cols-2 gap-4 text-sm">
        {politician.age !== undefined && (
          <div><span className="font-medium">Age:</span> {politician.age}</div>
        )}
        {(politician as any).yearsInPolitics !== undefined && (
          <div><span className="font-medium">Years in politics:</span> {(politician as any).yearsInPolitics}</div>
        )}
        {politician.attendance != null && String(politician.attendance) !== '' && (
          <div><span className="font-medium">Parliament attendance:</span> {politician.attendance}</div>
        )}
        {politician.assets != null && String(politician.assets) !== '' && (
          <div><span className="font-medium">Declared assets:</span> {politician.assets}</div>
        )}
        {politician.liabilities != null && String(politician.liabilities) !== '' && (
          <div><span className="font-medium">Declared liabilities:</span> {politician.liabilities}</div>
        )}
        {politician.criminalCases !== undefined && (
          <div><span className="font-medium">Criminal cases:</span> {politician.criminalCases}</div>
        )}
      </section>

      {/* Share a stat (only if we have at least one) */}
      {stats.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Share a stat</h2>
          <ShareSheet
            slug={politician.slug}
            name={politician.name}
            party={politician.party}
            state={politician.state}
            photo={politician.photo}
            stats={stats}
          />
        </section>
      )}

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
                <a
                  href={link}
                  target="_blank"
                  rel="noreferrer"
                  className="underline break-all"
                >
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
          <a
            href={politician.website}
            target="_blank"
            rel="noreferrer"
            className="underline break-all"
          >
            {politician.website}
          </a>
        </section>
      )}
    </main>
  );
}
