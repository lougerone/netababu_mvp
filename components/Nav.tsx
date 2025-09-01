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
    <header className="sticky top-0 z-40 bg-cream-200/90 backdrop-blur
                       shadow-[0_1px_0_0_rgba(0,0,0,0.06)]"> {/* single separator */}
      <div className="container max-w-6xl px-4 py-3 flex items-center gap-6">
        <Link href="/" className="flex items-center gap-3" aria-label="Netababu Home">
          <Image
            src="/logo-wordmark.png"
            alt="Netababu"
            width={260}
            height={56}
            priority
            sizes="(min-width:1024px) 220px, 180px"
            className="h-10 w-auto"  /* bigger logo, header stays compact */
          />
          <span className="sr-only">Netababu</span>
        </Link>

        <nav className="flex items-center gap-1 text-sm">
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
                  'px-3 py-2 rounded-lg transition-colors whitespace-nowrap',
                  'hover:bg-ink-900/5',
                  active ? 'bg-ink-900/10' : '',
                  disabled ? 'opacity-40 pointer-events-none' : '',
                ].join(' ')}
              >
                {it.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex-1" />
      </div>
    </header>
  );
}

