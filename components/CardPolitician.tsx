// components/CardPolitician.tsx
import Link from 'next/link';
import AvatarSquare from './AvatarSquare';

export type Politician = {
  id: string;
  slug: string;
  name: string;
  party: string;
  state?: string | null;
  photo?: string | null;
  current_position?: string | null;
};

/* --- helpers --- */
function partyAbbr(raw: string | null | undefined): string {
  if (!raw) return '';
  const s = String(raw).trim();

  // 1) Prefer parentheses: e.g., "Bharatiya Janata Party (BJP)" -> "BJP"
  const m = s.match(/\(([A-Za-z0-9]{2,6})\)/);
  if (m) return m[1].toUpperCase();

  // 2) Already short alphanumeric token (<=5)
  if (/^[A-Za-z0-9]{1,5}$/.test(s)) return s.toUpperCase();

  // 3) Build from initial letters (ignore filler words)
  const ignore = new Set(['party', 'of', 'the', 'and', 'india', 'indian']);
  const letters = s
    .split(/[\s-]+/)
    .filter(Boolean)
    .filter((w) => !ignore.has(w.toLowerCase()))
    .map((w) => w[0])
    .join('')
    .toUpperCase();

  if (letters.length >= 2 && letters.length <= 6) return letters.slice(0, 5);

  // 4) Fallback: strip non-alphanumerics and slice
  return s.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 5);
}

export default function CardPolitician({ p }: { p: Politician }) {
  const abbr = partyAbbr(p.party);
  const state = p.state ? String(p.state) : '';

  return (
    <Link
      href={`/politicians/${p.slug}`}
      className="card card-compact p-4 block"
      aria-label={`Open ${p.name} profile`}
      title={p.name}
    >
      <div className="flex items-start gap-3 min-w-0">
        {/* Bigger, safe avatar */}
        <AvatarSquare
          src={p.photo ?? undefined}
          alt={p.name}
          size={64}                // ← bigger image
          rounded="rounded-xl"
          variant="person"
          label={p.name}
        />

        <div className="min-w-0 flex-1">
          {/* Row 1: Name */}
          <div className="font-semibold text-ink-800 truncate leading-5">
            {p.name}
          </div>

          {/* Row 2: Party ABBR • State */}
          <div className="text-xs text-ink-600/80 truncate">
            {abbr}
            {state ? ` • ${state}` : ''}
          </div>

          {/* Row 3: Current position (if any) */}
          {p.current_position && (
            <div className="mt-0.5 text-xs text-ink-600 truncate">
              {p.current_position}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
