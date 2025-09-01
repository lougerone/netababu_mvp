'use client';

import { useMemo, useState } from 'react';
import AvatarSquare from '@/components/AvatarSquare';

// Keep in sync with your lib/airtable Politician type (only what's needed here)
type Politician = {
  id: string;
  slug: string;
  name: string;
  party: string;
  state?: string | null;
  constituency?: string | null;
  current_position?: string | null;
  position?: string | null;            // sometimes mapped from Airtable
  photo?: string | null;
  dob?: string | null;
  age?: number | string | null;
  yearsInPolitics?: number | string | null;
  attendance?: string | null;
  assets?: string | null;
  liabilities?: string | null;
  criminalCases?: number | string | null;
  website?: string | null;
  life_events?: string | null;
  offices?: string[] | undefined;
  links?: string[] | undefined;
};

type Props = {
  politicians: Politician[];
};

/* ---------------------------- Columns registry ---------------------------- */
// Locked (always shown, not toggleable)
const LOCKED_COLS = [
  { key: 'name', label: 'Name' },
  { key: 'photo', label: 'Photo' },
  { key: 'party', label: 'Party' },
  { key: 'constituency', label: 'Constituency' },
  { key: 'current_position', label: 'Current Position' },
] as const;

// Optional (user toggles)
const OPTIONAL_COLS: { key: keyof Politician; label: string }[] = [
  { key: 'state', label: 'State' },
  { key: 'dob', label: 'Date of Birth' },
  { key: 'age', label: 'Age' },
  { key: 'yearsInPolitics', label: 'Years in Politics' },
  { key: 'attendance', label: '% Parliament Attendance' },
  { key: 'assets', label: 'Declared Assets' },
  { key: 'liabilities', label: 'Declared Liabilities' },
  { key: 'criminalCases', label: 'Criminal Cases' },
  { key: 'position', label: 'Position (alt)' },
  { key: 'life_events', label: 'Life Events' },
  { key: 'offices', label: 'Offices' },
  { key: 'website', label: 'Website' },
  { key: 'links', label: 'Links' },
];

function safeText(v: unknown): string {
  if (v == null) return '—';
  if (Array.isArray(v)) return v.length ? v.join(', ') : '—';
  const s = String(v).trim();
  return s ? s : '—';
}

function renderCell(field: keyof Politician, p?: Politician) {
  if (!p) return '—';

  // prefer current_position over position if field is ‘current_position’
  if (field === 'current_position') {
    return safeText(p.current_position ?? p.position);
  }

  // special renderers
  if (field === 'photo') {
    return (
      <div className="flex items-center gap-2">
        <AvatarSquare src={p.photo ?? null} alt={p.name} size={48} rounded="lg" />
      </div>
    );
  }
  if (field === 'name') {
    return (
      <div className="flex items-center gap-2">
        <span className="font-medium">{p.name || '—'}</span>
      </div>
    );
  }
  if (field === 'website' && p.website) {
    return (
      <a
        href={p.website}
        target="_blank"
        rel="noopener noreferrer"
        className="underline text-saffron-700"
      >
        {p.website.replace(/^https?:\/\//, '')}
      </a>
    );
  }
  if (field === 'links' && p.links?.length) {
    return (
      <div className="space-x-2">
        {p.links.slice(0, 4).map((u, i) => (
          <a key={i} href={u} target="_blank" rel="noopener noreferrer" className="underline">
            Link {i + 1}
          </a>
        ))}
      </div>
    );
  }

  return safeText((p as any)[field]);
}

export default function CompareTable({ politicians }: Props) {
  const sorted = useMemo(
    () => [...politicians].sort((a, b) => a.name.localeCompare(b.name)),
    [politicians]
  );

  // pre-select two entries if available
  const [aId, setAId] = useState<string | undefined>(sorted[0]?.id);
  const [bId, setBId] = useState<string | undefined>(sorted[1]?.id);

  // optional columns state: start with a few useful ones
  const [enabled, setEnabled] = useState<Set<keyof Politician>>(
    () => new Set<keyof Politician>(['state', 'age'])
  );

  const A = useMemo(() => sorted.find((p) => p.id === aId), [sorted, aId]);
  const B = useMemo(() => sorted.find((p) => p.id === bId), [sorted, bId]);

  const toggle = (k: keyof Politician) =>
    setEnabled((prev) => {
      const next = new Set(prev);
      next.has(k) ? next.delete(k) : next.add(k);
      return next;
    });

  const optionalActive = OPTIONAL_COLS.filter((c) => enabled.has(c.key));

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="card p-4">
        <div className="grid md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-sm mb-1">Select A</label>
            <select
              className="input-pill w-full"
              value={aId ?? ''}
              onChange={(e) => setAId(e.target.value || undefined)}
            >
              {sorted.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} {p.party ? `— ${p.party}` : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm mb-1">Select B</label>
            <select
              className="input-pill w-full"
              value={bId ?? ''}
              onChange={(e) => setBId(e.target.value || undefined)}
            >
              {sorted.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} {p.party ? `— ${p.party}` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Toggles */}
          <div>
            <div className="text-sm mb-2">Additional datapoints</div>
            <div className="flex flex-wrap gap-2">
              {OPTIONAL_COLS.map((c) => (
                <label
                  key={c.key as string}
                  className={`px-2 py-1 rounded-md border cursor-pointer text-sm ${
                    enabled.has(c.key)
                      ? 'bg-cream-300 border-ink-700/20'
                      : 'bg-white/40 border-black/10'
                  }`}
                >
                  <input
                    type="checkbox"
                    className="mr-1 align-middle"
                    checked={enabled.has(c.key)}
                    onChange={() => toggle(c.key)}
                  />
                  {c.label}
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-ink-600/80">
              <th className="w-[220px] py-2 pr-4">Metric</th>
              <th className="py-2 pr-4">A</th>
              <th className="py-2 pr-4">B</th>
            </tr>
          </thead>
          <tbody className="[&_tr]:border-t [&_tr]:border-black/10">
            {/* Locked rows */}
            {LOCKED_COLS.map((c) => (
              <tr key={`locked-${c.key}`}>
                <td className="py-3 pr-4 font-medium">{c.label}</td>
                <td className="py-3 pr-4">{renderCell(c.key as keyof Politician, A)}</td>
                <td className="py-3 pr-4">{renderCell(c.key as keyof Politician, B)}</td>
              </tr>
            ))}

            {/* Optional rows */}
            {optionalActive.map((c) => (
              <tr key={`opt-${String(c.key)}`}>
                <td className="py-3 pr-4">{c.label}</td>
                <td className="py-3 pr-4">{renderCell(c.key, A)}</td>
                <td className="py-3 pr-4">{renderCell(c.key, B)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Tiny legend */}
      <div className="text-xs text-ink-600/70">— means not available.</div>
    </div>
  );
}
