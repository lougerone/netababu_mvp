'use client';

import Link from 'next/link';
import HeroSearch from '@/components/HeroSearch';

/**
 * Seam-proof hero:
 * - Single multi-layer CSS background:
 *    1) Cream radial vignette -> hides any hard left/right edge on all screens
 *    2) Dark vertical gradient -> your original look
 *    3) Hero image (cover, top-aligned)
 * - No <Image> element, no masks, nothing to purge.
 */
export default function Hero() {
  return (
    <section className="relative isolate h-[70vh] w-full overflow-hidden md:h-[75vh] lg:h-[80vh]">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            radial-gradient(120% 100% at 50% 50%,
              rgba(255,247,237,0) 58%,
              rgba(255,247,237,0.75) 82%,
              #fff7ed 100%),
            linear-gradient(to bottom,
              rgba(0,0,0,0.20) 0%,
              rgba(0,0,0,0.40) 45%,
              rgba(0,0,0,0.70) 100%),
            url('/hero/hero-2560w.webp')
          `,
          backgroundSize: '100% 100%, 100% 100%, cover',
          backgroundPosition: 'center center, center center, center top',
          backgroundRepeat: 'no-repeat, no-repeat, no-repeat',
        }}
        aria-hidden
      />

      {/* Orange top rule (brand cue) */}
      <div className="absolute top-0 left-0 right-0 h-2 bg-saffron-500/95 z-10" />

      {/* Foreground content */}
      <div className="relative z-20 mx-auto flex h-full max-w-4xl flex-col items-center justify-center px-4 text-center">
        <p className="h-kicker text-white/85">INDIA • POLITICS • DATA</p>

        <h1 className="mt-2 text-3xl font-bold leading-tight text-white md:text-5xl lg:text-6xl">
          Netas, parties, drama — <br className="hidden md:block" /> all in one place.
        </h1>

        <p className="mt-2 text-lg text-saffron-300 md:text-xl">
          नेताजी, पार्टियाँ और इंफो — एक ही जगह
        </p>

        {/* Your live search */}
        <div className="mt-6 w-full">
          <HeroSearch />
        </div>

        {/* Popular links */}
        <p className="mt-3 text-sm text-white/85">
          Popular: <Link href="/politicians/narendra-modi" className="underline">Modi</Link>{' '}
          • <Link href="/parties/inc" className="underline">INC</Link>
        </p>
      </div>
    </section>
  );
}
