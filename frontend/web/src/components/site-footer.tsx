import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mx-auto flex max-w-[1180px] items-center justify-between gap-4 px-3 py-3.5">
      <div>
        <p className="text-base font-semibold text-white">AllCourts</p>
        <p className="text-sm text-slate-400">Every court. Instant booking.</p>
      </div>
      <nav className="flex flex-wrap items-center gap-2 md:gap-4" aria-label="Footer navigation">
        <Link href="/discover" className="text-sm text-slate-300 hover:text-white md:text-base">Discover</Link>
        <Link href="/#pricing" className="text-sm text-slate-300 hover:text-white md:text-base">Pricing</Link>
        <Link href="/admin" className="text-sm text-slate-300 hover:text-white md:text-base">Facility Dashboard</Link>
      </nav>
    </footer>
  );
}
