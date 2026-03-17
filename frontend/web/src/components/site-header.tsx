import type { Route } from "next";
import Link from "next/link";

const navItems: Array<{ href: Route; label: string }> = [
  { href: "/", label: "Home" },
  { href: "/discover", label: "Discover" },
  { href: "/#pricing", label: "Pricing" },
];

export function SiteHeader() {
  return (
    <header className="site-header-wrap">
      <div className="site-header page-shell">
        <Link className="brand-mark" href="/">
          <span className="brand-badge" aria-hidden="true">
            AC
          </span>
          <span>
            <strong>AllCourts</strong>
            <small>Bookings-first marketplace</small>
          </span>
        </Link>

        <nav aria-label="Primary navigation">
          <ul className="nav-list">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link href={item.href}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
