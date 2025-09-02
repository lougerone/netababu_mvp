'use client';

import { useMemo, useState } from 'react';

type ShareStat = {
  key: string;       // e.g. 'Attendance'
  value: string;     // e.g. '83'
  suffix?: string;   // e.g. '%'
};

type Props = {
  slug: string;
  name: string;
  party: string;
  photo?: string | null;
  stats: ShareStat[];
  /**
   * Which share targets to render.
   * Defaults to ['x','whatsapp'] for a compact UI.
   */
  only?: ('x' | 'whatsapp')[];
};

export default function ShareSheet({
  slug,
  name,
  party,
  photo,
  stats,
  only = ['x', 'whatsapp'],
}: Props) {
  const [selected, setSelected] = useState(0);

  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (typeof window !== 'undefined' ? window.location.origin : '');

  const shareUrl = useMemo(() => {
    const s = stats[selected];
    const url = new URL(`${baseUrl}/politicians/${slug}/share`);
    url.searchParams.set('name', name);
    url.searchParams.set('party', party);
    if (photo) url.searchParams.set('photo', photo);
    url.searchParams.set('statKey', s.key);
    url.searchParams.set('statValue', s.value);
    if (s.suffix) url.searchParams.set('statSuffix', s.suffix);
    return url.toString();
  }, [baseUrl, slug, name, party, photo, stats, selected]);

  const onX = () => {
    const s = stats[selected];
    const text = encodeURIComponent(`${name} — ${s.key}: ${s.value}${s.suffix || ''} #Netababu`);
    const u = encodeURIComponent(shareUrl);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${u}`, '_blank', 'noopener,noreferrer');
  };

  const onWhatsApp = () => {
    const s = stats[selected];
    const text = encodeURIComponent(`${name} — ${s.key}: ${s.value}${s.suffix || ''}\n${shareUrl}`);
    window.open(`https://wa.me/?text=${text}`, '_blank', 'noopener,noreferrer');
  };

  // Small, streamlined UI
  return (
    <div className="flex flex-col gap-3">
      {/* stat picker – compact */}
      {stats.length > 1 ? (
        <label className="text-sm flex items-center gap-2">
          <span className="text-black/70">Share stat:</span>
          <select
            value={selected}
            onChange={(e) => setSelected(Number(e.target.value))}
            className="rounded-md border border-black/10 bg-white/80 text-sm px-2 py-1"
          >
            {stats.map((s, i) => (
              <option key={i} value={i}>
                {s.key}: {s.value}
                {s.suffix || ''}
              </option>
            ))}
          </select>
        </label>
      ) : (
        <div className="text-sm text-black/70">
          Share stat: <span className="font-medium">
            {stats[0].key}: {stats[0].value}{stats[0].suffix || ''}
          </span>
        </div>
      )}

      {/* buttons – only X + WhatsApp */}
      <div className="flex items-center gap-2">
        {only.includes('x') && (
          <button
            onClick={onX}
            className="px-3 py-1.5 rounded-md bg-black text-white text-sm"
            aria-label="Share on X"
          >
            Share on X
          </button>
        )}
        {only.includes('whatsapp') && (
          <button
            onClick={onWhatsApp}
            className="px-3 py-1.5 rounded-md text-white text-sm"
            style={{ backgroundColor: '#25D366' }}
            aria-label="Share on WhatsApp"
          >
            WhatsApp
          </button>
        )}
      </div>

      {/* tiny helper: display current share URL (truncated) */}
      <div className="text-xs text-black/50 break-all">
        {shareUrl.length > 120 ? `${shareUrl.slice(0, 120)}…` : shareUrl}
      </div>
    </div>
  );
}
