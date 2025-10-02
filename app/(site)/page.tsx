{/* Background image + vignette (behind content only) */}
<div className="absolute inset-0 z-0 overflow-hidden">
  {/* Artwork with soft edge mask + lighter/less contrast */}
  <Image
    src="/hero/hero-2560w.webp"
    alt="Watercolor collage of Indian political figures — Netababu"
    fill
    priority
    sizes="100vw"
    className={[
      'object-contain object-top',
      'opacity-30',
      '[filter:contrast(.9)_saturate(.9)_blur(.3px)]',
      '[mask-image:radial-gradient(120%_90%_at_50%_45%,_#000_58%,_transparent_85%)]'
    ].join(' ')}
    // Safari fallback for the soft edge mask
    style={{
      WebkitMaskImage:
        'radial-gradient(120% 90% at 50% 45%, #000 58%, transparent 85%)',
    }}
  />

  {/* Radial vignette to cream (smoothly removes edges) */}
  <div
    className="pointer-events-none absolute inset-0"
    style={{
      background:
        'radial-gradient(120% 100% at 50% 50%, rgba(255,247,237,0) 55%, rgba(255,247,237,0.75) 82%, #fff7ed 100%)',
    }}
  />

  {/* Subtle top/bottom linear fades */}
  <div className="pointer-events-none absolute inset-0">
    <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-cream-200/70 via-cream-200/40 to-transparent" />
    <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-cream-200/70 via-cream-200/40 to-transparent" />
  </div>
</div>
