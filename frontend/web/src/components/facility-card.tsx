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
    <article className="facility-card">
      <div className="facility-card-image">
        <Image
          src={facility.imageUrl}
          alt={`${facility.name}`}
          width={600}
          height={360}
          className="facility-card-img"
        />
        <span className="facility-card-sport-badge">{facility.sport}</span>
      </div>

      <div className="facility-card-body">
        <h3 className="facility-card-name">{facility.name}</h3>
        <p className="facility-card-location">{facility.location}</p>

        <div className="facility-card-footer">
          <span className="facility-card-price">
            From {formatCurrency(facility.priceFrom)}
          </span>
          <Link className="button button-primary" href={bookingHref}>
            Book Now
          </Link>
        </div>
      </div>
    </article>
  );
}
