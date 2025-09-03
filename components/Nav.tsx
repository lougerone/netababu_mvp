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

const TWITTER_URL = process.env.NEXT_PUBLIC_TWITTER_URL || 'https://x.com/netababu';

function XIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M4 4L20 20M20 4L4 20"
        stroke="currentColor"
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}


export default function Nav() {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(href + '/');

  return (
    <div className="relative mx-auto max-w-6xl px-4 py-1 grid grid-cols-[auto_1fr_auto] items-center">
      {/* Left: logo */}
      <Link href="/" className="flex items-center" aria-label="Netababu Home">
        <Image
          src="/logo-wordmark.png"
          alt="Netababu"
          width={797}
          height={526}
          priority
          className="h-10 md:h-14 w-auto -translate-y-[1px]"
        />
        <span className="sr-only">Netababu</span>
      </Link>

      {/* Center: menu */}
      <nav
    aria-label="Primary"
    className="justify-self-center flex items-center gap-1 text-[13px] leading-none font-medium"
  >
    {items.map(it => {
      const active = isActive(it.href);
      return (
        <Link
          key={it.href}
          href={it.href}
          aria-current={active ? 'page' : undefined}
          className={[
            'px-3 py-2 rounded-full transition-colors whitespace-nowrap',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-saffron-500',
            'text-ink-700 hover:bg-black/5',
            active ? 'bg-black/10 text-ink-900' : '',
          ].join(' ')}
        >
          {it.label}
        </Link>
      );
    })}
  </nav>

      {/* Right: socials */}
        <div className="justify-self-end ml-auto flex items-center gap-2">

        <a
          href={TWITTER_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-black/10 text-ink-700 hover:bg-black/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-saffron-500"
          aria-label="Open Netababu on X (Twitter)"
        >
          <XIcon className="h-4 w-4" />
        </a>
      </div>
    </div>
  );
}
