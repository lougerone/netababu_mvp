// lib/partyStyles.ts
export const NATIONAL_PARTIES = [
  'Bharatiya Janata Party',
  'Indian National Congress',
  'Bahujan Samaj Party',
  'Communist Party of India (Marxist)',
  'Communist Party of India',
  'All India Trinamool Congress',
  'Aam Aadmi Party',
  'Nationalist Congress Party',
] as const;

type Theme = { bg: string; fg: string; border: string };

// Give it an index signature so FALLBACK[party] is valid
const FALLBACK: Record<string, Theme> = {
  'Bharatiya Janata Party': { bg: '#FFF3E8', fg: '#7A3A00', border: '#F8C9A4' },
  'Indian National Congress': { bg: '#E9F5FF', fg: '#0C4A6E', border: '#B9E1FF' },
  'Bahujan Samaj Party': { bg: '#EEF1FF', fg: '#1D2A8A', border: '#C9D1FF' },
  'Communist Party of India (Marxist)': { bg: '#FFEDEE', fg: '#7A0A12', border: '#FFC2C6' },
  'Communist Party of India': { bg: '#FFF0F1', fg: '#7A0A12', border: '#FFC7CB' },
  'All India Trinamool Congress': { bg: '#F1FFF9', fg: '#0F5132', border: '#C6F7E2' },
  'Aam Aadmi Party': { bg: '#F0F7FF', fg: '#1E3A8A', border: '#C7E0FF' },
  'Nationalist Congress Party': { bg: '#F3FFF7', fg: '#065F46', border: '#CFFAE2' },
};

// If you have a site-wide theme picker, it can override FALLBACK at runtime.
// This is only a type declaration; it's fine if it doesn't exist.
type MaybePickPartyTheme = ((party: string) => Theme | null) | undefined;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
declare const pickPartyTheme: MaybePickPartyTheme;

export function pillStyleFor(party: string): Theme {
  const t = typeof pickPartyTheme === 'function' ? pickPartyTheme(party) : null;
  return t ?? FALLBACK[party] ?? { bg: '#F5F5F5', fg: '#111827', border: '#E5E7EB' };
}
