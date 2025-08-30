'use client';
import { useState } from 'react';

type Props = {
  value?: string;
  onChange?: (v: string) => void;
  placeholder?: string;
};

export default function SearchBar({ value, onChange, placeholder = 'Search politicians, parties…' }: Props) {
  const [local, setLocal] = useState(value ?? '');

  const update = (v: string) => {
    setLocal(v);
    onChange?.(v);
  };

  return (
    <div className="flex gap-2">
      <input
        className="w-full rounded-lg bg-white/5 border border-white/10 p-3 outline-none"
        placeholder={placeholder}
        value={local}
        onChange={e => update(e.target.value)}
      />
      <button className="rounded-lg px-4 bg-brand-500/80 hover:bg-brand-500">Search</button>
    </div>
  );
}
