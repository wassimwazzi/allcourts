import Link from "next/link";
import { PricingTiers } from "@/components/pricing-tiers";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export default function HomePage() {
  return (
    <div className="app-shell">
      <SiteHeader />
      <main>
        {/* Full-viewport hero */}
        <section className="hero-landing" aria-labelledby="hero-title">
          <div className="hero-landing-content">
            <h1 className="hero-landing-title" id="hero-title">
              AllCourts
            </h1>
            <p className="hero-landing-tagline">
              Every court. Instant booking.
            </p>
            <Link
              className="button button-primary button-large hero-landing-cta"
              href="/discover"
            >
              Start Booking Now
            </Link>
          </div>
          <div className="scroll-indicator" aria-hidden="true">
            <span className="scroll-arrow">↓</span>
          </div>
        </section>

        {/* Subscription tiers */}
        <PricingTiers />
      </main>
      <SiteFooter />
    </div>
  );
}
