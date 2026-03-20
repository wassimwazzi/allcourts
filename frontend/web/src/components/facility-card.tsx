"use client";

import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import { formatCurrency } from "@/lib/env";
import type { DiscoverCourtCard } from "@/lib/discovery-data";

type FacilityCardProps = {
  facility: DiscoverCourtCard;
  compact?: boolean;
};

export function FacilityCard({ facility, compact = false }: FacilityCardProps) {
  const bookingHref = (compact ? "/checkout" : `/checkout/${facility.id}`) as Route;

  return (
    <article className="group overflow-hidden rounded-3xl border border-slate-700/20 bg-gradient-to-b from-slate-800/90 to-slate-900/90 opacity-0 transition-all duration-500 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-900/50 animate-in fade-in slide-in-from-bottom-4">
      <div className="relative overflow-hidden">
        <Image
          src={facility.imageUrl}
          alt={`${facility.name}`}
          width={600}
          height={360}
          className="h-56 w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <span className="absolute right-3 top-3 rounded-full bg-slate-900/80 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-brand-accent backdrop-blur-sm">
          {facility.sport}
        </span>
      </div>

      <div className="flex flex-col gap-3 p-5">
        <h3 className="text-xl font-bold leading-tight text-white">{facility.name}</h3>
        <p className="text-sm text-slate-400">{facility.location}</p>

        <div className="mt-2 flex items-center justify-between gap-3">
          <span className="text-lg font-extrabold text-brand-accent">
            From {formatCurrency(facility.priceFrom)}
          </span>
          <Link 
            className="inline-flex h-11 items-center justify-center rounded-full bg-gradient-to-r from-brand-accent to-brand-blue px-6 text-sm font-bold text-slate-900 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-brand-accent/20 active:translate-y-0" 
            href={bookingHref}
          >
            Book Now
          </Link>
        </div>
      </div>
    </article>
  );
}
