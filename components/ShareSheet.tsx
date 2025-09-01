'use client';

import { useMemo, useState } from 'react';

type Props = {
  slug: string;
  name: string;
  party: string;
  state?: string | null;
  photo?: string | null;
  stats: Array<{
    key: string;       // e.g. 'Attendance'
    value: string;     // e.g. '87'
    suffix?: string;   // e.g. '%'
  }>;
};

export default function ShareSheet({ slug, name, party, state, photo, stats }: Props) {
  const [selected, setSelected] = useState(0);

  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || (typeof window !== 'undefined' ? window.location.origin : '');

  const shareUrl = useMemo(() => {
    const s = stats[selected];
    const url = new URL(`${baseUrl}/p/${slug}/share`);
    url.searchParams.set('name', name);
    url.searchParams.set('party', party);
    if (state) url.searchParams.set('state', state);
    if (photo) url.searchParams.set('photo', photo);
    url.searchParams.set('statKey', s.key);
    url.searchParams.set('statValue', s.value);
    if (s.suffix) url.searchParams.set('statSuffix', s.suffix);
    return url.toString();
  }, [baseUrl, slug, name, party, state, photo, stats, selected]);

  const doNativeShare = async () => {
    const s = stats[selected];
    const text = `${name} — ${s.key}: ${s.value}${s.suffix || ''} • via Netababu`;
    if (navigator.share) {
      try {
        await navigator.share({ url: shareUrl, title: document.title, text });
      } catch { /* user canceled */ }
    } else {
      await navigator.clipboard.writeText(shareUrl);
      alert('Share link copied to clipboard.');
    }
  };

  const openX = () => {
    const s = stats[selected];
    const text = encodeURIComponent(`${name} — ${s.key}: ${s.value}${s.suffix || ''} #Netababu`);
    const u = encodeURIComponent(shareUrl);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${u}`, '_blank');
  };

  const openWhatsApp = () => {
    const s = stats[selected];
    const text = encodeURIComponent(`${name} — ${s.key}: ${s.value}${s.suffix || ''}\n${shareUrl}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const openLinkedIn = () => {
    const u = encodeURIComponent(shareUrl);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${u}`, '_blank');
  };

  return (
    <div className="card p-4 space-y-3">
      <div className="text-sm opacity-70">Share a stat</div>
      <select
        value={selected}
        onChange={(e) => setSelected(Number(e.target.value))}
        className="w-full rounded-lg border border-black/10 bg-white/80 text-ink-700 px-3 py-2"
      >
        {stats.map((s, i) => (
          <option key={i} value={i}>
            {s.key}: {s.value}
            {s.suffix || ''}
          </option>
        ))}
      </select>

      <div className="flex gap-2">
        <button onClick={doNativeShare} className="px-3 py-2 rounded-lg bg-ink-700 text-cream">
          Share
        </button>
        <button onClick={openX} className="px-3 py-2 rounded-lg bg-black/80 text-white">
          X
        </button>
        <button onClick={openWhatsApp} className="px-3 py-2 rounded-lg bg-[#25D366] text-white">
          WhatsApp
        </button>
        <button onClick={openLinkedIn} className="px-3 py-2 rounded-lg bg-[#0A66C2] text-white">
          LinkedIn
        </button>
      </div>

      <div className="text-xs break-all opacity-60">{shareUrl}</div>
    </div>
  );
}
