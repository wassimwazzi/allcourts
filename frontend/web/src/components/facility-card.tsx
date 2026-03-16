import Image from "next/image";
import Link from "next/link";
import { formatCurrency } from "@/lib/env";
import type { DiscoverCourtCard } from "@/lib/discovery-data";

type FacilityCardProps = {
  facility: DiscoverCourtCard;
  compact?: boolean;
};

export function FacilityCard({ facility, compact = false }: FacilityCardProps) {
  return (
    <article className="surface facility-card">
      <div className="facility-image-wrap">
        <Image
          className="facility-image"
          src={facility.imageUrl}
          alt={`${facility.name} court view`}
          width={900}
          height={520}
        />
      </div>

      <div className="facility-card-top">
        <div>
          <p className="panel-kicker">{facility.sport}</p>
          <h3>{facility.name}</h3>
        </div>
        <span className="inline-chip inline-chip-accent">{facility.availability}</span>
      </div>

      <p className="facility-location">{facility.location}</p>
      <p className="facility-description">{facility.description}</p>

      <dl className="facility-meta" aria-label={`${facility.name} details`}>
        <div>
          <dt>From</dt>
          <dd>{formatCurrency(facility.priceFrom)}</dd>
        </div>
        <div>
          <dt>Address</dt>
          <dd>{facility.travelTime}</dd>
        </div>
        <div>
          <dt>Guests</dt>
          <dd>{facility.capacity}</dd>
        </div>
      </dl>

      <div className="chip-row" aria-label={`${facility.name} amenities`}>
        {facility.amenities.map((amenity) => (
          <span className="inline-chip" key={amenity}>
            {amenity}
          </span>
        ))}
      </div>

      <div className="slot-row" aria-label={`${facility.name} next slots`}>
        {facility.nextSlots.length > 0 ? (
          facility.nextSlots.map((slot) => (
            <span className="slot-chip" key={slot}>
              {slot}
            </span>
          ))
        ) : (
          <span className="slot-chip">See full schedule</span>
        )}
      </div>

      <div className="facility-actions">
        <Link className="button button-secondary" href="/discover">
          Compare options
        </Link>
        <Link className="button button-primary" href={compact ? "/checkout" : "/discover"}>
          {compact ? "Review checkout" : "See availability"}
        </Link>
      </div>
    </article>
  );
}
