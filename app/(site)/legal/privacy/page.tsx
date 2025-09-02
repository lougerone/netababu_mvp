export const dynamic = 'force-dynamic';

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 space-y-8">
      <h1 className="text-3xl font-bold">Privacy Policy</h1>
      <p className="text-ink-700">
        This notice explains how Netababu.com (“we/us”) handles personal data in line with Indian
        data-protection obligations. Contact us at <strong>[privacy@netababu.com]</strong> or
        <strong> [POSTAL ADDRESS]</strong>.
      </p>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">Data we process</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>Publicly available information about public figures and parties.</li>
          <li>Technical/usage data (device, pages visited, timestamps) to run analytics and prevent abuse.</li>
          <li>Details you send us (tips, corrections, grievances, media requests).</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">Why we process it</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>Publish and improve current-affairs content.</li>
          <li>Operate, secure, and debug our services.</li>
          <li>Respond to legal requests, grievances, and corrections.</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">Your rights</h2>
        <p>
          You may request access, correction, or erasure of your personal data. Email
          <strong> [privacy@netababu.com]</strong>. We acknowledge within <strong>24 hours</strong>
          and provide a decision or update within <strong>15 days</strong> (or explain if additional
          time is needed for complex matters).
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">Children</h2>
        <p>
          We do not knowingly profile children or serve behaviorally targeted advertising to them.
          If you believe we have children’s personal data, contact us for prompt review and action.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">Security & retention</h2>
        <p>
          We use reasonable safeguards to protect data and retain it only as long as necessary for
          our purposes or legal requirements. If a personal-data breach is likely to affect you,
          we will notify you and the appropriate authority as required by law.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">Sources & attribution</h2>
        <p>
          We cite sources and licenses where feasible. Some text may be under CC BY-SA 4.0; some
          datasets may be CC0; original Netababu content is © Netababu or its contributors.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">Contact & Grievances</h2>
        <p>
          Privacy queries: <strong>[privacy@netababu.com]</strong>. Grievances:{" "}
          <strong>[go@netababu.com]</strong> (Grievance Officer: <strong>[NAME]</strong>,
          Address: <strong>[POSTAL ADDRESS]</strong>).
        </p>
      </section>

      <p className="text-sm text-ink-600/80">Last updated: [DATE]</p>
    </main>
  );
}
