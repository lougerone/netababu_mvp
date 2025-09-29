"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type Hit =
  | { type: "politician"; name: string; slug: string }
  | { type: "party"; name: string; slug: string };

type ApiResponse = {
  results: Hit[];
  counts: { politicians: number; parties: number };
};

const LABEL: Record<Hit["type"], string> = {
  politician: "Politician",
  party: "Party",
};

export default function SearchBar({ className = "" }: { className?: string }) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<Hit[]>([]);
  const [highlight, setHighlight] = useState(0);

  const router = useRouter();
  const boxRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Debounced fetch
  useEffect(() => {
    if (!q.trim()) {
      setItems([]);
      setOpen(false);
      return;
    }

    setLoading(true);
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`, {
          signal: ctrl.signal,
        });
        const data: ApiResponse = await res.json();
        setItems(data.results.slice(0, 8));
        setOpen(true);
        setHighlight(0);
      } catch (e) {
        if ((e as any).name !== "AbortError") console.error(e);
      } finally {
        setLoading(false);
      }
    }, 180);

    return () => clearTimeout(t);
  }, [q]);

  // Close on outside click
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!boxRef.current) return;
      if (!boxRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  function goto(hit: Hit) {
    setOpen(false);
    if (hit.type === "politician") router.push(`/politicians/${hit.slug}`);
    else if (hit.type === "party") router.push(`/parties/${hit.slug}`);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open || items.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => Math.min(h + 1, items.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const target = items[highlight];
      if (target) goto(target);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div ref={boxRef} className={`relative ${className}`}>
      <div className="flex items-center gap-2 rounded-2xl border border-neutral-300 bg-white px-3 py-2 shadow-sm focus-within:ring-2 focus-within:ring-indigo-500">
        <svg width="18" height="18" viewBox="0 0 24 24" className="opacity-60">
          <path
            fill="currentColor"
            d="M10 2a8 8 0 0 1 6.32 12.9l5.39 5.39l-1.41 1.41l-5.39-5.39A8 8 0 1 1 10 2m0 2a6 6 0 1 0 .001 12.001A6 6 0 0 0 10 4"
          />
        </svg>
        <input
          ref={inputRef}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => q && setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder="Search netas or parties"
          className="w-full bg-transparent outline-none text-[15px]"
          aria-autocomplete="list"
          aria-expanded={open}
          aria-controls="nb-search-list"
        />
        {loading ? <span className="text-xs opacity-60">…</span> : null}
      </div>

      {open && items.length > 0 && (
        <ul
          id="nb-search-list"
          role="listbox"
          className="absolute z-50 mt-2 max-h-96 w-full overflow-auto rounded-2xl border border-neutral-200 bg-white shadow-xl"
        >
          {items.map((it, i) => (
            <li
              key={`${it.type}:${it.slug}`}
              role="option"
              aria-selected={highlight === i}
              onMouseEnter={() => setHighlight(i)}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => goto(it)}
              className={`cursor-pointer px-3 py-2 ${
                highlight === i ? "bg-neutral-100" : "bg-white"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-[11px] uppercase tracking-wide rounded-md border px-1.5 py-0.5 text-neutral-700 bg-neutral-50">
                  {LABEL[it.type]}
                </span>
                <span className="font-medium">{it.name}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
