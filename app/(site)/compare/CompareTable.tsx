'use client';

import { useMemo, useState } from 'react';
import AvatarSquare from '@/components/AvatarSquare';
import type { Politician } from '@/lib/airtable';

/* ---------------- Locked & Optional columns ---------------- */
const LOCKED = [
  { key: 'photo', label: 'Photo' },
  { key: 'name', label: 'Name' },
  { key: 'party', label: 'Party' },
  { key: 'constituency', label: 'Constituency' },
  { key: 'current_position', label: 'Current Position' },
] as const;

const OPTIONAL: { key: keyof Politician; label: string }[] = [
  { key: 'state', label: 'State' },
  { key: 'dob', label: 'Date of Birth' },
  { key: 'age', label: 'Age' },
  { key: 'yearsInPolitics', label: 'Years in Politics' },
  { key: 'attendance', label: 'Parliament Attendance' },
  { key: 'assets', label: 'Declared Assets' },
  { key: 'liabilities', label: 'Declared Liabilities' },
  { key: 'criminalCases', label: 'Criminal Cases' },
  { key: 'website', label: 'Website' },
];

function renderCell(field: string, p?: Politician) {
  if (!p) return '—';

  if (field === 'photo') {
    return <AvatarSquare src={p.photo ?? null} alt={p.name} size={48} rounded="lg" />;
  }
  if (field === 'name') {
    return <span className="font-medium">{p.name || '—'}</span>;
  }
  if (field === 'website' && p.website) {
    return (
      <a href={p.website} target="_blank" rel="noopener noreferrer" className="underline text-saffron-700">
        {p.website.replace(/^https?:\/\//, '')}
      </a>
    );
  }

  const val = (p as any)[field];
  if (Array.isArray(val)) return val.join(', ') || '—';
  return val ?? '—';
}

export default function CompareTable({ politicians }: { politicians: Politician[] }) {
  const sorted = useMemo(() => [...politicians].sort((a, b) => a.name.localeCompare(b.name)), [politicians]);

  const [aId, setAId] = useState<string | undefined>(sorted[0]?.id);
  const [bId, setBId] = useState<string | undefined>(sorted[1]?.id);
  const [enabled, setEnabled] = useState<Set<keyof Politician>>(new Set());

  const A = sorted.find((p) => p.id === aId);
  const B = sorted.find((p) => p.id === bId);

  const toggle = (k: keyof Politician) => {
    setEnabled((prev) => {
      const next = new Set(prev);
      next.has(k) ? next.delete(k) : next.add(k);
      return next;
    });
  };

  const activeOptional = OPTIONAL.filter((c) => enabled.has(c.key));

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="card p-4">
        <div className="grid md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-sm mb-1">Select A</label>
            <select className="input-pill w-full" value={aId ?? ''} onChange={(e) => setAId(e.target.value)}>
              {sorted.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — {p.party}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1">Select B</label>
            <select className="input-pill w-full" value={bId ?? ''} onChange={(e) => setBId(e.target.value)}>
              {sorted.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — {p.party}
                </option>
              ))}
            </select>
          </div>
          <div>
            <div className="text-sm mb-2">Add datapoints</div>
            <div className="flex flex-wrap gap-2">
              {OPTIONAL.map((c) => (
                <label
                  key={c.key}
                  className={`px-2 py-1 rounded-md border cursor-pointer text-sm ${
                    enabled.has(c.key) ? 'bg-cream-300 border-ink-700/20' : 'bg-white/40 border-black/10'
                  }`}
                >
                  <input
                    type="checkbox"
                    className="mr-1"
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

      {/* Comparison table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-ink-600/80">
              <th className="w-[200px] py-2 pr-4">Metric</th>
              <th className="py-2 pr-4">A</th>
              <th className="py-2 pr-4">B</th>
            </tr>
          </thead>
          <tbody className="[&_tr]:border-t [&_tr]:border-black/10">
            {LOCKED.map((c) => (
              <tr key={c.key}>
                <td className="py-3 pr-4 font-medium">{c.label}</td>
                <td className="py-3 pr-4">{renderCell(c.key, A)}</td>
                <td className="py-3 pr-4">{renderCell(c.key, B)}</td>
              </tr>
            ))}
            {activeOptional.map((c) => (
              <tr key={c.key}>
                <td className="py-3 pr-4">{c.label}</td>
                <td className="py-3 pr-4">{renderCell(c.key, A)}</td>
                <td className="py-3 pr-4">{renderCell(c.key, B)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
