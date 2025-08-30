'use client';
import { useMemo, useState } from 'react';
import { politicians } from '@/lib/data';
import CompareTable from '@/components/CompareTable';

export default function ComparePage() {
  const [a, setA] = useState<string>('');
  const [b, setB] = useState<string>('');

  const list = politicians;
  const pa = useMemo(() => list.find(p => p.slug === a), [a, list]);
  const pb = useMemo(() => list.find(p => p.slug === b), [b, list]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Compare</h1>
      <div className="grid md:grid-cols-3 gap-3 items-end">
        <div>
          <label className="block text-sm mb-1">Politician A</label>
          <select className="w-full bg-white/5 border border-white/10 rounded-lg p-2" value={a} onChange={e => setA(e.target.value)}>
            <option value="">Select…</option>
            {list.map(p => <option key={p.id} value={p.slug}>{p.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm mb-1">Politician B</label>
          <select className="w-full bg-white/5 border border-white/10 rounded-lg p-2" value={b} onChange={e => setB(e.target.value)}>
            <option value="">Select…</option>
            {list.map(p => <option key={p.id} value={p.slug}>{p.name}</option>)}
          </select>
        </div>
        <div>
          <button disabled={!pa || !pb} className="w-full rounded-lg bg-brand-500/80 hover:bg-brand-500 p-2 disabled:opacity-30">Compare</button>
        </div>
      </div>

      <div className="hr my-2" />

      <CompareTable a={pa ?? null} b={pb ?? null} />
    </div>
  );
}
