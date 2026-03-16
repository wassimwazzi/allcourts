import { DiscoverExperience } from "@/components/discover-experience";
import { SectionHeader } from "@/components/section-header";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getDiscoverData } from "@/lib/discovery-data";

const discoverFilters = [
  { label: "Neighborhood", value: "Nearby active facilities" },
  { label: "Time", value: "Today and upcoming slots" },
  { label: "Surface", value: "Indoor + outdoor mix" },
  { label: "Skill", value: "Open booking" }
];

export default async function DiscoverPage() {
  const discoverData = await getDiscoverData();

  return (
    <div className="app-shell">
      <SiteHeader />
      <main className="page-shell page-stack">
        <section className="surface page-hero">
          <SectionHeader
            eyebrow="Discover courts"
            title="Find available courts with pricing and location context"
            description="Live inventory from Supabase keeps cards and map markers aligned, so players can scan, compare, and move to checkout quickly."
            titleId="discover-page-title"
          />
          <div className="toolbar" role="list" aria-label="Search filters">
            {discoverFilters.map((filter) => (
              <article className="toolbar-card" key={filter.label} role="listitem">
                <span className="field-label">{filter.label}</span>
                <strong>{filter.value}</strong>
              </article>
            ))}
          </div>
        </section>

        <DiscoverExperience courts={discoverData.courts} errorMessage={discoverData.errorMessage} />
      </main>
      <SiteFooter />
    </div>
  );
}
