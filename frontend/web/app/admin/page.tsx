import { SectionHeader } from "@/components/section-header";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { adminMetrics, adminQueue } from "@/data/foundation";

export default function AdminPage() {
  return (
    <div className="app-shell">
      <SiteHeader />
      <main className="page-shell page-stack">
        <section className="surface page-hero">
          <SectionHeader
            eyebrow="Facility and admin shell"
            title="Keep operators focused on today’s bookings"
            description="A practical shell for occupancy, check-ins, and schedule interventions without drifting into memberships or unrelated back-office tooling."
            titleId="admin-shell-title"
          />
          <div className="metric-card-grid" role="list" aria-label="Facility metrics">
            {adminMetrics.map((metric) => (
              <article className="metric-card" key={metric.label} role="listitem">
                <span>{metric.label}</span>
                <strong>{metric.value}</strong>
                <p>{metric.detail}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="admin-layout" aria-labelledby="admin-queue-title">
          <div className="surface queue-panel">
            <div className="section-inline-header">
              <div>
                <p className="panel-kicker">Action queue</p>
                <h2 id="admin-queue-title">What needs attention before prime time</h2>
              </div>
              <span className="inline-chip">Ops focus</span>
            </div>
            <div className="queue-list" role="list">
              {adminQueue.map((item) => (
                <article className="queue-item" key={item.title} role="listitem">
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                  </div>
                  <span className="queue-status">{item.status}</span>
                </article>
              ))}
            </div>
          </div>

          <aside className="surface insights-rail" aria-label="Admin operating notes">
            <p className="panel-kicker">Shell guidance</p>
            <h2>Best-fit web jobs for launch</h2>
            <ul className="detail-list">
              <li>Monitor occupancy, upcoming arrivals, and issue recovery in one place.</li>
              <li>Support last-minute slot edits, manual confirmations, and customer notes.</li>
              <li>Keep the admin shell visually aligned with the booking experience.</li>
            </ul>
          </aside>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
