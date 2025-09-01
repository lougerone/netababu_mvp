// app/about/page.tsx
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About — Netababu',
  description: 'What Netababu is, why it exists, and how the data is sourced.'
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <header className="space-y-2">
        <p className="h-kicker">About</p>
        <h1 className="text-3xl font-semibold h-underline">Netababu</h1>
        <p className="text-ink-600">
          A clean, credible reference for Indian political data—politicians, parties, timelines, and sources.
        </p>
      </header>

      <section className="card p-6 space-y-3">
        <h2 className="text-xl font-semibold">Mission</h2>
        <p>
          Make political information <strong>easy to find, verify, and share</strong>. Netababu organizes
          facts about politicians and parties, highlights verifiable sources, and helps people compare records without noise.
        </p>
      </section>

      <section className="card p-6 space-y-3">
        <h2 className="text-xl font-semibold">Data & Sources</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            Primary data is maintained in Airtable and synced to this site via our API layer.
          </li>
          <li>
            Each key fact aims to include a <em>verifiable</em> source (official sites, gazettes, affidavits, major publications).
          </li>
          <li>
            If you spot an error, please suggest a fix (see “Contribute” below).
          </li>
        </ul>
      </section>

      <section className="card p-6 space-y-3">
        <h2 className="text-xl font-semibold">Contribute</h2>
        <p>
          Want to add or correct a record? Open an issue or PR on our repo, or send us a note.
        </p>
        <div className="flex flex-wrap gap-3 text-sm">
          <Link href="https://github.com/" className="underline" target="_blank">GitHub</Link>
          <Link href="mailto:hello@netababu.com" className="underline">hello@netababu.com</Link>
        </div>
        <p className="text-xs text-ink-500">
          (If you prefer, replace contact details with your preferred email/Discord.)
        </p>
      </section>

      <section className="card p-6 space-y-3">
        <h2 className="text-xl font-semibold">Notes on Neutrality</h2>
        <p>
          We prioritize accuracy over opinion. Content is periodically reviewed and source-checked.
          Where records are disputed, we label them and link to multiple sources.
        </p>
      </section>
    </div>
  );
}
