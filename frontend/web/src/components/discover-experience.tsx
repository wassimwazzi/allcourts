"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { AISearch } from "@/components/ai-search";
import { CourtFilters } from "@/components/court-filters";
import { DiscoverMap } from "@/components/discover-map";
import { CourtCard } from "@/components/court-card";
import type { DiscoverCourtCard } from "@/lib/discovery-data";

type View = "list" | "map";

function applyQueryFilter(courts: DiscoverCourtCard[], query: string): DiscoverCourtCard[] {
  const q = query.toLowerCase().trim();
  if (!q) return courts;

  const sportMap: [string, string[]][] = [
    ["Tennis", ["tennis"]],
    ["Padel", ["padel"]],
    ["Pickleball", ["pickleball", "pickle ball"]],
    ["Squash", ["squash"]],
    ["Badminton", ["badminton"]],
  ];

  return courts.filter((court) => {
    const mentionedSport = sportMap.find(([, keywords]) =>
      keywords.some((kw) => q.includes(kw))
    );
    if (mentionedSport && court.sport.toLowerCase() !== mentionedSport[0].toLowerCase()) {
      return false;
    }

    if (
      (q.includes("cheap") || q.includes("budget") || q.includes("affordable")) &&
      court.priceFrom >= 30
    ) return false;

    if (
      (q.includes("premium") || q.includes("luxury") || q.includes("expensive")) &&
      court.priceFrom < 50
    ) return false;

    if (!mentionedSport) {
      const stopWords = new Set(["court", "facility", "booking", "near", "with", "this", "that", "want", "find", "show", "the", "and", "for"]);
      const words = q.split(/\s+/).filter((w) => w.length > 3 && !stopWords.has(w));
      if (words.length > 0) {
        const searchable = `${court.name} ${court.location} ${court.sport}`.toLowerCase();
        if (!words.some((w) => searchable.includes(w))) return false;
      }
    }

    return true;
  });
}

type DiscoverExperienceProps = {
  courts: DiscoverCourtCard[];
  errorMessage?: string;
};

export function DiscoverExperience({ courts, errorMessage }: DiscoverExperienceProps) {
  const [view, setView] = useState<View>("list");
  const [selectedCourtId, setSelectedCourtId] = useState<string | null>(courts[0]?.id ?? null);
  const [query, setQuery] = useState("");
  const [activeQuery, setActiveQuery] = useState("");
  const [sport, setSport] = useState("");
  const [location, setLocation] = useState("");
  const [priceRange, setPriceRange] = useState("");

  const sports = useMemo(
    () => Array.from(new Set(courts.map((c) => c.sport))).sort(),
    [courts]
  );
  const locations = useMemo(
    () => Array.from(new Set(courts.map((c) => c.location).filter(Boolean))).sort(),
    [courts]
  );

  const displayCourts = useMemo(() => {
    let result = activeQuery ? applyQueryFilter(courts, activeQuery) : courts;
    if (sport) result = result.filter((c) => c.sport.toLowerCase() === sport.toLowerCase());
    if (location) result = result.filter((c) => c.location.toLowerCase().includes(location.toLowerCase()));
    if (priceRange === "budget") result = result.filter((c) => c.priceFrom < 30);
    else if (priceRange === "mid") result = result.filter((c) => c.priceFrom >= 30 && c.priceFrom <= 50);
    else if (priceRange === "premium") result = result.filter((c) => c.priceFrom > 50);
    return result;
  }, [courts, activeQuery, sport, location, priceRange]);

  const selectedCourt = useMemo(
    () => displayCourts.find((c) => c.id === selectedCourtId) ?? displayCourts[0] ?? null,
    [displayCourts, selectedCourtId]
  );

  const handleSubmit = () => setActiveQuery(query);
  const handleClear = () => { setQuery(""); setActiveQuery(""); };

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
    <div className="discover-shell">
      {/* Search + Filters */}
      <section className="discover-search-section" aria-label="Search and filter courts">
        <AISearch
          value={query}
          onChange={setQuery}
          onSubmit={handleSubmit}
          onClear={handleClear}
        />
        <CourtFilters
          sports={sports}
          locations={locations}
          sport={sport}
          location={location}
          priceRange={priceRange}
          onSportChange={setSport}
          onLocationChange={setLocation}
          onPriceChange={setPriceRange}
        />
      </section>

      {/* Results header */}
      <div className="discover-results-header">
        <p className="discover-count">
          <strong>{displayCourts.length}</strong>{" "}
          {displayCourts.length === 1 ? "court" : "courts"} available
        </p>
        <div className="view-toggle" role="group" aria-label="Switch view">
          <button
            type="button"
            className={`view-toggle-btn${view === "list" ? " view-toggle-active" : ""}`}
            onClick={() => setView("list")}
            aria-pressed={view === "list"}
          >
            ≡ List
          </button>
          <button
            type="button"
            className={`view-toggle-btn${view === "map" ? " view-toggle-active" : ""}`}
            onClick={() => setView("map")}
            aria-pressed={view === "map"}
          >
            ⊙ Map
          </button>
        </div>
      </div>

      {/* List or Map */}
      {view === "list" ? (
        displayCourts.length > 0 ? (
          <div className="courts-grid">
            {displayCourts.map((court) => (
              <CourtCard court={court} key={court.id} />
            ))}
          </div>
        ) : (
          <div className="surface empty-state">
            <h3>No Courts Found</h3>
            <p>Try adjusting your search or clearing some filters.</p>
          </div>
        )
      ) : (
        <div className="discover-map-full surface">
          <DiscoverMap
            courts={displayCourts}
            selectedCourtId={selectedCourt?.id ?? null}
            onSelectCourt={setSelectedCourtId}
          />
          {selectedCourt && (
            <article className="map-detail-card" aria-live="polite">
              <Image
                src={selectedCourt.imageUrl}
                alt={`${selectedCourt.name} preview`}
                width={600}
                height={360}
              />
              <div>
                <h3>{selectedCourt.name}</h3>
                <p className="facility-card-location">{selectedCourt.location}</p>
              </div>
            </article>
          )}
        </div>
      )}
    </div>
  );
}
