import Link from "next/link";
import {
  bookingSignals,
  checkoutPolicies,
  operationsHighlights,
  sports,
  trustMetrics
} from "@/data/foundation";
import { FacilityCard } from "@/components/facility-card";
import { SectionHeader } from "@/components/section-header";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getDiscoverData } from "@/lib/discovery-data";
import { formatCurrency, getBaseUrl } from "@/lib/env";

export default async function HomePage() {
  const discoverData = await getDiscoverData();
  const featuredCourts = discoverData.courts.slice(0, 3);

  return (
    <div className="app-shell">
      <SiteHeader />
      <main>
        <section className="hero-section page-shell">
          <div className="hero-copy surface surface-hero">
            <p className="eyebrow">Bookings-first web foundation</p>
            <h1>Discover a court, lock a slot, and check out with confidence.</h1>
            <p className="lede">
              AllCourts now leans into 21st.dev-inspired compositional UI patterns: layered surfaces,
              sharp hierarchy, strong CTAs, and trust-building booking details tuned for conversion.
            </p>
            <div className="hero-actions">
              <Link className="button button-primary" href="/discover">
                Explore availability
              </Link>
              <Link className="button button-secondary" href="/admin">
                View facility shell
              </Link>
            </div>
            <dl className="metric-row" aria-label="Marketplace highlights">
              {trustMetrics.map((metric) => (
                <div className="metric-pill" key={metric.label}>
                  <dt>{metric.label}</dt>
                  <dd>{metric.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="hero-search surface" aria-labelledby="search-composer-title">
            <div className="panel-header">
              <div>
                <p className="panel-kicker">Search composer</p>
                <h2 id="search-composer-title">Start with the slot, not the spreadsheet.</h2>
              </div>
              <span className="inline-chip inline-chip-accent">Live booking path</span>
            </div>

            <div className="search-grid" role="list" aria-label="Primary booking filters">
              <div className="search-field" role="listitem">
                <span className="field-label">Sport</span>
                <strong>Tennis · Padel · Pickleball</strong>
              </div>
              <div className="search-field" role="listitem">
                <span className="field-label">When</span>
                <strong>Today and upcoming blocks</strong>
              </div>
              <div className="search-field" role="listitem">
                <span className="field-label">Where</span>
                <strong>Facilities with active courts</strong>
              </div>
              <div className="search-field" role="listitem">
                <span className="field-label">Players</span>
                <strong>Capacity-aware options</strong>
              </div>
            </div>

            <div className="chip-row" aria-label="Sports we support first">
              {sports.map((sport) => (
                <span className="inline-chip" key={sport}>
                  {sport}
                </span>
              ))}
            </div>

            <div className="booking-signal-stack" aria-label="Booking confidence signals">
              {bookingSignals.map((signal) => (
                <article className="signal-card" key={signal.title}>
                  <h3>{signal.title}</h3>
                  <p>{signal.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="page-shell section-stack" aria-labelledby="discover-section-title">
          <SectionHeader
            eyebrow="Discovery previews"
            title="Live court cards with images, pricing, and next slots"
            description="Use polished listing cards, comparison-friendly metadata, and slot-forward layouts to help users decide quickly on mobile or desktop."
            titleId="discover-section-title"
          />
          {featuredCourts.length > 0 ? (
            <div className="card-grid card-grid-three">
              {featuredCourts.map((facility) => (
                <FacilityCard facility={facility} key={facility.id} />
              ))}
            </div>
          ) : (
            <div className="surface empty-state-panel" aria-live="polite">
              <p className="panel-kicker">Discovery unavailable</p>
              <h2>We could not load featured courts.</h2>
              <p>{discoverData.errorMessage ?? "Please check your Supabase environment configuration."}</p>
            </div>
          )}
        </section>

        <section className="page-shell feature-split" aria-labelledby="checkout-section-title">
          <div className="surface feature-panel">
            <SectionHeader
              eyebrow="Checkout confidence"
              title="Reduce hesitation before payment"
              description="Call out pricing clarity, cancellation terms, and arrival expectations before users tap pay."
              titleId="checkout-section-title"
            />
            <div className="policy-list" role="list">
              {checkoutPolicies.map((policy) => (
                <article className="policy-card" key={policy.title} role="listitem">
                  <h3>{policy.title}</h3>
                  <p>{policy.description}</p>
                </article>
              ))}
            </div>
          </div>

          <aside className="surface confidence-panel" aria-label="Marketplace confidence summary">
            <p className="panel-kicker">Product guidance</p>
            <h2>Keep the funnel anchored around instant trust.</h2>
            <ul className="detail-list">
              <li>Lead with the next available slots and real per-session pricing.</li>
              <li>Show policies near the CTA instead of burying them in footnotes.</li>
              <li>Use compositional, 21st.dev-style surfaces to separate decisions cleanly.</li>
            </ul>
            <div className="summary-card">
              <span>Sample checkout from</span>
              <strong>{formatCurrency(36)}</strong>
              <p>Includes court fee, instant confirmation, and host contact details.</p>
            </div>
            <p className="subtle-note">Base app URL: {getBaseUrl()}</p>
          </aside>
        </section>

        <section className="page-shell section-stack" aria-labelledby="ops-section-title">
          <SectionHeader
            eyebrow="Facility operations"
            title="Give operators a focused shell without drifting into memberships"
            description="This foundation keeps web scope centered on discovery, booking, and day-of-operations for facilities and admins."
            titleId="ops-section-title"
          />
          <div className="card-grid card-grid-three">
            {operationsHighlights.map((item) => (
              <article className="surface info-card" key={item.title}>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
