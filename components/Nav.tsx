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

const TWITTER_URL =
  process.env.NEXT_PUBLIC_TWITTER_URL || 'https://x.com/netababu_';

function XIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M3 3h3l15 18h-3L3 3Zm0 18L18 3h3L3 21Z" />
    </svg>
  );
}

export default function Nav() {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === '/'
      ? pathname === '/'
      : pathname === href || pathname.startsWith(href + '/');

  return (
    <header
      className="
        sticky top-0 z-[200] isolate
        bg-cream-200/90 backdrop-blur supports-[backdrop-filter]:bg-cream-200/75
      "
    >
      <div className="relative container max-w-6xl px-4 flex items-center min-h-14">
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
          className="absolute left-1/2 -translate-x-1/2 z-10"
        >
          <ul className="flex items-center gap-1 text-[13px] leading-none font-medium">
            {items.map((it) => {
              const active = isActive(it.href);
              const base =
                'px-3 py-2 rounded-full transition-colors whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-saffron-500';
              const enabled =
                'text-ink-700 hover:bg-black/5 aria-[current=page]:bg-black/10 aria-[current=page]:text-ink-900';
              const disabled = 'text-ink-400 cursor-not-allowed';
              return (
                <li key={it.href}>
                  {it.disabled ? (
                    <span className={`${base} ${disabled}`} aria-disabled="true">
                      {it.label}
                    </span>
                  ) : (
                    <Link
                      href={it.href}
                      aria-current={active ? 'page' : undefined}
                      className={`${base} ${enabled}`}
                    >
                      {it.label}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Right: social */}
        <div className="ml-auto flex items-center gap-2">
          <a
            href={TWITTER_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="
              inline-flex h-9 w-9 items-center justify-center
              rounded-full border border-black/10
              text-ink-700 hover:bg-black/5
              focus:outline-none focus-visible:ring-2 focus-visible:ring-saffron-500
            "
            aria-label="Open Netababu on X (Twitter)"
          >
            <XIcon className="h-4 w-4" />
          </a>
        </div>
      </div>
    </header>
  );
}
