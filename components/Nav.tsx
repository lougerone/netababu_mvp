'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

type Item = { href: string; label: string; disabled?: boolean };

const items: Item[] = [
  { href: '/', label: 'Home' },
  { href: '/politicians', label: 'Politicians' },
  { href: '/parties', label: 'Parties' },
  { href: '/compare', label: 'Compare' },
  { href: '/about', label: 'About' },
];

const TWITTER_URL = process.env.NEXT_PUBLIC_TWITTER_URL || 'https://x.com/netababu';

function XLogo(props: React.SVGProps<SVGSVGElement>) {
  // Proper X logo (not a "+" / close icon)
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path d="M18.244 2H21l-7.63 8.72L22.5 22h-6.246l-4.88-5.6L5.8 22H3l8.17-9.34L1.5 2h6.246l4.39 5.04L18.244 2Zm-2.2 18h1.17L7.98 4h-1.15l9.214 16Z" />
    </svg>
  );
}

export default function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Prevent body scroll when menu is open
  useEffect(() => {
  const root = document.documentElement;
  const prev = root.style.overflow;

  if (open) {
    root.style.overflow = 'hidden';
  } else {
    root.style.overflow = '';
  }

  // cleanup must return void, not a string
  return () => {
    root.style.overflow = prev;
  };
}, [open]);


  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(href + '/');

  return (
    <header
      className="sticky top-0 z-[9999] backdrop-blur bg-cream-200/90"
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      {/* fold saffron bar into the header to avoid separate sticky collisions */}
      <div className="relative before:content-[''] before:absolute before:inset-x-0 before:top-0 before:h-2 before:bg-saffron-500">
        <div className="container max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          {/* Left: logo */}
          <Link href="/" className="flex items-center gap-2 min-w-0" aria-label="Netababu Home">
            {/* Use your wordmark if present; fallback to text */}
            <Image
              src="/logo-wordmark.png"
              alt="Netababu"
              width={120}
              height={24}
              className="hidden sm:block h-6 w-auto"
              priority
              onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = 'none')}
            />
            <span className="sm:hidden font-semibold tracking-wide">Netababu</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden sm:flex items-center gap-2 text-sm">
            {items.map((it) => (
              <Link
                key={it.href}
                href={it.href}
                aria-disabled={it.disabled}
                className={[
                  'px-3 py-1.5 rounded-full transition',
                  it.disabled ? 'opacity-40 pointer-events-none' : 'hover:bg-white/50',
                  isActive(it.href) ? 'bg-white/80' : 'bg-transparent',
                ].join(' ')}
              >
                {it.label}
              </Link>
            ))}
            <Link
              href={TWITTER_URL}
              className="ml-1 p-2 rounded-full hover:bg-white/50"
              aria-label="Netababu on X/Twitter"
            >
              <XLogo className="h-4 w-4" />
            </Link>
          </nav>

          {/* Mobile: hamburger */}
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="sm:hidden inline-flex items-center justify-center h-9 w-9 rounded-md border border-black/10 bg-white/70"
            aria-label="Open menu"
            aria-controls="mobile-menu"
            aria-expanded={open}
          >
            <span className="sr-only">Open menu</span>
            <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
              <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Mobile drawer */}
        {open && (
          <div
            id="mobile-menu"
            className="fixed inset-0 z-[10000] bg-cream-100/95 backdrop-blur p-6"
            style={{ paddingTop: 'calc(16px + env(safe-area-inset-top))' }}
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-center justify-between">
              <Link href="/" onClick={() => setOpen(false)} className="font-semibold text-lg">
                Netababu
              </Link>
              <button
                onClick={() => setOpen(false)}
                className="h-10 w-10 inline-flex items-center justify-center rounded-md border border-black/10 bg-white/80"
                aria-label="Close menu"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                  <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <nav className="mt-6 grid gap-2">
              {items.map((it) => (
                <Link
                  key={it.href}
                  href={it.href}
                  onClick={() => setOpen(false)}
                  aria-disabled={it.disabled}
                  className={[
                    'px-4 py-3 rounded-xl text-base border',
                    it.disabled ? 'opacity-40 pointer-events-none' : 'hover:bg-white',
                    isActive(it.href) ? 'bg-white border-black/10' : 'bg-white/60 border-black/10',
                  ].join(' ')}
                >
                  {it.label}
                </Link>
              ))}

              <Link
                href={TWITTER_URL}
                onClick={() => setOpen(false)}
                className="mt-2 inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-white border border-black/10"
                aria-label="Netababu on X/Twitter"
              >
                <XLogo className="h-4 w-4" />
                <span>Follow on X</span>
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
