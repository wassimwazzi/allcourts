import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer page-shell">
      <div>
        <p className="site-brand">AllCourts</p>
        <p className="site-footnote">
          Booking-first web foundations for discovery, slot search, and operator confidence.
        </p>
      </div>
      <nav className="footer-links" aria-label="Footer navigation">
        <Link href="/discover">Discover</Link>
        <Link href="/checkout">Checkout shell</Link>
        <Link href="/admin">Facility shell</Link>
      </nav>
    </footer>
  );
}
