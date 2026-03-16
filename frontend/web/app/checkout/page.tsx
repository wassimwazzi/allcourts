import Link from "next/link";
import { SectionHeader } from "@/components/section-header";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { checkoutPolicies, checkoutSummary } from "@/data/foundation";

export default function CheckoutPage() {
  return (
    <div className="app-shell">
      <SiteHeader />
      <main className="page-shell page-stack">
        <section className="checkout-layout" aria-labelledby="checkout-title">
          <div className="surface checkout-main">
            <SectionHeader
              eyebrow="Checkout shell"
              title="Wrap payment in reassurance, not friction"
              description="A conversion-oriented booking review flow with clear line items, policy reminders, and arrival context."
              titleId="checkout-title"
            />
            <div className="summary-stack" role="list">
              {checkoutSummary.map((item) => (
                <article className="summary-line" key={item.label} role="listitem">
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                </article>
              ))}
            </div>
            <div className="cta-panel">
              <div>
                <p className="panel-kicker">Ready to reserve</p>
                <p className="cta-title">Court held for 08:47</p>
              </div>
              <Link className="button button-primary" href="/discover">
                Confirm booking path
              </Link>
            </div>
          </div>

          <aside className="surface checkout-side" aria-label="Booking trust and policy details">
            <p className="panel-kicker">Confidence stack</p>
            <div className="policy-list" role="list">
              {checkoutPolicies.map((policy) => (
                <article className="policy-card" key={policy.title} role="listitem">
                  <h3>{policy.title}</h3>
                  <p>{policy.description}</p>
                </article>
              ))}
            </div>
          </aside>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
