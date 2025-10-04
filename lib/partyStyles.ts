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
];

// Fallback colors (replace with your site tokens if you have them)
const FALLBACK = {
  'Bharatiya Janata Party': { bg: '#FFF3E8', fg: '#7A3A00', border: '#F8C9A4' },
  'Indian National Congress': { bg: '#E9F5FF', fg: '#0C4A6E', border: '#B9E1FF' },
  'Bahujan Samaj Party': { bg: '#EEF1FF', fg: '#1D2A8A', border: '#C9D1FF' },
  'Communist Party of India (Marxist)': { bg: '#FFEDEE', fg: '#7A0A12', border: '#FFC2C6' },
  'Communist Party of India': { bg: '#FFF0F1', fg: '#7A0A12', border: '#FFC7CB' },
  'All India Trinamool Congress': { bg: '#F1FFF9', fg: '#0F5132', border: '#C6F7E2' },
  'Aam Aadmi Party': { bg: '#F0F7FF', fg: '#1E3A8A', border: '#C7E0FF' },
  'Nationalist Congress Party': { bg: '#F3FFF7', fg: '#065F46', border: '#CFFAE2' },
} as const;

type Theme = { bg: string; fg: string; border: string };

// If you already have a site-wide theme util, wire it here:
type MaybePickPartyTheme = ((party: string) => Theme | null) | undefined;
// @ts-ignore – provide this in your codebase if it exists
declare const pickPartyTheme: MaybePickPartyTheme;

export function pillStyleFor(party: string): Theme {
  const t = typeof pickPartyTheme === 'function' ? pickPartyTheme(party) : null;
  return t ?? FALLBACK[party] ?? { bg: '#F5F5F5', fg: '#111827', border: '#E5E7EB' };
}
