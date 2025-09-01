'use client';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

type Item = { href: string; label: string; disabled?: boolean };

const items: Item[] = [
  { href: '/', label: 'Home' },
  { href: '/politicians', label: 'Politicians' },
  { href: '/parties', label: 'Parties' },
  { href: '/compare', label: 'Compare' },
  { href: '/about', label: 'About' },
];

export default function Nav() {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(href + '/');

  return (
    // No border/shadow here so the hero's line is the only divider
    <header className="sticky top-0 z-40 bg-cream-200/90 backdrop-blur">
      <div className="container max-w-6xl px-4 py-2 flex items-center gap-5">
        {/* Logo */}
        <Link href="/" className="flex items-center" aria-label="Netababu Home">
          <Image
            src="/logo-wordmark.png"        // place the PNG in /public
            alt="Netababu"
            width={797}                      // intrinsic size of the new asset
            height={526}
            priority
            className="h-12 md:h-14 w-auto -translate-y-[1px]" // adjust height to taste
          />
          <span className="sr-only">Netababu</span>
        </Link>

        {/* Menu (right-aligned) */}
        <nav className="ml-auto flex items-center gap-1 text-sm leading-none" aria-label="Primary">
          {items.map((it) => {
            const active = isActive(it.href);
            const disabled = !!it.disabled;
            return (
              <Link
                key={it.href}
                href={it.href}
                aria-disabled={disabled}
                aria-current={active ? 'page' : undefined}
                className={[
                  'px-2 py-0.5 rounded-md transition-colors whitespace-nowrap',
                  'hover:bg-white/5',
                  active ? 'bg-white/10' : '',
                  disabled ? 'opacity-40 pointer-events-none' : '',
                ].join(' ')}
              >
                {it.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
