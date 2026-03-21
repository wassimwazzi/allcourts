"use client";

import { Menu, Sparkles, X } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AuthNav } from "@/components/auth/auth-nav";
import { useAuth } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";

type NavItem = {
  href: Route;
  label: string;
  match: string;
};

export function SiteHeader() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isSignedIn = Boolean(user && !user.is_anonymous);
  const navItems: NavItem[] = [
    { href: "/" as Route, label: "Home", match: "/" },
    { href: "/discover" as Route, label: "Discover", match: "/discover" },
    ...(isSignedIn
      ? [{ href: "/bookings" as Route, label: "My Bookings", match: "/bookings" }]
      : []),
  ];

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1180px] flex-col px-3 py-3 sm:px-4">
        <div className="flex items-center justify-between gap-4">
          <Link
            className="group inline-flex min-w-0 items-center gap-3 rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-2 pr-4 transition-colors hover:border-brand-accent/35 hover:bg-white/[0.05] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-accent"
            href="/"
          >
            <span
              className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-white/15 bg-[radial-gradient(circle_at_top,_rgba(102,240,194,0.55),_rgba(37,99,235,0.16)_62%,_rgba(15,23,42,0.95)_100%)] text-sm font-black tracking-[0.24em] text-white shadow-[0_18px_40px_-24px_rgba(102,240,194,0.95)]"
              aria-hidden="true"
            >
              AC
            </span>
            <span className="min-w-0">
              <strong className="block truncate bg-gradient-to-r from-white via-slate-100 to-brand-accent bg-clip-text text-lg font-black tracking-[-0.03em] text-transparent sm:text-[1.15rem]">
                AllCourts
              </strong>
              <span className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.24em] text-slate-400 sm:text-xs">
                <Sparkles className="size-3.5 text-brand-accent" aria-hidden="true" />
                Book courts faster
              </span>
            </span>
          </Link>

          <div className="hidden items-center gap-3 md:flex">
            <nav aria-label="Primary navigation">
              <ul className="flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.03] p-1">
                {navItems.map((item) => {
                  const isActive =
                    item.match === "/"
                      ? pathname === "/"
                      : pathname.startsWith(item.match);

                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={cn(
                          "inline-flex min-h-11 items-center rounded-full px-4 text-sm font-medium text-slate-300 transition-all hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-accent",
                          isActive && "bg-white/10 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]"
                        )}
                      >
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <AuthNav />
          </div>

          <button
            type="button"
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-slate-100 transition-colors hover:border-brand-accent/40 hover:bg-white/[0.08] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-accent md:hidden"
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-nav-panel"
            aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            onClick={() => setMobileMenuOpen((open) => !open)}
          >
            {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>

        <div
          id="mobile-nav-panel"
          className={cn(
            "overflow-hidden transition-[max-height,opacity,margin] duration-300 ease-out md:hidden",
            mobileMenuOpen ? "mt-4 max-h-[32rem] opacity-100" : "max-h-0 opacity-0"
          )}
        >
          <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-3 shadow-[0_20px_50px_-32px_rgba(15,23,42,0.9)]">
            <nav aria-label="Mobile navigation">
              <ul className="flex flex-col gap-2">
                {navItems.map((item) => {
                  const isActive =
                    item.match === "/"
                      ? pathname === "/"
                      : pathname.startsWith(item.match);

                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={cn(
                          "flex min-h-12 items-center justify-between rounded-2xl border border-transparent px-4 text-sm font-medium text-slate-200 transition-colors hover:border-white/10 hover:bg-white/[0.05] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-accent",
                          isActive && "border-brand-accent/25 bg-brand-accent/10 text-white"
                        )}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <span>{item.label}</span>
                        <span className="text-xs uppercase tracking-[0.2em] text-slate-500">
                          Go
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div className="mt-3 border-t border-white/10 pt-3">
              <AuthNav layout="stacked" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
