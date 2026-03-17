import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer page-shell">
      <div>
        <p className="site-brand">AllCourts</p>
        <p className="site-footnote">Every court. Instant booking.</p>
      </div>
      <nav className="footer-links" aria-label="Footer navigation">
        <Link href="/discover">Discover</Link>
        <Link href="/#pricing">Pricing</Link>
        <Link href="/admin">Facility Dashboard</Link>
      </nav>
    </footer>
  );
}
