// app/parties/[slug]/page.tsx
import Image from "next/image";
import { getPartyBySlug, allPartySlugs } from "@/lib/airtable";

export const revalidate = Number(process.env.REVALIDATE_SECONDS || 3600);

export async function generateStaticParams() {
  const slugs = await allPartySlugs();
  return slugs.slice(0, 2000).map((slug) => ({ slug }));
}

export default async function PartyPage({ params }: { params: { slug: string } }) {
  const p = await getPartyBySlug(params.slug);
  if (!p) {
    return <div className="mx-auto max-w-3xl p-6">Not found.</div>;
  }

  return (
    <main className="mx-auto max-w-3xl p-6 space-y-6">
      <header className="flex items-start gap-4">
        {p.logo ? (
          <Image
            src={p.logo}
            alt={`${p.name} logo`}
            width={96}
            height={96}
            className="rounded-lg object-contain bg-white p-2"
          />
        ) : (
          <div className="w-24 h-24 rounded-lg bg-black/10" />
        )}

        <div>
          <h1 className="text-2xl font-semibold">{p.name}</h1>
          <p className="text-sm text-black/60">
            {p.founded ? `Founded: ${p.founded}` : null}
            {p.status ? `${p.founded ? " • " : ""}Status: ${p.status}` : null}
          </p>
          {!!p.leaders?.length && (
            <p className="text-sm">Leaders: {p.leaders.join(", ")}</p>
          )}
        </div>
      </header>
    </main>
  );
}
