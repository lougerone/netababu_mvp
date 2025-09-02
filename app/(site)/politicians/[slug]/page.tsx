// app/(site)/politicians/[slug]/page.tsx
import Image from 'next/image';
import { notFound } from 'next/navigation';
import type { Politician } from '@/lib/airtable';
import { getPolitician } from '@/lib/airtable';
import ShareSheet from '@/components/ShareSheet';

export const dynamic = 'force-dynamic';

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full bg-purple-100 text-purple-700 px-2 py-0.5 text-[11px] font-medium">
      {children}
    </span>
  );
}
function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full bg-black/10 text-ink-700 px-2 py-0.5 text-[11px]">
      {children}
    </span>
  );
}

export default async function PoliticianPage({ params }: { params: { slug: string } }) {
  const p = await getPolitician(params.slug);
  if (!p) return notFound();

  const politician: Politician & { twitter?: string | null; createdAt?: string | null } = p;

  /* ----------------------------- Format helpers ---------------------------- */
  const toUndef = <T,>(v: T | null | undefined): T | undefined =>
    v == null ? undefined : v;

  const toNumber = (v: string | number | null | undefined): number | undefined => {
    const x = toUndef(v);
    if (x === undefined) return undefined;
    if (typeof x === 'number') return isFinite(x) ? x : undefined;
    const cleaned = String(x).replace(/[₹,\s]/g, '');
    const n = parseFloat(cleaned);
    return isFinite(n) ? n : undefined;
  };

  const formatINR = (v: string | number | null | undefined) => {
    const n = toNumber(v);
    if (n === undefined) return toUndef(v) ? String(v) : '';
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
  };

  const formatINRShort = (v: string | number | null | undefined) => {
    const n = toNumber(v);
    if (n === undefined) return toUndef(v) ? String(v) : '';
    const crore = 1e7, lakh = 1e5;
    if (Math.abs(n) >= crore) return `₹${(n / crore).toFixed(2)} Cr`;
    if (Math.abs(n) >= lakh)  return `₹${(n / lakh).toFixed(2)} Lakh`;
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
  };

  const formatPercent = (v: string | number | null | undefined) => {
    const x = toUndef(v);
    if (x === undefined) return '';
    if (typeof x === 'string' && x.trim().endsWith('%')) return x.trim();
    let n = typeof x === 'number' ? x : parseFloat(String(x));
    if (!isFinite(n)) return String(v ?? '');
    if (n > 0 && n <= 1) n = n * 100;
    return `${Math.round(n)}%`;
  };

  /* ----------------------- Build shareable stats --------------------------- */
  const attendancePct = formatPercent(politician.attendance);
  const assetsShort = formatINRShort(politician.assets);
  const liabilitiesShort = formatINRShort(politician.liabilities);
  const criminalCases = politician.criminalCases != null ? String(politician.criminalCases) : '';
  const age = politician.age != null ? String(politician.age) : '';
  const yearsInPolitics =
    (politician as any).yearsInPolitics != null ? String((politician as any).yearsInPolitics) : '';

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
        <div className="w-24 h-24 rounded-lg overflow-hidden bg-black/10 shrink-0">
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

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold truncate flex-1">{politician.name}</h1>
            {/* Purple state / national pill */}
            <Pill>{politician.state ? politician.state : 'National'}</Pill>
          </div>

          {politician.current_position && (
            <p className="text-sm text-black/60 truncate">{politician.current_position}</p>
          )}

          <div className="mt-1 flex items-center gap-2">
            {politician.party && <Chip>{politician.party}</Chip>}
            {politician.constituency && (
              <span className="text-xs text-black/60 truncate">{politician.constituency}</span>
            )}
          </div>

          <div className="mt-2 space-y-1">
            {politician.website && (
              <p className="text-sm">
                <a className="underline break-all" href={politician.website} target="_blank" rel="noreferrer">
                  {politician.website}
                </a>
              </p>
            )}
            {politician.twitter && (
              <p className="text-sm">
                <a className="underline break-all" href={politician.twitter} target="_blank" rel="noreferrer">
                  {politician.twitter.replace(/^https?:\/\//, '')}
                </a>
              </p>
            )}
          </div>
        </div>
      </header>

      {/* Stats grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
        {age && <div><span className="font-medium">Age:</span> {age}</div>}
        {yearsInPolitics && <div><span className="font-medium">Years in politics:</span> {yearsInPolitics}</div>}
        {attendancePct && <div><span className="font-medium">Parliament attendance:</span> {attendancePct}</div>}

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

        {criminalCases && <div><span className="font-medium">Criminal cases:</span> {criminalCases}</div>}
      </section>

      {/* Optional: created/updated */}
      {politician.createdAt && (
        <p className="text-xs text-black/50">Created: {politician.createdAt}</p>
      )}
      {(politician as any).last_updated && (
        <p className="text-xs text-black/50">Last updated: {(politician as any).last_updated}</p>
      )}

      {/* Share streamlined, bottom */}
      {stats.length > 0 && (
        <section className="pt-4 border-t border-black/10">
          <h2 className="text-base font-semibold mb-2">Share a stat</h2>
          <ShareSheet
            slug={politician.slug}
            name={politician.name}
            party={politician.party}
            photo={politician.photo}
            stats={stats}
            only={['x', 'whatsapp']}
          />
        </section>
      )}
    </main>
  );
}
