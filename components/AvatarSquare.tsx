// components/AvatarSquare.tsx
'use client';

import Image from 'next/image';
import { useMemo, useState } from 'react';

/** Edit this list if you allow more hosts in next.config.js */
const ALLOWED_HOSTS = new Set<string>([
  // keep if you still show wiki logos
  'upload.wikimedia.org',
  'images.wikimedia.org',
  // direct hosts
  's3.amazonaws.com',
  'stackby.com',
]);

/** Optional suffix matches for wildcard hosts */
const ALLOWED_SUFFIXES = ['.amazonaws.com', '.stackby.com'];

function isAllowedSrc(src?: string | null): string | undefined {
  if (!src) return undefined;
  if (src.startsWith('/')) return src;        // public asset or your /proxy-image route
  if (src.startsWith('data:')) return src;    // data URI
  try {
    const u = new URL(src);
    const h = u.hostname;
    if (ALLOWED_HOSTS.has(h)) return src;
    if (ALLOWED_SUFFIXES.some(sfx => h.endsWith(sfx))) return src;
    return undefined;
  } catch {
    return undefined;
  }
}

function isAllowedSrc(src?: string | null): string | undefined {
  if (!src) return undefined;
  if (src.startsWith('/')) return src;        // public asset
  if (src.startsWith('data:')) return src;    // data URI
  try {
    const u = new URL(src);
    return ALLOWED_HOSTS.has(u.hostname) ? src : undefined;
  } catch {
    return undefined;
  }
}

type Props = {
  src?: string | null;
  alt?: string;
  size?: number;                 // px
  rounded?: string;              // e.g. "rounded-lg"
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

  // If no allowed src or it broke -> render text
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
      style={{
        width: size,
        height: size,
        background: bg,
        boxShadow: `inset 0 0 0 1px ${ring}`,
      }}
      aria-label={alt}
    >
      {safeSrc && !broken ? (
        <Image
          src={safeSrc}
          alt={alt}
          fill
          sizes={`${size}px`}
          className={variant === 'party' ? 'object-contain object-center bg-white p-1' : 'object-cover object-center'}
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

/* ---------------- helpers ---------------- */

function palette(variant: 'person' | 'party') {
  if (variant === 'party') {
    return { bg: '#FFF4E6', fg: '#232323', ring: 'rgba(0,0,0,0.08)' }; // saffronish
  }
  return { bg: '#F3F4F6', fg: '#1F2937', ring: 'rgba(0,0,0,0.06)' };     // neutral
}

function abbrFromLabel(s: string): string {
  if (!s) return '—';
  const upper = s.toUpperCase();

  const m = upper.match(/^([^()]+)\(([^()]*)\)/); // e.g., "SS(UBT)"
  const outer = (m ? m[1] : upper).replace(/[^A-Z]/g, ''); // before "(" or whole
  const inner = (m ? m[2] : '').replace(/[^A-Z]/g, '');    // inside "()"

  // If we already have 3+ from the outer, just use them.
  if (outer.length >= 3) return outer.slice(0, 3);

  // Otherwise, pad from inner first (this makes SS(UBT) -> SSU)
  let out = outer;
  for (const ch of inner) {
    if (out.length >= 3) break;
    out += ch;
  }

  // If still short, pad from any remaining letters in the full string.
  if (out.length < 3) {
    const all = upper.replace(/[^A-Z]/g, '');
    for (const ch of all) {
      if (out.length >= 3) break;
      if (!out.includes(ch) || true) out += ch; // just take next letters
    }
  }

  return out.slice(0, 3) || '—';
}


function initialsFromName(s: string): string {
  if (!s) return '—';
  const parts = s.replace(/\s+/g, ' ').trim().split(' ').filter(Boolean);
  if (parts.length === 1) {
    const chars = [...parts[0]];
    return (chars[0] || '—').toUpperCase() + (chars[1] ? chars[1].toUpperCase() : '');
  }
  return parts.slice(0, 3).map(w => (w[0] || '').toUpperCase()).join('') || '—';
}

function FallbackIcon({
  variant,
  size,
  color,
}: {
  variant: 'person' | 'party';
  size: number;
  color: string;
}) {
  const wh = Math.round(size * 0.6);
  return variant === 'party' ? (
    <svg width={wh} height={wh} viewBox="0 0 24 24" aria-hidden>
      <path d="M3 20h18v2H3z" fill={color}/>
      <path d="M5 16h14v2H5z" fill={color}/>
      <path d="M7 12h10v2H7z" fill={color}/>
      <path d="M6 12 12 7l6 5H6z" fill={color}/>
      <circle cx="12" cy="5" r="1.6" fill={color}/>
    </svg>
  ) : (
    <svg width={wh} height={wh} viewBox="0 0 24 24" aria-hidden>
      <circle cx="12" cy="8" r="4" fill={color}/>
      <path d="M4 20c0-4.2 3.8-7 8-7s8 2.8 8 7v1H4z" fill={color}/>
    </svg>
  );
}
