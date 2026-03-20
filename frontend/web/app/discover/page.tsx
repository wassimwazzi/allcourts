import { DiscoverExperience } from "@/components/discover-experience";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getDiscoverData } from "@/lib/discovery-data";

export default async function DiscoverPage() {
  const discoverData = await getDiscoverData();

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto w-full max-w-[1180px] px-3 py-6 pb-20">
        <DiscoverExperience
          courts={discoverData.courts}
          errorMessage={discoverData.errorMessage}
        />
      </main>
      <SiteFooter />
    </div>
  );
}
