// components/AvatarSquare.tsx
import Image from 'next/image';

const roundedMap: Record<'md'|'lg'|'xl','rounded-md'|'rounded-lg'|'rounded-xl'> = {
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
  src?: string;
  alt: string;
  size?: number;        // 48, 56, etc.
  rounded?: 'md'|'lg'|'xl';
}) {
  const round = roundedMap[rounded];
  const px = `${size}px`;
  return (
    <div
      className={`relative overflow-hidden bg-cream-200 ${round} shrink-0 flex-none`}
      style={{ width: px, height: px }}
      aria-hidden="true"
    >
      <Image
        src={src || '/placeholder-avatar.png'}
        alt={alt}
        fill
        sizes={px}
        className="object-cover object-top"
        priority={false}
      />
    </div>
  );
}
