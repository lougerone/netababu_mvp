'use client';

import Image from 'next/image';
import Link from 'next/link';

const blurDataURL =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAAAoCAIAAADBrG...';

export default function Hero() {
  return (
    <section className="relative isolate h-[80vh] w-full overflow-hidden">
      {/* Background image (feathered left/right via inline mask) */}
      <Image
        src="/hero/hero-2560w.webp"
        alt="Watercolor collage of Indian political figures — Netababu"
        fill
        priority
        placeholder="blur"
        blurDataURL={blurDataURL}
        sizes="100vw"
        className="object-cover object-top"
        style={{
          // Feather horizontally so hard edges disappear on all screens
          WebkitMaskImage:
            'linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%)',
          maskImage:
            'linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%)',
          WebkitMaskRepeat: 'no-repeat',
          maskRepeat: 'no-repeat',
          WebkitMaskSize: '100% 100%',
          maskSize: '100% 100%',
        }}
      />

      {/* Dark gradient overlay (unchanged) */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/70" />

      {/* Optional: ultra-subtle vignette to the page bg to guarantee no edge line on extreme ultrawide */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(120% 100% at 50% 50%, rgba(255,247,237,0) 60%, rgba(255,247,237,0.35) 85%, #fff7ed 100%)',
          mixBlendMode: 'normal',
        }}
      />

      {/* Orange top rule (brand cue) */}
      <div className="absolute top-0 left-0 right-0 h-2 bg-saffron-500/95 z-10" />

      {/* Foreground content */}
      <div className="relative z-20 flex h-full flex-col items-center justify-center text-center px-4">
        <p className="h-kicker text-white/80">INDIA • POLITICS • DATA</p>
        <h1 className="mt-3 text-3xl font-bold leading-tight text-white md:text-5xl lg:text-6xl">
          Netas, parties, drama — <br className="hidden md:block" /> all in one
          place.
        </h1>
        <p className="mt-2 text-lg text-saffron-300 md:text-xl">
          नेताजी, पार्टियाँ और इंफो — एक ही जगह
        </p>

        {/* Search bar */}
        <div className="mt-6 flex w-full max-w-xl items-center gap-2">
          <input
            type="text"
            placeholder="Search politicians, parties..."
            className="flex-1 rounded-full border border-white/30 bg-white/90 px-4 py-2 text-sm text-ink-900 shadow focus:outline-none focus:ring-2 focus:ring-saffron-400"
          />
          <button className="rounded-full bg-saffron-500 px-5 py-2 font-medium text-white shadow hover:bg-saffron-600">
            Search
          </button>
        </div>

        {/* Popular links */}
        <p className="mt-3 text-sm text-white/80">
          Popular: <Link href="/politician/modi" className="underline">Modi</Link>{' '}
          • <Link href="/party/inc" className="underline">INC</Link>
        </p>
      </div>
    </section>
  );
}
