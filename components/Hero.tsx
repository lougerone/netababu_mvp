'use client';

import Image from 'next/image';
import Link from 'next/link';

const blurDataURL =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAAAoCAIAAADBrG...';

export default function Hero() {
  return (
    <section className="relative">
      {/* Image */}
      <div className="relative isolate">
        <Image
          src="/hero/hero-1600w.webp"
          alt="Watercolor collage of Indian political figures before India Gate & Parliament — Netababu"
          width={1600}
          height={900}
          priority
          placeholder="blur"
          blurDataURL={blurDataURL}
          className="h-[52vh] w-full object-cover md:h-[62vh] lg:h-[68vh]"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1200px"
          srcSet={[
            "/hero/hero-800w.webp 800w",
            "/hero/hero-1200w.webp 1200w",
            "/hero/hero-1600w.webp 1600w",
            "/hero/hero-2048w.webp 2048w",
            "/hero/hero-2560w.webp 2560w",
          ].join(', ')}
        />

        {/* Subtle top saffron rule (brand cue) */}
        <div className="absolute inset-x-0 top-0 h-2 bg-saffron-500/90" />

        {/* Gradient fade for legibility */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/10 via-black/30 to-black/60" />
      </div>

      {/* Copy & CTAs */}
      <div className="absolute inset-0 flex items-end">
        <div className="mx-auto w-full max-w-6xl px-4 pb-8 md:pb-10 lg:pb-12">
          <p className="h-kicker text-white/80">India Political Data</p>
          <h1 className="mt-2 text-3xl font-semibold leading-tight text-white md:text-4xl lg:text-5xl">
            Track <span className="text-saffron-300">Netas</span>, compare{' '}
            <span className="text-white">parties</span>, and cite{' '}
            <span className="text-white">verified sources</span>.
          </h1>

          <p className="mt-3 max-w-2xl text-sm text-white/85 md:text-base">
            Netababu brings together politicians, parties, timelines, and
            credible references—so you can explore facts without the noise.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/politicians"
              className="rounded-2xl bg-white px-4 py-2 text-sm font-medium text-ink-900 shadow hover:bg-white/90"
            >
              Explore Politicians
            </Link>
            <Link
              href="/parties"
              className="rounded-2xl border border-white/70 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur hover:bg-white/15"
            >
              Browse Parties
            </Link>
            <Link
              href="/compare"
              className="rounded-2xl border border-white/20 px-4 py-2 text-sm font-medium text-white/90 hover:border-white/40"
            >
              Compare (X vs Y)
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
