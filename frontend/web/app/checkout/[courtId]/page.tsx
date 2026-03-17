import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { CheckoutFlow } from "@/components/checkout-flow";
import { fetchCourtWithAvailability } from "@/lib/checkout";

type PageProps = {
  params: Promise<{ courtId: string }>;
};

export default async function CheckoutCourtPage({ params }: PageProps) {
  const { courtId } = await params;
  const court = await fetchCourtWithAvailability(courtId);

  if (!court) {
    notFound();
  }

  return (
    <div className="app-shell">
      <SiteHeader />
      <main className="page-shell page-stack">
        <CheckoutFlow court={court} />
      </main>
      <SiteFooter />
    </div>
  );
}
