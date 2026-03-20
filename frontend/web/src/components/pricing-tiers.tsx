"use client";

import type { Route } from "next";
import { useEffect, useRef, useState } from "react";
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
  const headerRef = useRef<HTMLDivElement>(null);
  const [headerVisible, setHeaderVisible] = useState(false);

  useEffect(() => {
    const grid = gridRef.current;
    const header = headerRef.current;
    if (!grid || !header) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Animate header first
            setHeaderVisible(true);
            
            // Then animate cards with stagger
            grid.querySelectorAll<HTMLElement>(".tier-card").forEach((card, i) => {
              setTimeout(() => card.classList.add("visible"), 300 + i * 120);
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
    <section 
      id="pricing" 
      className="w-full max-w-[1180px] mx-auto px-3 py-24 md:py-32" 
      aria-labelledby="pricing-title"
    >
      <div 
        className={`mb-16 text-center transition-all duration-500 ease-out ${
          headerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
        }`} 
        ref={headerRef}
      >
        <span className="inline-block mb-3 px-4 py-1.5 rounded-full bg-brand-accent/10 text-brand-accent text-xs font-bold uppercase tracking-widest">
          Membership Plans
        </span>
        <h2 className="mb-4 text-4xl font-bold tracking-tight text-white md:text-5xl" id="pricing-title">
          Play more for less
        </h2>
        <p className="mx-auto max-w-lg text-lg text-slate-300">
          Choose the plan that fits your game. Upgrade or cancel anytime — no lock-in.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start" ref={gridRef}>
        {tiers.map((tier, idx) => (
          <div
            key={tier.name}
            className={`tier-card relative flex flex-col gap-7 rounded-3xl border p-9 opacity-0 translate-y-9 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl ${
              tier.featured
                ? "border-brand-accent/30 bg-gradient-to-b from-slate-800/95 to-slate-900/95 md:-translate-y-1.5"
                : "border-slate-700/20 bg-gradient-to-b from-slate-800/90 to-slate-900/90"
            }`}
            style={{ transitionDelay: `${idx * 120}ms` }}
          >
            {tier.featured && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-gradient-to-r from-brand-accent to-brand-blue px-5 py-1.5 text-xs font-extrabold uppercase tracking-wider text-slate-900">
                Most Popular
              </span>
            )}

            <div>
              <h3 className="mb-1.5 text-2xl font-extrabold text-white">{tier.name}</h3>
              <p className="text-sm text-slate-400">{tier.tagline}</p>
            </div>

            <div className="flex items-baseline gap-1">
              <span className="text-5xl font-black leading-none tracking-tight text-white">
                {tier.price}
              </span>
              {tier.period && <span className="text-base text-slate-400">{tier.period}</span>}
            </div>

            <ul 
              className="flex flex-1 flex-col gap-3.5 border-t border-slate-700/50 pt-6" 
              aria-label={`${tier.name} plan features`}
            >
              {tier.features.map((feature) => (
                <li key={feature} className="flex items-center gap-3 text-sm text-slate-300">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center text-brand-accent font-bold" aria-hidden="true">
                    ✓
                  </span>
                  {feature}
                </li>
              ))}
            </ul>

            <Link
              href={tier.href}
              className={`mt-1 inline-flex h-14 w-full items-center justify-center rounded-full px-7 text-lg font-bold transition-all hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 ${
                tier.featured
                  ? "bg-gradient-to-r from-brand-accent to-brand-blue text-slate-900 hover:shadow-brand-accent/25"
                  : "border-2 border-slate-600/30 bg-transparent text-white hover:border-slate-500/50 hover:bg-slate-800/50"
              }`}
            >
              {tier.cta}
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
