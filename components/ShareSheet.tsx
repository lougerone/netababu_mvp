// components/ShareSheet.tsx
'use client';

import { useMemo, useState } from 'react';

type Stat = { key: string; value: string; suffix?: string };

export default function ShareSheet({
  slug,
  name,
  party,
  photo,
  stats,
  only = ['x', 'whatsapp'],
  multi = false,
}: {
  slug: string;
  name: string;
  party?: string;
  photo?: string | null;
  stats: Stat[];
  only?: Array<'x' | 'whatsapp'>;
  multi?: boolean;
}) {
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  const selectedStats = useMemo(
    () => stats.filter(s => selected[s.key]),
    [stats, selected]
  );

  const shareText = useMemo(() => {
    const parts = selectedStats.length
      ? selectedStats.map(s => `${s.key}: ${s.value}${s.suffix ?? ''}`)
      : [];
    const head = `${name}${party ? ` (${party})` : ''}`;
    const body = parts.length ? ` – ${parts.join(' · ')}` : '';
    return `${head}${body}`;
  }, [name, party, selectedStats]);

  // Build a share image (OG) URL that includes the photo + chosen stats
  const ogUrl = useMemo(() => {
    const params = new URLSearchParams();
    params.set('name', name);
    if (party) params.set('party', party);
    if (photo) params.set('photo', photo);
    if (selectedStats.length) {
      params.set('stats', selectedStats.map(s => `${s.key}:${s.value}${s.suffix ?? ''}`).join('|'));
    }
    return `/api/share/og?${params.toString()}`;
  }, [name, party, photo, selectedStats]);

  const pageUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/politicians/${slug}`
    : `https://www.netababu.com/politicians/${slug}`;

  const shareUrlWithImage = useMemo(() => {
    // Add ?og=<encoded> so a downstream short link or card page can adopt it if needed
    const u = new URL(pageUrl);
    u.searchParams.set('og', ogUrl);
    return u.toString();
  }, [pageUrl, ogUrl]);

  const shareToX = () => {
    const u = new URL('https://twitter.com/intent/tweet');
    u.searchParams.set('text', shareText);
    u.searchParams.set('url', shareUrlWithImage);
    window.open(u.toString(), '_blank', 'noopener,noreferrer');
  };

  const shareToWhatsApp = () => {
    const u = new URL('https://api.whatsapp.com/send');
    u.searchParams.set('text', `${shareText}\n${shareUrlWithImage}`);
    window.open(u.toString(), '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-3">
      {/* Multi-select checklist */}
      {multi && (
        <div className="rounded-xl border border-black/10 p-3">
          <div className="text-xs font-medium mb-2 text-black/60">Pick stats to include</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {stats.map(s => (
              <label key={s.key} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  className="accent-saffron-500"
                  checked={!!selected[s.key]}
                  onChange={e => setSelected(prev => ({ ...prev, [s.key]: e.target.checked }))}
                />
                <span className="truncate">{s.key}: <span className="text-black/70">{s.value}{s.suffix ?? ''}</span></span>
              </label>
            ))}
          </div>

          {/* Tiny preview row */}
          <div className="mt-3 flex items-center gap-3">
            <div className="w-20 h-12 rounded-md overflow-hidden bg-black/5 border border-black/10">
              {/* preview image (server generates) */}
              <img src={ogUrl} alt="share preview" className="w-full h-full object-cover" />
            </div>
            <div className="text-xs text-black/60 line-clamp-2">{shareText}</div>
          </div>
        </div>
      )}

      {/* Buttons */}
      <div className="flex items-center gap-2">
        {only.includes('x') && (
          <button onClick={shareToX} className="btn">Share on X</button>
        )}
        {only.includes('whatsapp') && (
          <button onClick={shareToWhatsApp} className="btn-ghost">WhatsApp</button>
        )}
      </div>

      {/* Raw link (for copying if needed) */}
      <p className="text-xs text-black/40 break-all">{shareUrlWithImage}</p>
    </div>
  );
}
