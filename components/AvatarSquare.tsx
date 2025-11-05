// components/AvatarSquare.tsx
'use client'

import Image from 'next/image';
import { useMemo, useState } from 'react';

/** Allowed direct hosts (Airtable + Wiki) */
const ALLOWED_HOSTS = new Set<string>([
  'v5.airtableusercontent.com',
  'dl.airtable.com',
  'upload.wikimedia.org',
  'images.wikimedia.org',
]);

/** Host suffixes that should be allowed (covers all Airtable attachment subdomains) */
const ALLOWED_SUFFIXES = ['.airtableusercontent.com'];

function isAllowedSrc(src?: string | null): string | undefined {
  if (!src) return undefined;
  if (src.startsWith('/')) return src;      // public asset in /public
  if (src.startsWith('data:')) return src;  // data URI (e.g. embedded SVG)

  try {
    const { hostname } = new URL(src);
    // Accept exact hosts or any hostname ending with an allowed suffix
    if (ALLOWED_HOSTS.has(hostname) ||
        ALLOWED_SUFFIXES.some((sfx) => hostname.endsWith(sfx))) {
      return src;
    }
    return undefined;
  } catch {
    return undefined;
  }
}
