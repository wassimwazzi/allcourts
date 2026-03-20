import Link from "next/link";
import { PricingTiers } from "@/components/pricing-tiers";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main>
        {/* Full-viewport hero */}
        <section
          className="relative flex min-h-screen flex-col items-center justify-center px-6 py-20 text-center"
          aria-labelledby="hero-title"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 50% 40%, rgba(102, 240, 194, 0.06) 0%, transparent 70%), radial-gradient(ellipse 60% 40% at 30% 70%, rgba(116, 168, 255, 0.05) 0%, transparent 60%)",
          }}
        >
          <div className="flex max-w-4xl flex-col items-center gap-7 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <h1
              className="text-7xl font-black leading-[0.88] tracking-tight text-white sm:text-8xl md:text-9xl"
              id="hero-title"
            >
              AllCourts
            </h1>
            <p className="text-xl font-normal tracking-wide text-slate-200 sm:text-2xl md:text-3xl">
              Every court. Instant booking.
            </p>
            <Link
              className="inline-flex min-h-[54px] items-center justify-center gap-2 rounded-full bg-gradient-to-br from-brand-accent to-brand-blue px-8 py-3 text-lg font-bold text-slate-900 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-brand-accent/20 active:translate-y-0"
              href="/discover"
            >
              Start Booking Now
            </Link>
          </div>
          <div
            className="absolute bottom-9 left-1/2 -translate-x-1/2 animate-bounce text-slate-400"
            aria-hidden="true"
          >
            <span className="text-2xl">↓</span>
          </div>
        </section>

        {/* Subscription tiers */}
        <PricingTiers />
      </main>
      <SiteFooter />
    </div>
  );
}
