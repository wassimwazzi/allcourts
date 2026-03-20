import type { Route } from "next";
import Link from "next/link";

const navItems: Array<{ href: Route; label: string }> = [
  { href: "/", label: "Home" },
  { href: "/discover", label: "Discover" },
  { href: "/#pricing", label: "Pricing" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-700/20 bg-slate-900/80 backdrop-blur-lg">
      <div className="mx-auto flex max-w-[1180px] items-center justify-between gap-4 px-3 py-3.5">
        <Link className="inline-flex items-center gap-3.5" href="/">
          <span 
            className="grid h-11 w-11 place-items-center rounded-xl border border-brand-accent/30 bg-gradient-to-br from-brand-accent/20 to-brand-blue/25 text-base font-extrabold text-white" 
            aria-hidden="true"
          >
            AC
          </span>
          <span>
            <strong className="block text-base text-white">AllCourts</strong>
            <small className="block text-sm text-slate-400">Bookings-first marketplace</small>
          </span>
        </Link>

        <nav aria-label="Primary navigation">
          <ul className="flex flex-wrap items-center gap-2 md:gap-4">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link 
                  href={item.href} 
                  className="text-sm text-slate-300 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-accent md:text-base"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
