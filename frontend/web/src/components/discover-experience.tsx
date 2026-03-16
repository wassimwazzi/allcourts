"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { FacilityCard } from "@/components/facility-card";
import { DiscoverMap } from "@/components/discover-map";
import type { DiscoverCourtCard } from "@/lib/discovery-data";

type DiscoverExperienceProps = {
  courts: DiscoverCourtCard[];
  errorMessage?: string;
};

export function DiscoverExperience({ courts, errorMessage }: DiscoverExperienceProps) {
  const [selectedCourtId, setSelectedCourtId] = useState<string | null>(courts[0]?.id ?? null);

  const selectedCourt = useMemo(
    () => courts.find((court) => court.id === selectedCourtId) ?? courts[0] ?? null,
    [courts, selectedCourtId]
  );

  if (courts.length === 0) {
    return (
      <section className="surface empty-state-panel" aria-live="polite">
        <p className="panel-kicker">No available courts</p>
        <h2>We could not load live inventory right now.</h2>
        <p>{errorMessage ?? "Try again in a moment or adjust your search area."}</p>
      </section>
    );
  }

  return (
    <section className="discover-layout" aria-labelledby="discover-results-title">
      <div className="results-column">
        <div className="section-inline-header">
          <div>
            <p className="panel-kicker">Results</p>
            <h2 id="discover-results-title">{courts.length} courts matching today’s availability</h2>
          </div>
          <span className="inline-chip inline-chip-accent">Live Supabase feed</span>
        </div>
        <div className="results-stack">
          {courts.map((facility) => (
            <FacilityCard facility={facility} key={facility.id} compact />
          ))}
        </div>
      </div>

      <aside className="surface insights-rail" aria-label="Discover map and court details">
        <div className="section-inline-header">
          <div>
            <p className="panel-kicker">Map availability</p>
            <h2>Inspect courts by location</h2>
          </div>
          <span className="inline-chip">Tap marker to inspect</span>
        </div>

        <DiscoverMap courts={courts} selectedCourtId={selectedCourt?.id ?? null} onSelectCourt={setSelectedCourtId} />

        {selectedCourt ? (
          <article className="map-detail-card" aria-live="polite">
            <Image src={selectedCourt.imageUrl} alt={`${selectedCourt.name} preview`} width={900} height={520} />
            <div>
              <h3>{selectedCourt.name}</h3>
              <p>{selectedCourt.description}</p>
              <p className="facility-location">{selectedCourt.location}</p>
            </div>
          </article>
        ) : null}
      </aside>
    </section>
  );
}
