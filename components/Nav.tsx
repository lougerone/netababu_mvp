'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const items = [
  { href: '/', label: 'Home' },
  { href: '/politicians', label: 'Politicians' },
  { href: '/parties', label: 'Parties' },
  { href: '/compare', label: 'Compare' },
  { href: '/about', label: 'About', disabled: true },
];

export default function Nav() {
  const pathname = usePathname();
  return (
    <header className="border-b border-white/10">
      <div className="container max-w-6xl py-4 flex items-center gap-6">
        <Link href="/" className="font-semibold tracking-wide">Netababu</Link>
        <nav className="flex items-center gap-4 text-sm">
          {items.map(it => (
            <Link
              key={it.href}
              href={it.href}
              aria-disabled={it.disabled}
              className={`px-2 py-1 rounded-md hover:bg-white/5 ${pathname === it.href ? 'bg-white/10' : ''} ${it.disabled ? 'opacity-40 pointer-events-none' : ''}`}
            >
              {it.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
