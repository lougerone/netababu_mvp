// components/AvatarSquare.tsx
'use client';

import Image from 'next/image';
import { useMemo, useState } from 'react';

/** Allowed direct hosts (Airtable + Wiki) */
const ALLOWED_HOSTS = new Set<string>([
  'v5.airtableusercontent.com',
  'dl.airtable.com',
  'upload.wikimedia.org',
  'images.wikimedia.org',
]);

/** Allow wildcard subdomains (e.g. v2.airtableusercontent.com) */
const ALLOWED_SUFFIXES = [
  '.airtableusercontent.com',
];

function isAllowedSrc(src?: string | null): string | undefined {
  if (!src) return undefined;
  if (src.startsWith('/')) return src;        // public asset
  if (src.startsWith('data:')) return src;    // data URI
  try {
    const u = new URL(src);
    const host = u.hostname;
    if (ALLOWED_HOSTS.has(host)) return src;
    if (ALLOWED_SUFFIXES.some(sfx => host.endsWith(sfx))) return src; // <—
    return undefined;
  } catch {
    return undefined;
  }
}

type Props = {
  src?: string | null;
  alt?: string;
  size?: number;
  rounded?: string;
  variant?: 'person' | 'party';
  label?: string | null;
  className?: string;
};

export default function AvatarSquare({
  src,
  alt = '',
  size = 96,
  rounded = 'rounded-lg',
  variant = 'party',
  label,
  className = '',
}: Props) {
  const [broken, setBroken] = useState(false);

  const safeSrc = useMemo(() => isAllowedSrc(src), [src]);
  const { bg, fg, ring } = useMemo(() => palette(variant), [variant]);
  const seed = (label || alt || '').trim();

  // (dev aid) see what URL we’re trying to render
  if (process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line no-console
    console.debug('AvatarSquare src:', { original: src, safeSrc, variant });
  }

  const text = useMemo(() => {
    if (safeSrc && !broken) return '';
    return variant === 'party' ? abbrFromLabel(seed) : initialsFromName(seed);
  }, [safeSrc, broken, variant, seed]);

  const fontPx = useMemo(() => {
    const len = text.length || 1;
    if (variant === 'party') {
      if (len <= 2) return Math.round(size * 0.40);
      if (len === 3) return Math.round(size * 0.34);
      if (len === 4) return Math.round(size * 0.30);
      return Math.round(size * 0.26);
    } else {
      if (len === 1) return Math.round(size * 0.44);
      if (len === 2) return Math.round(size * 0.38);
      return Math.round(size * 0.32);
    }
  }, [text, variant, size]);

  return (
    <div
      className={[
        'relative inline-flex shrink-0 items-center justify-center overflow-hidden ring-1',
        rounded,
        className,
      ].join(' ')}
      style={{ width: size, height: size, background: bg, boxShadow: `inset 0 0 0 1px ${ring}` }}
      aria-label={alt}
    >
      {safeSrc && !broken ? (
        <Image
          src={safeSrc}
          alt={alt}
          fill
          sizes={`${size}px`}
          className={
            variant === 'party'
              ? 'object-contain object-center bg-white p-1'
              : 'object-cover object-center'
          }
          draggable={false}
          onError={() => setBroken(true)}
        />
      ) : text ? (
        <span
          className="antialiased font-medium leading-none select-none"
          style={{
            color: fg,
            fontSize: fontPx,
            letterSpacing:
              variant === 'party'
                ? (text.length >= 4 ? 0.4 : 0.25)
                : (text.length > 2 ? 0.1 : 0.2),
            fontFamily:
              'ui-rounded, "SF Pro Rounded", "Segoe UI Rounded", "Helvetica Rounded", "Arial Rounded MT", system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif',
          }}
          aria-hidden
        >
          {text}
        </span>
      ) : (
        <FallbackIcon variant={variant} size={size} color={fg} />
      )}
    </div>
  );
}

/* ...rest unchanged ... */
