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
  { href: '/about', label: 'About' }, // enabled now
];

export default function Nav() {
  const pathname = usePathname();
  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname === href || pathname.startsWith(href + '/');
  };

  return (
    <header className="sticky top-0 z-40 bg-cream-200/90 backdrop-blur shadow-[0_1px_0_0_rgba(0,0,0,0.06)]">
  <div className="container max-w-6xl px-4 py-2 flex items-center gap-5">
    <Link href="/" className="flex items-center gap-2" aria-label="Netababu Home">
      <Image
        src="/logo-wordmark.png"
        alt="Netababu"
        width={240}
        height={48}
        priority
        className="h-10 w-auto"    {/* keep the bigger logo */}
      />
      <span className="sr-only">Netababu</span>
    </Link>

    <nav className="ml-auto flex items-center gap-1 text-sm leading-none">
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
