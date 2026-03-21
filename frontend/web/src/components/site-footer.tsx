import Link from "next/link";

export function SiteFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-white/10 bg-slate-950/70">
      <div className="mx-auto grid max-w-[1180px] gap-8 px-3 py-10 sm:px-4 md:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)_minmax(0,0.9fr)]">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.03] px-3 py-2">
            <span className="grid h-10 w-10 place-items-center rounded-full border border-white/15 bg-[radial-gradient(circle_at_top,_rgba(102,240,194,0.5),_rgba(37,99,235,0.16)_62%,_rgba(15,23,42,0.95)_100%)] text-xs font-black tracking-[0.24em] text-white">
              AC
            </span>
            <div>
              <p className="text-base font-black tracking-[-0.03em] text-white">AllCourts</p>
              <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
                Booking marketplace
              </p>
            </div>
          </div>

          <p className="max-w-md text-sm leading-6 text-slate-300 sm:text-base">
            Discover trusted venues, check live availability, and book your next court
            in a few taps.
          </p>
        </div>

        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
            Explore
          </p>
          <nav className="grid gap-2" aria-label="Footer navigation">
            <Link
              href="/discover"
              className="text-sm text-slate-300 transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-accent"
            >
              Discover courts
            </Link>
            <Link
              href="/#pricing"
              className="text-sm text-slate-300 transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-accent"
            >
              Pricing
            </Link>
            <Link
              href="/bookings"
              className="text-sm text-slate-300 transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-accent"
            >
              My bookings
            </Link>
          </nav>
        </div>

        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
            For venues
          </p>
          <div className="space-y-3">
            <Link
              href="/admin"
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] px-4 text-sm font-medium text-white transition-colors hover:border-brand-accent/40 hover:bg-white/[0.08] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-accent"
            >
              Open facility dashboard
            </Link>
            <p className="text-sm leading-6 text-slate-400">
              Manage availability, occupancy, and day-of operations from one place.
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-[1180px] flex-col gap-2 px-3 py-4 text-sm text-slate-500 sm:px-4 md:flex-row md:items-center md:justify-between">
          <p>&copy; {currentYear} AllCourts. Every court. Instant booking.</p>
          <p>Designed for fast discovery, confident checkout, and smooth game day ops.</p>
        </div>
      </div>
    </footer>
  );
}
