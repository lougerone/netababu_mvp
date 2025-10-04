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
  const m = s.match(/\(([A-Za-z0-9]{2,6})\)/);
  if (m) return m[1].toUpperCase();
  if (/^[A-Za-z0-9]{1,5}$/.test(s)) return s.toUpperCase();
  const ignore = new Set(['party', 'of', 'the', 'and', 'india', 'indian']);
  const letters = s
    .split(/[\s-]+/)
    .filter(Boolean)
    .filter((w) => !ignore.has(w.toLowerCase()))
    .map((w) => w[0])
    .join('')
    .toUpperCase();
  if (letters.length >= 2 && letters.length <= 6) return letters.slice(0, 5);
  return s.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 5);
}

type Props = {
  p: Politician;
  /** Turn on selection UI */
  selectMode?: boolean;
  /** Whether this card is currently selected */
  selected?: boolean;
  /** Toggle handler for the checkbox */
  onSelectToggle?: (slug: string) => void;
};

export default function CardPolitician({
  p,
  selectMode = false,
  selected = false,
  onSelectToggle,
}: Props) {
  const abbr = partyAbbr(p.party);
  const state = p.state ? String(p.state) : '';

  const CardInner = (
    <div className="relative card card-compact p-4 block border border-black/10 rounded-xl hover:border-black/20 transition-colors">
      {/* Selection checkbox */}
      {selectMode && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onSelectToggle?.(p.slug);
          }}
          aria-pressed={selected}
          aria-label={selected ? 'Unselect' : 'Select'}
          className={[
            'absolute right-2 top-2 h-6 w-6 rounded-md grid place-items-center',
            'border',
            selected ? 'bg-black text-white border-black' : 'bg-white/90 text-black/80 border-black/20',
            'shadow-sm hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/25',
          ].join(' ')}
        >
          {selected ? (
            // check icon
            <svg viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor">
              <path d="M16.707 5.293a1 1 0 0 1 0 1.414l-7.5 7.5a1 1 0 0 1-1.414 0l-3-3A1 1 0 1 1 6.293 10.793L8.5 13l6.793-6.793a1 1 0 0 1 1.414 0Z" />
            </svg>
          ) : (
            // plus icon
            <svg viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor">
              <path d="M9 3a1 1 0 1 1 2 0v6h6a1 1 0 1 1 0 2h-6v6a1 1 0 1 1-2 0v-6H3a1 1 0 1 1 0-2h6V3Z" />
            </svg>
          )}
        </button>
      )}

      <div className="flex items-start gap-3 min-w-0">
        <AvatarSquare
          src={p.photo ?? undefined}
          alt={p.name}
          size={64}
          rounded="rounded-xl"
          variant="person"
          label={p.name}
        />

        <div className="min-w-0 flex-1">
          <div className="font-semibold text-ink-800 truncate leading-5">{p.name}</div>
          <div className="text-xs text-ink-600/80 truncate">
            {abbr}
            {state ? ` • ${state}` : ''}
          </div>
          {p.current_position && (
            <div className="mt-0.5 text-xs text-ink-600 truncate">{p.current_position}</div>
          )}
        </div>
      </div>

      {/* Selected ring */}
      {selectMode && selected && (
        <div className="pointer-events-none absolute inset-0 rounded-xl ring-2 ring-black/60" />
      )}
    </div>
  );

  // Keep default behavior as a navigational card
  return selectMode ? (
    <div role="group" aria-label={`${p.name} card (selectable)`}>{CardInner}</div>
  ) : (
    <Link
      href={`/politicians/${p.slug}`}
      className="block"
      aria-label={`Open ${p.name} profile`}
      title={p.name}
      prefetch={false}
    >
      {CardInner}
    </Link>
  );
}
