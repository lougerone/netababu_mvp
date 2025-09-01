// components/AvatarSquare.tsx
import Image from 'next/image';

export default function AvatarSquare({
  src,
  alt,
  size = 48, // px
  rounded = 'lg', // 'md' | 'lg' | 'xl' etc.
}: { src?: string; alt: string; size?: number; rounded?: string }) {
  return (
    <div
      className={`relative overflow-hidden bg-cream-200 rounded-${rounded}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <Image
        src={src || '/placeholder-avatar.png'}
        alt={alt}
        fill
        sizes={`${size}px`}
        className="object-cover object-top" // crops bottom if too tall
        priority={false}
      />
    </div>
  );
}
