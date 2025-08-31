// app/(site)/parties/page.tsx
import Link from "next/link";
import { listParties } from "@/lib/airtable";
import CardParty from "@/components/CardParty";

export const revalidate = Number(process.env.REVALIDATE_SECONDS || 3600);

export default async function PartiesPage({
  searchParams,
}: {
  searchParams?: { q?: string | string[] };
}) {
  // Normalize ?q= from URL to a single string (or undefined)
  const q =
    typeof searchParams?.q === "string"
      ? searchParams.q
      : Array.isArray(searchParams?.q)
      ? searchParams.q[0]
      : undefined;

  const parties = await listParties({ query: q, limit: 200 });

  return (
    <main className="mx-auto max-w-6xl p-6 space-y-6">
      <header className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Parties</h1>
          <p className="text-sm text-ink-600/80">
            {q ? (
              <>
                Showing results for <span className="font-medium">“{q}”</span> ·{" "}
                <span className="font-medium">{parties.length}</span>{" "}
                {parties.length === 1 ? "party" : "parties"}
              </>
            ) : (
              <>
                All parties · <span className="font-medium">{parties.length}</span>{" "}
                {parties.length === 1 ? "party" : "parties"}
              </>
            )}
          </p>
        </div>

        {/* Simple GET search form */}
        <form action="/parties" method="get" className="w-full max-w-xs">
          <label className="sr-only" htmlFor="q">
            Search parties
          </label>
          <input
            id="q"
            name="q"
            defaultValue={q ?? ""}
            placeholder="Search parties…"
            className="w-full rounded-md border border-ink-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-saffron-500"
          />
        </form>
      </header>

      {parties.length === 0 ? (
        <div className="text-sm text-ink-600">
          No parties found.{" "}
          {q ? (
            <>
              <Link href="/parties" className="underline">
                Clear search
              </Link>{" "}
              to see all.
            </>
          ) : null}
        </div>
      ) : (
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch">
  {parties.map(p => (
    <CardParty key={p.id} party={p} />
  ))}
</section>

      )}
    </main>
  );
}
