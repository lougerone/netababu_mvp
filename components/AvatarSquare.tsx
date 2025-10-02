// components/AvatarSquare.tsx
import Image from 'next/image';

type Props = {
  src?: string | null;
  alt?: string;
  size?: number;                 // px
  rounded?: string;              // e.g. "rounded-lg"
  variant?: 'person' | 'party';  // person => neta, party => party
  label?: string | null;         // people: full name; party: ABBR or name
};

export default function AvatarSquare({
  src,
  alt = '',
  size = 64,
  rounded = 'rounded-lg',
  variant = 'person',
  label,
}: Props) {
  const { bg, fg, ring } = palette(variant);
  const seed = (label || alt || '').trim();
  const text = variant === 'party' ? abbrFromLabel(seed) : initialsFromName(seed);

  // Dynamic sizing: <=3 chars normal, 4 a bit smaller, 5+ even smaller
  const charCount = text.length;

const ratio =
  variant === 'party'
    ? (charCount <= 3 ? 0.34 : charCount === 4 ? 0.28 : 0.24) // smaller for party
    : (charCount <= 3 ? 0.40 : charCount === 4 ? 0.34 : 0.30);

const letterSpace =
  variant === 'party'
    ? (charCount >= 4 ? 0.3 : 0.2)
    : (charCount > 3 ? 0.1 : 0.25);
  return (
    <div
      className={`relative flex items-center justify-center ${rounded} overflow-hidden shrink-0`}
      style={{ width: size, height: size, background: bg, boxShadow: `inset 0 0 0 1px ${ring}` }}
    >
      {src ? (
  <Image
    src={src}
    alt={alt}
    fill                 // <-- key: let it fill the square wrapper
    sizes={`${size}px`}  // hint to the browser for correct thumb size
    className="object-cover object-center"
    priority={false}
  />
) : text ? (
  <span
    className="antialiased font-medium leading-none"
    style={{
      color: fg,
      fontSize: Math.round(size * ratio),
      letterSpacing: letterSpace,
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
  // Muted, on-brand colors (no gradients)
  if (variant === 'party') {
    return { bg: '#F2F4F7', fg: '#0D1B2A', ring: 'rgba(13,27,42,0.08)' }; // light grey
  }
  return { bg: '#FFF0D6', fg: '#0D1B2A', ring: 'rgba(13,27,42,0.08)' };     // light saffron
}

// Keep up to 5 alphanumerics for party ABBRs (e.g., YSRCP)
function abbrFromLabel(s: string): string {
  if (!s) return '';
  const t = s.trim();
  if (/^[A-Za-z0-9()\/-]{1,5}$/.test(t)) return t.toUpperCase();
  return t.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 5);
}

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function FallbackIcon({
  variant,
  size = 48,
  color = '#0D1B2A',
}: {
  variant: 'person' | 'party';
  size?: number;
  color?: string;
}) {
  const wh = Math.round(size * 0.62);
  return variant === 'party' ? (
    // simple civic dome
    <svg width={wh} height={wh} viewBox="0 0 24 24" aria-hidden style={{ color }}>
      <path d="M3 20h18v2H3z" fill="currentColor"/>
      <path d="M5 16h14v2H5z" fill="currentColor"/>
      <path d="M7 12h10v2H7z" fill="currentColor"/>
      <path d="M6 12 12 7l6 5H6z" fill="currentColor"/>
      <circle cx="12" cy="5" r="1.6" fill="currentColor"/>
    </svg>
  ) : (
    // simple person silhouette
    <svg width={wh} height={wh} viewBox="0 0 24 24" aria-hidden style={{ color }}>
      <circle cx="12" cy="8" r="4" fill="currentColor"/>
      <path d="M4 20c0-4.2 3.8-7 8-7s8 2.8 8 7v1H4z" fill="currentColor"/>
    </svg>
  );
}
