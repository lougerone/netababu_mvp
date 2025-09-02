import Image from 'next/image';

type Props = {
  src?: string | null;
  alt?: string;
  size?: number;             // px
  rounded?: string;          // e.g. "rounded-lg"
  variant?: 'person' | 'party';
};

export default function AvatarSquare({
  src,
  alt = '',
  size = 48,
  rounded = 'rounded-lg',
  variant = 'person',
}: Props) {
  const box = `relative flex items-center justify-center ${rounded} overflow-hidden shrink-0 bg-black/80 text-white`;

  return (
    <div className={box} style={{ width: size, height: size }}>
      {src ? (
        <Image
          src={src}
          alt={alt}
          width={size}
          height={size}
          className="object-cover"
        />
      ) : (
        <FallbackIcon variant={variant} size={size} />
      )}
    </div>
  );
}

function FallbackIcon({ variant, size = 48 }: { variant: 'person' | 'party'; size?: number }) {
  // Use currentColor for easy theming (white on dark bg)
  if (variant === 'party') {
    return (
      <svg viewBox="0 0 24 24" width={Math.round(size * 0.65)} height={Math.round(size * 0.65)} aria-hidden>
        {/* Civic building / parliament */}
        <path d="M3 19h18v2H3v-2Z" fill="currentColor"/>
        <path d="M5 15h14v2H5v-2Z" fill="currentColor"/>
        <path d="M7 11h10v2H7v-2Z" fill="currentColor"/>
        <path d="M6 11 12 6l6 5H6Z" fill="currentColor"/>
        <circle cx="12" cy="4.5" r="1.5" fill="currentColor"/>
      </svg>
    );
  }
  // person silhouette
  return (
    <svg viewBox="0 0 24 24" width={Math.round(size * 0.65)} height={Math.round(size * 0.65)} aria-hidden>
      <circle cx="12" cy="8" r="4" fill="currentColor"/>
      <path d="M4 20c0-4.2 3.8-7 8-7s8 2.8 8 7v1H4v-1Z" fill="currentColor"/>
    </svg>
  );
}
