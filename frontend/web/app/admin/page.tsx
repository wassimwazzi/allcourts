import { Eyebrow } from "@/components/ui/eyebrow";
import { PageShell } from "@/components/ui/page-shell";
import { Surface } from "@/components/ui/surface";
import { SectionHeader } from "@/components/section-header";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { adminMetrics, adminQueue } from "@/data/foundation";

export default function AdminPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main>
        <PageShell className="flex flex-col gap-3.5">
          {/* Metrics overview */}
          <Surface padding="md">
            <SectionHeader
              eyebrow="Facility and admin shell"
              title="Keep operators focused on today’s bookings"
              description="A practical shell for occupancy, check-ins, and schedule interventions without drifting into memberships or unrelated back-office tooling."
              titleId="admin-shell-title"
            />
            <div
              className="mt-5 grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4"
              role="list"
              aria-label="Facility metrics"
            >
              {adminMetrics.map((metric) => (
                <article
                  key={metric.label}
                  role="listitem"
                  className="rounded-lg border border-slate-700/20 bg-white/[0.03] p-3.5"
                >
                  <span className="text-sm text-slate-400">{metric.label}</span>
                  <strong className="mt-2 block text-2xl font-extrabold text-white">
                    {metric.value}
                  </strong>
                  <p className="mt-1 text-xs text-slate-400">{metric.detail}</p>
                </article>
              ))}
            </div>
          </Surface>

          {/* Queue + Notes */}
          <div
            className="grid grid-cols-1 gap-3.5 lg:grid-cols-[minmax(0,1.25fr)_minmax(280px,0.75fr)] lg:items-start"
            aria-labelledby="admin-queue-title"
          >
            <Surface padding="md">
              <div className="mb-4 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <Eyebrow>Action queue</Eyebrow>
                  <h2 id="admin-queue-title" className="mt-0 text-2xl font-extrabold text-white">
                    What needs attention before prime time
                  </h2>
                </div>
                <span className="inline-flex min-h-[32px] items-center rounded-full border border-white/10 bg-white/[0.05] px-3 text-sm text-slate-300">
                  Ops focus
                </span>
              </div>
              <div className="mt-3.5 flex flex-col gap-2" role="list">
                {adminQueue.map((item) => (
                  <article
                    key={item.title}
                    role="listitem"
                    className="flex flex-col items-start justify-between gap-4 rounded-lg border border-slate-700/15 bg-white/[0.02] p-3.5 sm:flex-row sm:items-center"
                  >
                    <div>
                      <h3 className="mb-1 text-base font-semibold text-white">{item.title}</h3>
                      <p className="m-0 text-sm leading-relaxed text-slate-300">{item.description}</p>
                    </div>
                    <span className="inline-flex shrink-0 min-h-[32px] items-center rounded-full border border-brand-accent/30 bg-brand-accent/10 px-3 text-sm text-brand-accent">
                      {item.status}
                    </span>
                  </article>
                ))}
              </div>
            </Surface>

            <Surface padding="md" className="lg:sticky lg:top-20">
              <Eyebrow>Shell guidance</Eyebrow>
              <h2 className="mt-0 mb-3 text-xl font-extrabold text-white">
                Best-fit web jobs for launch
              </h2>
              <ul className="mb-0 flex flex-col gap-2 pl-5 text-sm leading-relaxed text-slate-300">
                <li>Monitor occupancy, upcoming arrivals, and issue recovery in one place.</li>
                <li>Support last-minute slot edits, manual confirmations, and customer notes.</li>
                <li>Keep the admin shell visually aligned with the booking experience.</li>
              </ul>
            </Surface>
          </div>
        </PageShell>
      </main>
      <SiteFooter />
    </div>
  );
}
