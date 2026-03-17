import { DiscoverExperience } from "@/components/discover-experience";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getDiscoverData } from "@/lib/discovery-data";

export default async function DiscoverPage() {
  const discoverData = await getDiscoverData();

  return (
    <div className="app-shell">
      <SiteHeader />
      <main className="page-shell page-stack">
        <DiscoverExperience
          courts={discoverData.courts}
          errorMessage={discoverData.errorMessage}
        />
      </main>
      <SiteFooter />
    </div>
  );
}
