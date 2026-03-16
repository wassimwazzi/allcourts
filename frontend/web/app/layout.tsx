import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "AllCourts",
    template: "%s · AllCourts"
  },
  description:
    "Booking-first sports marketplace for discovering courts, comparing open slots, and checking out with confidence.",
  openGraph: {
    title: "AllCourts",
    description:
      "Booking-first sports marketplace for discovering courts, comparing open slots, and checking out with confidence.",
    type: "website"
  }
};

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
