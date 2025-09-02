export const dynamic = 'force-dynamic';

export default function TakedownPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 space-y-8">
      <h1 className="text-3xl font-bold">Takedown & Grievance Policy</h1>
      <p>
        If you believe content on Netababu infringes your rights, is defamatory, violates privacy,
        or is otherwise unlawful, please email <strong>[go@netababu.com]</strong>. We acknowledge in{" "}
        <strong>24 hours</strong> and generally decide within <strong>15 days</strong>.
      </p>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">What to include</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>Your full name, role/relationship to the matter, and contact details.</li>
          <li>Exact URL(s) and a description of the issue.</li>
          <li>Legal basis (copyright, trademark, privacy, defamation, other) with supporting evidence.</li>
          <li>
            For copyright: proof of ownership or authority. For privacy: identity proof and what you
            want removed/edited. For defamation: the allegedly false statement and why it is false.
          </li>
          <li>A good-faith statement and your electronic signature.</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">What we may do</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>Remove, correct, or add context; or decline with reasons.</li>
          <li>Request clarifications or additional evidence.</li>
          <li>Preserve and share records with authorities where legally required.</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">Grievance Officer</h2>
        <p>
          <strong>[NAME]</strong>, <strong>[POSTAL ADDRESS]</strong>,{" "}
          <strong>[go@netababu.com]</strong>
        </p>
      </section>

      <p className="text-sm text-ink-600/80">Last updated: [DATE]</p>
    </main>
  );
}
