// app/(site)/parties/[slug]/page.tsx
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { getPartyBySlug } from "@/lib/airtable";
import AvatarSquare from "@/components/AvatarSquare";
import { pickPartyLogoUrl } from "@/lib/data";

export const dynamic = "force-dynamic"; // match politicians page behavior

type ExtParty = Record<string, any> & {
  id: string;
  slug: string;
  name: string;
  abbr?: string | null;
  status?: string | null;
  state?: string | null;
  founded?: string | null;
  logo?: string | null;
  leaders?: string[];
  symbolText?: string | null;
  seats?: number | string | null;
  details?: string | null;
};

export default async function PartyPage({ params }: { params: { slug: string } }) {
  // Robust decode for special chars like NCP(SP)
  const raw = Array.isArray(params.slug) ? params.slug.join("/") : params.slug;
  const slug = decodeURIComponent(raw);

  let p: ExtParty | null = null;
  try {
    p = (await getPartyBySlug(slug)) as ExtParty | null;
  } catch (err) {
    console.error("getPartyBySlug failed", { slug, err });
    // Proper 404 rather than soft "Not found"
    notFound();
  }

  if (!p) notFound();

  // Direct (no-proxy) logo URL
  const logo = pickPartyLogoUrl(p as any);

  const isEmpty = (v: any) =>
    v == null ||
    (typeof v === "string" && v.trim() === "") ||
    (Array.isArray(v) && v.length === 0);

  const formatValue = (v: any): ReactNode => {
    if (isEmpty(v)) return "—";
    if (Array.isArray(v)) {
      if (v[0] && typeof v[0] === "object" && ("url" in v[0] || "filename" in v[0])) {
        return (
          <ul className="space-y-1">
            {v.map((a: any, i: number) => (
              <li key={i}>
                {"url" in a ? (
                  <a
                    className="underline hover:no-underline"
                    href={a.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {a.filename || a.name || `File ${i + 1}`}
                  </a>
                ) : (
                  String(a.filename || a.name || `File ${i + 1}`)
                )}
              </li>
            ))}
          </ul>
        );
      }
      return v
        .map((x: any) => (typeof x === "object" && x && "name" in x ? String(x.name) : String(x)))
        .filter(Boolean)
        .join(", ");
    }
    if (typeof v === "object" && v) {
      if ("name" in v) return String((v as any).name);
      if ("url" in v) {
        const a = v as any;
        return (
          <a
            className="underline hover:no-underline"
            href={a.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            {a.filename || a.url}
          </a>
        );
      }
      try {
        return JSON.stringify(v);
      } catch {
        return String(v);
      }
    }
    return String(v);
  };

  // fields to hide from the generic table (already shown or noisy)
  const EXCLUDE = new Set<string>([
    // technical
    "id",
    "createdTime",
    "Created",
    "slug",
    "Slug",
    // already surfaced/normalized
    "name",
    "Name",
    "Party",
    "Party Name",
    "party_name",
    "Logo",
    "logo",
    "Symbol",
    "Emblem",
    "Image",
    "Attachments",
    "abbr",
    "Abbreviation",
    "Short Name",
    "Acronym",
    "ticker",
    "Ticker",
    "status",
    "Recognition",
    "Type",
    "state",
    "State",
    "State Name",
    "Home State",
    "Region",
    "founded",
    "Founded",
    "Date of Establishment",
    "Year Founded",
    "Established",
    "Formed",
    "Year",
    "D.",
    "leaders",
    "Leader",
    "Leaders",
    "Key Leader(s)",
    "seats",
    "Lok Sabha Seats",
    "Lok Sabha Seats (2024)",
    "Lok Sabha Seats (20)",
    "symbolText",
    "Attachment Summary",
    "Symbol Name",
    "details",
    "Details",
  ]);

  const allEntries = Object.entries(p)
    .filter(([k, v]) => !EXCLUDE.has(k) && !isEmpty(v) && typeof v !== "function")
    .sort(([a], [b]) => a.localeCompare(b));

  const rajyaSeats = (p as any)["Rajya Sabha Seats"];

  return (
    <main className="mx-auto max-w-3xl p-6 space-y-8">
      {/* Header */}
      <header className="flex items-start gap-4">
        {logo ? (
          <AvatarSquare
            variant="party"
            src={logo}
            alt={`${p.name} logo`}
            size={96}
            rounded="rounded-lg"
            label={p.abbr || p.name}
          />
        ) : (
          <div className="w-24 h-24 rounded-lg bg-black/10" />
        )}

        <div className="min-w-0">
          <h1 className="text-2xl font-semibold">{p.name}</h1>
          <p className="text-sm text-black/60">
            {[p.abbr, p.status].filter(Boolean).join(" • ") || "—"}
          </p>
          {!!p.leaders?.length && (
            <p className="text-sm mt-1">Leaders: {p.leaders.join(", ")}</p>
          )}
        </div>
      </header>

      {/* Quick facts */}
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {p.founded && (
          <div className="rounded-lg border border-black/10 bg-white/40 p-3">
            <div className="text-[11px] uppercase tracking-wide text-black/60">Founded</div>
            <div className="text-sm font-medium">{p.founded}</div>
          </div>
        )}
        {p.state && (
          <div className="rounded-lg border border-black/10 bg-white/40 p-3">
            <div className="text-[11px] uppercase tracking-wide text-black/60">State</div>
            <div className="text-sm font-medium">{p.state}</div>
          </div>
        )}
        {p.seats != null && (
          <div className="rounded-lg border border-black/10 bg-white/40 p-3">
            <div className="text-[11px] uppercase tracking-wide text-black/60">Lok Sabha Seats</div>
            <div className="text-sm font-medium">{String(p.seats)}</div>
          </div>
        )}
        {rajyaSeats != null && (
          <div className="rounded-lg border border-black/10 bg-white/40 p-3">
            <div className="text-[11px] uppercase tracking-wide text-black/60">Rajya Sabha Seats</div>
            <div className="text-sm font-medium">{formatValue(rajyaSeats)}</div>
          </div>
        )}
        {p.symbolText && (
          <div className="rounded-lg border border-black/10 bg-white/40 p-3 sm:col-span-2">
            <div className="text-[11px] uppercase tracking-wide text-black/60">Symbol</div>
            <div className="text-sm">{p.symbolText}</div>
          </div>
        )}
      </section>

      {/* All Airtable fields */}
      {allEntries.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-3">All fields</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {allEntries.map(([key, val]) => (
              <div key={key} className="rounded-lg border border-black/10 bg-white/40 p-3">
                <div className="text-[11px] uppercase tracking-wide text-black/60">{key}</div>
                <div className="text-sm break-words">{formatValue(val)}</div>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
