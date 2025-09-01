// components/AvatarSquare.tsx
import Image from 'next/image';

const roundedMap: Record<string, string> = {
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
};

export default function AvatarSquare({
  src,
  alt,
  size = 48,
  rounded = 'lg',
}: {
  src?: string | null;
  alt: string;
  size?: number; // 48, 56, etc.
  rounded?: 'md' | 'lg' | 'xl';
}) {
  const round = roundedMap[rounded] || 'rounded-lg';
  const px = `${size}px`;

  // Guarantee we never pass an empty/undefined src to <Image>
  const safeSrc =
    typeof src === 'string' && src.trim().length > 0
      ? src
      : '/placeholder-avatar.png';

  return (
    <div
      className={`relative overflow-hidden bg-cream-200 ${round} shrink-0 flex-none`}
      style={{ width: px, height: px }}
      aria-hidden="true"
    >
      <Image
        src={safeSrc}
        alt={alt}
        fill
        sizes={`${size}px`}
        className="object-cover object-top"
        priority={false}
      />
    </div>
  );
}
