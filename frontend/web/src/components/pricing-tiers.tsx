"use client";

import type { Route } from "next";
import { useEffect, useRef } from "react";
import Link from "next/link";

type Tier = {
  name: string;
  price: string;
  period: string | null;
  tagline: string;
  features: string[];
  cta: string;
  href: Route;
  featured: boolean;
};

const tiers: Tier[] = [
  {
    name: "Starter",
    price: "Free",
    period: null,
    tagline: "Get on the court",
    features: [
      "Book any available court",
      "Standard pricing",
      "Email confirmations",
      "Community events",
      "Basic booking history",
    ],
    cta: "Get Started",
    href: "/discover",
    featured: false,
  },
  {
    name: "Player",
    price: "$9.99",
    period: "/mo",
    tagline: "Play more, pay less",
    features: [
      "10% off every booking",
      "Early access to prime slots",
      "Join amateur leagues",
      "Priority customer support",
      "Booking reminders & recaps",
    ],
    cta: "Start Playing",
    href: "/discover",
    featured: true,
  },
  {
    name: "Pro",
    price: "$19.99",
    period: "/mo",
    tagline: "Compete at every level",
    features: [
      "20% off every booking",
      "Priority booking windows",
      "All leagues & tournaments",
      "1 free guest per month",
      "Court concierge support",
    ],
    cta: "Go Pro",
    href: "/discover",
    featured: false,
  },
];

export function PricingTiers() {
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            grid.querySelectorAll<HTMLElement>(".pricing-card").forEach((card, i) => {
              setTimeout(() => card.classList.add("visible"), i * 120);
            });
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(grid);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="pricing" className="pricing-section page-shell" aria-labelledby="pricing-title">
      <div className="pricing-header">
        <span className="section-badge">Membership Plans</span>
        <h2 className="section-title" id="pricing-title">Play more for less</h2>
        <p className="section-description">
          Choose the plan that fits your game. Upgrade or cancel anytime — no lock-in.
        </p>
      </div>
      <div className="pricing-grid" ref={gridRef}>
        {tiers.map((tier) => (
          <div
            key={tier.name}
            className={`pricing-card surface${tier.featured ? " pricing-card-featured" : ""}`}
          >
            {tier.featured && (
              <span className="pricing-popular-badge">Most Popular</span>
            )}
            <div className="pricing-card-top">
              <h3 className="pricing-tier-name">{tier.name}</h3>
              <p className="pricing-tagline">{tier.tagline}</p>
            </div>
            <div className="pricing-price-wrap">
              <span className="pricing-price">{tier.price}</span>
              {tier.period && <span className="pricing-period">{tier.period}</span>}
            </div>
            <ul className="pricing-features" aria-label={`${tier.name} plan features`}>
              {tier.features.map((feature) => (
                <li key={feature} className="pricing-feature">
                  <span className="pricing-check" aria-hidden="true">✓</span>
                  {feature}
                </li>
              ))}
            </ul>
            <Link
              href={tier.href}
              className={`button button-large pricing-cta-btn${tier.featured ? " button-primary" : " button-outline"}`}
            >
              {tier.cta}
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
