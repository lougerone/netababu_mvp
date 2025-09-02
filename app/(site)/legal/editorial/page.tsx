export const dynamic = 'force-dynamic';

export default function EditorialPolicyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 space-y-8">
      <h1 className="text-3xl font-bold">Editorial & Corrections Policy</h1>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">Standards</h2>
        <p>
          We rely on verifiable, publicly available sources. We separate fact from opinion and
          timestamp updates where feasible. Our goal is fairness, clarity, and context.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">Corrections</h2>
        <p>
          If you find an error, email <strong>[corrections@netababu.com]</strong> with evidence and
          the URL. We acknowledge in <strong>24 hours</strong> and update, correct, add context, or
          explain our decision within <strong>15 days</strong>.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">Right of reply</h2>
        <p>
          Public figures may submit a concise statement with citations for context. Publication is
          at our editorial discretion; we may edit for length, clarity, and legality.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">Legal notes</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>We avoid unverified allegations and clearly label satire or opinion.</li>
          <li>We do not imply endorsement by any person or organization.</li>
          <li>
            Party names, logos, and symbols are used only for identification; rights belong to their
            respective owners.
          </li>
        </ul>
      </section>

      <p className="text-sm text-ink-600/80">Last updated: [DATE]</p>
    </main>
  );
}
