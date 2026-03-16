import type { Route } from "next";
import Link from "next/link";

const navItems: Array<{ href: Route; label: string }> = [
  { href: "/discover", label: "Discover" },
  { href: "/checkout", label: "Checkout" },
  { href: "/admin", label: "Facility shell" }
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
