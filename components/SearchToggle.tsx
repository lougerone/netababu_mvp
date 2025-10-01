"use client";

import { useEffect, useRef, useState } from "react";
import SearchBar from "./SearchBar";

export default function SearchToggle() {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!open) return;
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        btnRef.current &&
        !btnRef.current.contains(e.target as Node)
      ) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Search"
        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-black/10 bg-white hover:bg-black/5"
      >
        <svg width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="M10 2a8 8 0 0 1 6.32 12.9l5.39 5.39l-1.41 1.41l-5.39-5.39A8 8 0 1 1 10 2m0 2a6 6 0 1 0 .001 12.001A6 6 0 0 0 10 4"/></svg>
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] bg-black/20 backdrop-blur-[2px]">
          <div
            ref={panelRef}
            className="absolute right-4 top-3 w-[min(680px,calc(100vw-2rem))] rounded-2xl border border-neutral-200 bg-white p-3 shadow-2xl"
          >
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <SearchBar placeholder="Search netas or parties" />
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="ml-2 h-8 w-8 rounded-full border border-neutral-300 text-neutral-700 hover:bg-neutral-50"
              >✕</button>
            </div>
            <p className="mt-2 text-xs text-neutral-500">
              Tip: ↑/↓ to navigate, Enter to open, Esc to close.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
