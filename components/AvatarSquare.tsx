// components/AvatarSquare.tsx
import Image from 'next/image';

type Props = {
  src?: string | null;
  alt?: string;
  size?: number;                 // px
  rounded?: string;              // e.g. "rounded-lg"
  /** person => initials, party => ABBR; drives icon choice if no text */
  variant?: 'person' | 'party';
  /** Parties: pass ABBR (e.g. BJP). People: pass full name (we’ll derive initials). */
  label?: string | null;
};

export default function AvatarSquare({
  src,
  alt = '',
  size = 48,
  rounded = 'rounded-lg',
  variant = 'person',
  label,
}: Props) {
  const seed = (label || alt || '').trim();
  const { bg } = pickBrandStyle(seed);

  const text =
    variant === 'party'
      ? abbrFromLabel(seed)
      : initialsFromName(seed);

  return (
    <div
      className={`relative flex items-center justify-center ${rounded} overflow-hidden shrink-0 ring-1 ring-black/5`}
      style={{ width: size, height: size, background: bg }}
    >
      {src ? (
        <Image
          src={src}
          alt={alt}
          width={size}
          height={size}
          className="object-cover"
        />
      ) : text ? (
        <span
          className="text-white/95 font-semibold leading-none"
          style={{ fontSize: Math.round(size * 0.46), letterSpacing: 0.5 }}
          aria-hidden
        >
          {text}
        </span>
      ) : (
        <FallbackIcon variant={variant} size={size} />
      )}
    </div>
  );
}

/* ----------------- helpers ----------------- */

function abbrFromLabel(s: string): string {
  if (!s) return '';
  const t = s.trim();
  if (/^[A-Za-z0-9()\/-]{1,4}$/.test(t)) return t.toUpperCase();
  const letters = t.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
  return letters.slice(0, 3);
}

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function pickBrandStyle(seed: string) {
  // Netababu-ish palette: deep ink base + accent
  const palettes = [
    ['#0D1B2A', '#FF7A00'], // ink → saffron
    ['#0D1B2A', '#7C3AED'], // ink → purple
    ['#0D1B2A', '#14B8A6'], // ink → teal
    ['#0D1B2A', '#FF9E3D'], // ink → warm saffron
  ] as const;
  const idx = hash(seed) % palettes.length;
  const [c1, c2] = palettes[idx];
  const bg = `radial-gradient(120% 120% at 0% 0%, ${hexA(c2,0.28)} 0%, transparent 60%),
              radial-gradient(120% 120% at 100% 100%, ${hexA(c2,0.22)} 0%, transparent 60%),
              linear-gradient(135deg, ${c1} 0%, ${c2} 100%)`;
  return { bg };
}

function hash(s: string) {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = (h * 33) ^ s.charCodeAt(i);
  return Math.abs(h);
}

function hexA(hex: string, a = 1) {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!m) return hex;
  const r = parseInt(m[1], 16), g = parseInt(m[2], 16), b = parseInt(m[3], 16);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

/* ---------- neutral icons when no text ---------- */
function FallbackIcon({ variant, size = 48 }: { variant: 'person' | 'party'; size?: number }) {
  const wh = Math.round(size * 0.62);
  return variant === 'party' ? (
    // civic dome
    <svg width={wh} height={wh} viewBox="0 0 24 24" aria-hidden className="text-white/90">
      <path d="M3 20h18v2H3z" fill="currentColor"/>
      <path d="M5 16h14v2H5z" fill="currentColor"/>
      <path d="M7 12h10v2H7z" fill="currentColor"/>
      <path d="M6 12 12 7l6 5H6z" fill="currentColor"/>
      <circle cx="12" cy="5" r="1.6" fill="currentColor"/>
    </svg>
  ) : (
    // person silhouette
    <svg width={wh} height={wh} viewBox="0 0 24 24" aria-hidden className="text-white/90">
      <circle cx="12" cy="8" r="4" fill="currentColor"/>
      <path d="M4 20c0-4.2 3.8-7 8-7s8 2.8 8 7v1H4z" fill="currentColor"/>
    </svg>
  );
}
