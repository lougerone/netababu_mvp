// components/AvatarSquare.tsx
'use client';

import Image from 'next/image';
import { useMemo, useState } from 'react';

type Props = {
  src?: string | null;
  alt?: string;
  /** Square size in px (default 64) */
  size?: number;
  /** Tailwind rounded class, e.g. "rounded-lg" (default "rounded-lg") */
  rounded?: string;
  /** Optional extra className for the root */
  className?: string;
  /** Small text to derive initials/abbr (falls back to `alt`) */
  label?: string | null;
  /** Visual preset */
  variant?: 'person' | 'party';
  /** Force Next/Image unoptimized (e.g., for proxied URLs) */
  unoptimized?: boolean;
};

export default function AvatarSquare({
  src,
  alt = '',
  size = 64,
  rounded = 'rounded-lg',
  className = '',
  label,
  variant = 'person',
  unoptimized,
}: Props) {
  const [broken, setBroken] = useState(false);

  // decide colors and ring based on variant
  const { bg, fg, ring } = useMemo(() => palette(variant), [variant]);

  // pick a seed string to compute initials/abbr
  const seed = (label || alt || '').trim();

  // when no src or broken → render text (initials/abbr)
  const text = useMemo(() => {
    if (src && !broken) return '';
    return variant === 'party' ? abbrFromLabel(seed) : initialsFromName(seed);
  }, [src, broken, variant, seed]);

  // dynamic font sizing based on text length and variant
  const fontPx = useMemo(() => {
    const len = text.length || 1;
    if (variant === 'party') {
      // party abbr tends to be 2–5 letters
      if (len <= 2) return Math.round(size * 0.40);
      if (len === 3) return Math.round(size * 0.34);
      if (len === 4) return Math.round(size * 0.30);
      return Math.round(size * 0.26);
    } else {
      // person initials typically 1–3 chars
      if (len === 1) return Math.round(size * 0.44);
      if (len === 2) return Math.round(size * 0.38);
      return Math.round(size * 0.32);
    }
  }, [text, variant, size]);

  // only treat as “public-ish” path if it’s absolute http(s) or starts with /
  const safeSrc =
    src && (/^https?:\/\//i.test(src) || src.startsWith('/')) ? src : undefined;

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
          // party logos: keep white bg & contain; people: cover
          className={
            variant === 'party'
              ? 'object-contain object-center bg-white p-1'
              : 'object-cover object-center'
          }
          draggable={false}
          onError={() => setBroken(true)}
          unoptimized={!!unoptimized}
          priority={false}
        />
      ) : text ? (
        <span
          className="antialiased font-medium leading-none select-none"
          style={{
            color: fg,
            fontSize: fontPx,
            letterSpacing:
              variant === 'party'
                ? text.length >= 4
                  ? 0.4
                  : 0.25
                : text.length > 2
                ? 0.1
                : 0.2,
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

/* ------------------------------ helpers ------------------------------ */

function palette(variant: 'person' | 'party') {
  if (variant === 'party') {
    // Netababu-adjacent saffron/ink vibes with good contrast
    return {
      bg: '#FFF4E6', // soft saffron
      fg: '#2A2A2A', // ink
      ring: 'rgba(0,0,0,0.08)',
    };
  }
  // neutral gray for people
  return {
    bg: '#F3F4F6',
    fg: '#1F2937',
    ring: 'rgba(0,0,0,0.06)',
  };
}

/** "Bharatiya Janata Party" -> "BJP"; "Shiv Sena (UBT)" -> "SS(UBT)"; otherwise take up to 5 alnum chars */
function abbrFromLabel(s: string): string {
  if (!s) return '—';
  const known: Record<string, string> = {
    'bharatiya janata party': 'BJP',
    bjp: 'BJP',
    'indian national congress': 'INC',
    inc: 'INC',
    'shiv sena (ubt)': 'SS(UBT)',
    'shiv sena ubt': 'SS(UBT)',
    'shiv sena': 'SS',
    ss: 'SS',
    'trinamool congress': 'TMC',
    tmc: 'TMC',
    'aam aadmi party': 'AAP',
    aap: 'AAP',
    rjd: 'RJD',
    'rashtriya janata dal': 'RJD',
    jdu: 'JDU',
    'janata dal (united)': 'JDU',
  };
  const key = s.toLowerCase().replace(/\s+/g, ' ').trim();
  if (known[key]) return known[key];
  // fallback: extract letters/numbers, cap at 5 chars
  const raw = (s.match(/[A-Za-z0-9]/g) || []).join('').toUpperCase();
  return raw.slice(0, 5) || '—';
}

/** "Narendra Damodardas Modi" -> "NDM"; "Sonia Gandhi" -> "SG" */
function initialsFromName(s: string): string {
  if (!s) return '—';
  const parts = s
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .filter(Boolean);
  if (parts.length === 1) {
    const word = parts[0];
    // take first 1–2 letters (supports non-Latin too)
    const chars = [...word];
    return (chars[0] || '—').toUpperCase() + (chars[1] ? chars[1].toUpperCase() : '');
  }
  // take first letter of up to first 3 words
  return parts
    .slice(0, 3)
    .map(w => (w[0] || '').toUpperCase())
    .join('') || '—';
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
  const stroke = 'rgba(0,0,0,0.25)';
  if (variant === 'party') {
    // simple shield/flag mark
    return (
      <svg
        viewBox="0 0 24 24"
        width={Math.round(size * 0.5)}
        height={Math.round(size * 0.5)}
        aria-hidden
      >
        <path
          d="M4 5.5l8-3 8 3V12c0 4.418-3.582 7-8 9-4.418-2-8-4.582-8-9V5.5z"
          fill={color}
          stroke={stroke}
          strokeWidth="1"
        />
      </svg>
    );
  }
  // person bust icon
  return (
    <svg
      viewBox="0 0 24 24"
      width={Math.round(size * 0.5)}
      height={Math.round(size * 0.5)}
      aria-hidden
    >
      <circle cx="12" cy="8" r="4" fill={color} stroke={stroke} strokeWidth="1" />
      <path
        d="M4 20c0-3.314 3.582-6 8-6s8 2.686 8 6"
        fill="none"
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
