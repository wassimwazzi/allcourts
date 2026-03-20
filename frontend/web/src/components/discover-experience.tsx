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
      <section
        className="relative overflow-hidden rounded-xl border border-slate-700/20 bg-gradient-to-b from-slate-900/92 to-slate-950/92 p-5 shadow-2xl"
        aria-live="polite"
      >
        <p className="m-0 mb-2 text-xs font-bold uppercase tracking-[0.12em] text-brand-accent">
          No available courts
        </p>
        <h2 className="mt-0 mb-0 text-3xl font-extrabold tracking-tight text-white">
          We could not load live inventory right now.
        </h2>
        <p className="mt-2 text-slate-300 leading-relaxed">
          {errorMessage ?? "Try again in a moment or adjust your search area."}
        </p>
      </section>
    );
  }

  return (
    <div className="flex flex-col gap-5 pb-20">
      {/* Search + Filters */}
      <section
        className="flex flex-col gap-3.5 rounded-2xl border border-slate-600/20 bg-white/[0.03] px-6 py-5"
        aria-label="Search and filter courts"
      >
        <AISearch value={query} onChange={setQuery} onSubmit={handleSubmit} onClear={handleClear} />
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
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-slate-300">
          <strong className="font-bold text-white">{displayCourts.length}</strong>{" "}
          {displayCourts.length === 1 ? "court" : "courts"} available
        </p>
        <div
          className="flex overflow-hidden rounded-xl border border-slate-700/20 bg-white/[0.04]"
          role="group"
          aria-label="Switch view"
        >
          {(["list", "map"] as const).map((v) => (
            <button
              key={v}
              type="button"
              className={`px-4 py-2 text-sm font-semibold capitalize transition ${
                view === v
                  ? "bg-brand-accent/15 text-brand-accent"
                  : "text-slate-400 hover:bg-white/[0.06] hover:text-white"
              }`}
              onClick={() => setView(v)}
              aria-pressed={view === v}
            >
              {v === "list" ? "≡ List" : "⊙ Map"}
            </button>
          ))}
        </div>
      </div>

      {/* List or Map */}
      {view === "list" ? (
        displayCourts.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {displayCourts.map((court) => (
              <CourtCard court={court} key={court.id} />
            ))}
          </div>
        ) : (
          <div className="relative overflow-hidden rounded-xl border border-slate-700/20 bg-gradient-to-b from-slate-900/92 to-slate-950/92 px-8 py-16 text-center shadow-2xl">
            <h3 className="mb-3 text-xl font-bold text-white">No Courts Found</h3>
            <p className="text-slate-300">Try adjusting your search or clearing some filters.</p>
          </div>
        )
      ) : (
        <div className="relative overflow-hidden rounded-xl border border-slate-700/20 bg-gradient-to-b from-slate-900/92 to-slate-950/92 p-5 shadow-2xl">
          <DiscoverMap
            courts={displayCourts}
            selectedCourtId={selectedCourt?.id ?? null}
            onSelectCourt={setSelectedCourtId}
          />
          {selectedCourt && (
            <article className="mt-3.5 grid gap-2.5 rounded-lg border border-slate-700/20 bg-white/[0.03] p-3" aria-live="polite">
              <Image
                src={selectedCourt.imageUrl}
                alt={`${selectedCourt.name} preview`}
                width={600}
                height={360}
                className="h-32 w-full rounded-lg object-cover"
              />
              <div>
                <h3 className="mb-0 text-base font-bold text-white">{selectedCourt.name}</h3>
                <p className="m-0 text-sm font-semibold text-brand-accent">{selectedCourt.location}</p>
              </div>
            </article>
          )}
        </div>
      )}
    </div>
  );
}
