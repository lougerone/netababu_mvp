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
    // no border/shadow so the hero’s divider is the only line
    <header className="sticky top-0 z-40 bg-cream-200/90 backdrop-blur">
      <div className="relative container max-w-6xl px-4 py-1 flex items-center">
        {/* Left: logo (new wide PNG, bigger but compact header) */}
        <Link href="/" className="flex items-center" aria-label="Netababu Home">
          <Image
            src="/logo-wordmark.png"
            alt="Netababu"
            width={797}
            height={526}
            priority
            className="h-12 md:h-14 w-auto -translate-y-[1px]"
          />
          <span className="sr-only">Netababu</span>
        </Link>

        {/* Center: menu */}
        <nav
          aria-label="Primary"
          className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1 text-sm leading-none"
        >
          {items.map((it) => {
            const active = isActive(it.href);
            return (
              <Link
                key={it.href}
                href={it.href}
                aria-current={active ? 'page' : undefined}
                className={[
                  'px-2 py-0.5 rounded-md transition-colors whitespace-nowrap',
                  'hover:bg-white/5',
                  active ? 'bg-white/10' : '',
                ].join(' ')}
              >
                {it.label}
              </Link>
            );
          })}
        </nav>

        {/* Right: spacer (keeps layout stable) */}
        <div className="ml-auto" />
      </div>
    </header>
  );
}
