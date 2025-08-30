// app/politicians/[slug]/page.tsx
import Image from "next/image";
import { getPoliticianBySlug, allPoliticianSlugs } from "@/lib/airtable";

export const revalidate = Number(process.env.REVALIDATE_SECONDS || 3600);

export async function generateStaticParams() {
  const slugs = await allPoliticianSlugs();
  return slugs.slice(0, 2000).map((slug) => ({ slug })); // limit if huge
}

export default async function PoliticianPage({ params }: { params: { slug: string } }) {
  const p = await getPoliticianBySlug(params.slug);

  if (!p) {
    // optional: return notFound() to show Next 404
    return <div className="mx-auto max-w-3xl p-6">Not found.</div>;
  }

  return (
    <main className="mx-auto max-w-3xl p-6 space-y-6">
      <header className="flex items-start gap-4">
        {p.photo?.url ? (
          <Image src={p.photo.url} alt={p.name} width={96} height={96} className="rounded-lg object-cover" />
        ) : (
          <div className="w-24 h-24 rounded-lg bg-black/10" />
        )}
        <div>
          <h1 className="text-2xl font-semibold">{p.name}</h1>
          {p.dob && <p className="text-sm text-black/60">DOB: {p.dob}</p>}
          {!!p.offices?.length && (
            <p className="text-sm">{p.offices.join(" • ")}</p>
          )}
        </div>
      </header>

      {p.life_events && (
        <section>
          <h2 className="text-lg font-semibold mb-2">Key Life Events</h2>
          <div className="prose prose-sm max-w-none whitespace-pre-line">{p.life_events}</div>
        </section>
      )}

      {!!p.links?.length && (
        <section>
          <h2 className="text-lg font-semibold mb-2">Links</h2>
          <ul className="list-disc pl-5 space-y-1">
            {p.links.map((x, i) => (
              <li key={i}><a className="underline" href={x} target="_blank" rel="noreferrer">{x}</a></li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
