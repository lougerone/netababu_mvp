// app/(site)/politicians/[slug]/page.tsx
import Image from 'next/image';
import { notFound } from 'next/navigation';
import type { Politician } from '@/lib/airtable';
import { getPolitician } from '@/lib/airtable';
import ShareSheet from '@/components/ShareSheet';

export const dynamic = 'force-dynamic';

export default async function PoliticianPage({
  params,
}: { params: { slug: string } }) {
  const p = await getPolitician(params.slug);
  if (!p) return notFound();

  const politician: Politician = p;

  /* ----------------------------- Format helpers ---------------------------- */
  const toUndef = <T,>(v: T | null | undefined): T | undefined =>
    v == null ? undefined : v;

  const toNumber = (v: string | number | null | undefined): number | undefined => {
    const x = toUndef(v);
    if (x === undefined) return undefined;
    if (typeof x === 'number') return isFinite(x) ? x : undefined;
    const cleaned = x.replace(/[₹,\s]/g, '');
    const n = parseFloat(cleaned);
    return isFinite(n) ? n : undefined;
  };

  // Full INR with Indian grouping (₹2,25,95,410)
  const formatINR = (v: string | number | null | undefined) => {
    const n = toNumber(v);
    if (n === undefined) return toUndef(v) ? String(v) : '';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(n);
  };

  // Compact INR (Cr/Lakh) for tight spaces / share images
  const formatINRShort = (v: string | number | null | undefined) => {
    const n = toNumber(v);
    if (n === undefined) return toUndef(v) ? String(v) : '';
    const crore = 1e7;
    const lakh = 1e5;
    if (Math.abs(n) >= crore) return `₹${(n / crore).toFixed(2)} Cr`;
    if (Math.abs(n) >= lakh) return `₹${(n / lakh).toFixed(2)} Lakh`;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(n);
  };

  // Attendance: "0.83" -> "83%", "83" -> "83%", "92%" -> "92%"
  const formatPercent = (v: string | number | null | undefined) => {
    const x = toUndef(v);
    if (x === undefined) return '';
    if (typeof x === 'string' && x.trim().endsWith('%')) return x.trim();
    let n = typeof x === 'number' ? x : parseFloat(String(x));
    if (!isFinite(n)) return String(v);
    if (n > 0 && n <= 1) n = n * 100;
    return `${Math.round(n)}%`;
  };

  const fmtStr = (v: string | number | null | undefined) => {
    const x = toUndef(v);
    if (x === undefined) return '';
    const s = String(x).trim();
    return s === '' ? '' : s;
  };

  /* ----------------------- Build shareable stats (ONLY CSV FIELDS) --------- */
  const attendancePct = formatPercent(politician.attendance);
  const assetsShort = formatINRShort(politician.assets);
  const liabilitiesShort = formatINRShort(politician.liabilities);
  const criminalCases =
    typeof politician.criminalCases === 'number' ? String(politician.criminalCases) : '';
  const age = typeof politician.age === 'number' ? String(politician.age) : '';
  const yearsInPolitics =
    typeof (politician as any).yearsInPolitics === 'number'
      ? String((politician as any).yearsInPolitics)
      : ''; // will only show if present in your mapping

  const stats: { key: string; value: string; suffix?: string }[] = [
    ...(attendancePct ? [{ key: 'Attendance', value: attendancePct.replace('%', ''), suffix: '%' }] : []),
    ...(assetsShort ? [{ key: 'Assets', value: assetsShort.replace(/^₹/, '') }] : []),
    ...(liabilitiesShort ? [{ key: 'Liabilities', value: liabilitiesShort.replace(/^₹/, '') }] : []),
    ...(criminalCases ? [{ key: 'Criminal Cases', value: criminalCases }] : []),
    ...(age ? [{ key: 'Age', value: age, suffix: ' yrs' }] : []),
    ...(yearsInPolitics ? [{ key: 'Years in Politics', value: yearsInPolitics }] : []),
  ];

  return (
    <main className="mx-auto max-w-3xl p-6 space-y-8">
      {/* Header */}
      <header className="flex items-start gap-4">
        <div className="w-24 h-24 rounded-lg overflow-hidden bg-black/10 flex-shrink-0">
          {politician.photo ? (
            <Image
              src={politician.photo}
              alt={politician.name}
              width={96}
              height={96}
              className="object-cover w-full h-full"
            />
          ) : null}
        </div>

        <div className="min-w-0">
          <h1 className="text-2xl font-semibold truncate">{politician.name}</h1>

          {politician.current_position && (
            <p className="text-sm text-black/60 truncate">{politician.current_position}</p>
          )}

          <p className="text-sm text-black/60 truncate">
            Party: {politician.party}
            {politician.constituency ? ` • ${politician.constituency}` : ''}
          </p>

          {politician.website && (
            <p className="text-sm">
              <a className="underline break-all" href={politician.website} target="_blank" rel="noreferrer">
                {politician.website}
              </a>
            </p>
          )}
        </div>
      </header>

      {/* Share box as a card */}
      {stats.length > 0 && (
        <section className="bg-white/70 border border-black/10 rounded-xl p-4 shadow-sm">
          <h2 className="text-lg font-semibold mb-2">Share a stat</h2>
          <ShareSheet
            slug={politician.slug}
            name={politician.name}
            party={politician.party}
            photo={politician.photo}
            // ONLY CSV-backed stats go here
            stats={stats}
          />
        </section>
      )}

      {/* Stats grid (ONLY the CSV fields) */}
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
        {typeof politician.age === 'number' && (
          <div><span className="font-medium">Age:</span> {politician.age}</div>
        )}

        {yearsInPolitics && (
          <div><span className="font-medium">Years in politics:</span> {yearsInPolitics}</div>
        )}

        {attendancePct && (
          <div><span className="font-medium">Parliament attendance:</span> {attendancePct}</div>
        )}

        {politician.assets != null && String(politician.assets) !== '' && (
          <div>
            <span className="font-medium">Declared assets:</span>{' '}
            {formatINR(politician.assets)}{' '}
            <span className="text-black/50">({formatINRShort(politician.assets)})</span>
          </div>
        )}

        {politician.liabilities != null && String(politician.liabilities) !== '' && (
          <div>
            <span className="font-medium">Declared liabilities:</span>{' '}
            {formatINR(politician.liabilities)}{' '}
            <span className="text-black/50">({formatINRShort(politician.liabilities)})</span>
          </div>
        )}

        {typeof politician.criminalCases === 'number' && (
          <div><span className="font-medium">Criminal cases:</span> {politician.criminalCases}</div>
        )}
      </section>

      {/* Optional: last-updated if you persist it from CSV */}
      {(politician as any).last_updated && (
        <p className="text-xs text-black/50">Last updated: {(politician as any).last_updated}</p>
      )}
    </main>
  );
}
