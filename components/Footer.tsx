// components/Footer.tsx
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-black/10">
      <div className="mx-auto max-w-6xl px-4 py-8 grid gap-8 md:grid-cols-4">
        <div>
          <div className="font-semibold text-ink-700">Netababu</div>
          <p className="mt-2 text-sm text-ink-600/80">
            Public, neutral, and source-driven political data. Not affiliated with any party, leader, or government.
          </p>
        </div>

        <nav>
          <div className="mb-2 font-medium">Explore</div>
          <ul className="space-y-1 text-sm">
            <li><Link href="/" className="hover:underline">Home</Link></li>
            <li><Link href="/politicians" className="hover:underline">Politicians</Link></li>
            <li><Link href="/parties" className="hover:underline">Parties</Link></li>
            <li><Link href="/compare" className="hover:underline">Compare</Link></li>
          </ul>
        </nav>

        <nav>
          <div className="mb-2 font-medium">Legal</div>
          <ul className="space-y-1 text-sm">
            <li><Link href="/legal/terms" className="hover:underline">Terms of Use</Link></li>
            <li><Link href="/legal/privacy" className="hover:underline">Privacy Policy</Link></li>
            <li><Link href="/legal/editorial" className="hover:underline">Editorial &amp; Corrections</Link></li>
            <li><Link href="/legal/takedown" className="hover:underline">Takedown &amp; Grievance</Link></li>
          </ul>
        </nav>

        <div>
          <div className="mb-2 font-medium">Contact</div>
          <ul className="space-y-1 text-sm">
            <li><a href="mailto:hello@netababu.com" className="hover:underline">hello@netababu.com</a></li>
          </ul>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mx-auto max-w-6xl px-4 pb-4 text-xs text-ink-600/80">
        <p>
          <strong>Disclaimer:</strong> While we strive to ensure accuracy and completeness, Netababu provides all information on an
          <em> “as is” </em> and <em>“as available”</em> basis for general information and public-interest purposes only. We make no
          representations or warranties of any kind—express or implied—about the accuracy, completeness, reliability, suitability, or
          timeliness of any content. Your use of the site and reliance on any information is at your own risk. To the fullest extent
          permitted by law, Netababu disclaims all liability for errors, omissions, or any loss or damage arising from or in connection
          with the use of the site or its content. Party names, symbols, and person names are used for identification only; no
          endorsement is implied.
        </p>
      </div>

      <div className="mx-auto max-w-6xl px-4 pb-8 text-xs text-ink-600/70">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>© {new Date().getFullYear()} Netababu. Some content may be available under CC BY-SA / CC0 as noted.</div>
          <div>For identification only. No endorsement implied.</div>
        </div>
      </div>
    </footer>
  );
}
