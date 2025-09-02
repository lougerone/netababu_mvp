export const dynamic = 'force-dynamic';

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 space-y-8">
      <h1 className="text-3xl font-bold">Terms of Use</h1>
      <p className="text-ink-700">
        Netababu.com (“<strong>Netababu</strong>”, “we”, “us”) publishes public-interest information
        about Indian politics. By accessing or using this website, you agree to these Terms.
        If you do not agree, please do not use the site.
      </p>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">1) No affiliation / endorsement</h2>
        <p>
          Netababu is not affiliated with any political party, candidate, government body, or
          platform. Party names, logos, emblems, and candidate names are used solely for
          identification and nominative reference. No endorsement is implied.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">2) Content & accuracy</h2>
        <p>
          We collect, transform, and present information from public sources. While we strive for
          accuracy, content is provided <em>“as is”</em> and may contain errors or be incomplete,
          delayed, or superseded. You are responsible for independently verifying critical facts.
          Nothing on this site is legal, financial, or professional advice.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">3) Your use of our site</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>Do not scrape, spam, attack, or disrupt the site or other users.</li>
          <li>Do not upload, transmit, or request publication of unlawful, infringing, or defamatory material.</li>
          <li>
            You may link to our pages with fair, non-misleading context. Framing or mirroring the
            site without permission is not allowed.
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">4) Licenses & attribution</h2>
        <p>
          Where noted, some text is available under CC BY-SA 4.0 with attribution; some datasets
          may originate from CC0 sources; and original Netababu content is © Netababu or its
          contributors. If you reuse CC BY-SA material from us, you must preserve attribution and
          share-alike terms. Third-party rights remain with their owners.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">5) Changes, takedowns & availability</h2>
        <p>
          We may change or remove content or features at any time. We may restrict access for abuse
          or legal reasons. See our Takedown & Grievance Policy for how to report issues.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">6) Disclaimers & liability</h2>
        <p>
          To the maximum extent permitted by law, we disclaim all warranties and exclude liability
          for indirect or consequential loss. Our total liability for any claim related to the site
          will not exceed INR 1,000.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">7) Governing law & venue</h2>
        <p>
          These Terms are governed by the laws of India. Courts at <strong>[CITY / JURISDICTION]</strong>
          shall have exclusive jurisdiction.
        </p>
      </section>

      <p className="text-sm text-ink-600/80">Last updated: [DATE]</p>
    </main>
  );
}
