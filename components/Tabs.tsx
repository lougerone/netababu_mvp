'use client';
import { useState } from 'react';

export default function Tabs({ tabs }: { tabs: { key: string; label: string; content: React.ReactNode }[] }) {
  const [active, setActive] = useState(tabs[0]?.key ?? '');
  const current = tabs.find(t => t.key === active);
  return (
    <div>
      <div className="flex gap-2 mb-3">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setActive(t.key)} className={`px-3 py-1 rounded-md border ${active === t.key ? 'bg-white/10 border-white/20' : 'border-white/10'}`}>
            {t.label}
          </button>
        ))}
      </div>
      <div className="card p-4">{current?.content}</div>
    </div>
  );
}
