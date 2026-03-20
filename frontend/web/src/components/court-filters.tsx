"use client";

type CourtFiltersProps = {
  sports: string[];
  locations: string[];
  sport: string;
  location: string;
  priceRange: string;
  onSportChange: (s: string) => void;
  onLocationChange: (l: string) => void;
  onPriceChange: (p: string) => void;
};

const selectClass =
  "w-full rounded-xl border border-slate-600/25 bg-white/[0.04] px-4 py-3 text-base text-white transition cursor-pointer hover:bg-white/[0.06] hover:border-slate-500/40 focus:outline-none focus:border-brand-accent focus:shadow-[0_0_0_3px_rgb(var(--brand-accent)/0.1)]";

export function CourtFilters({
  sports,
  locations,
  sport,
  location,
  priceRange,
  onSportChange,
  onLocationChange,
  onPriceChange,
}: CourtFiltersProps) {
  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex flex-col gap-2.5">
          <label htmlFor="sport-filter" className="text-sm font-semibold tracking-wide text-slate-300">
            Sport
          </label>
          <select id="sport-filter" className={selectClass} value={sport} onChange={(e) => onSportChange(e.target.value)}>
            <option value="">All Sports</option>
            {sports.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-2.5">
          <label htmlFor="location-filter" className="text-sm font-semibold tracking-wide text-slate-300">
            Location
          </label>
          <select id="location-filter" className={selectClass} value={location} onChange={(e) => onLocationChange(e.target.value)}>
            <option value="">Any Location</option>
            {locations.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-2.5">
          <label htmlFor="price-filter" className="text-sm font-semibold tracking-wide text-slate-300">
            Price
          </label>
          <select id="price-filter" className={selectClass} value={priceRange} onChange={(e) => onPriceChange(e.target.value)}>
            <option value="">Any Price</option>
            <option value="budget">Under $30</option>
            <option value="mid">$30–$50</option>
            <option value="premium">$50+</option>
          </select>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 border-t border-slate-700/20 pt-4">
        {sports.map((s) => (
          <button
            key={s}
            type="button"
            className={`rounded-full border px-5 py-2.5 text-sm font-semibold transition hover:-translate-y-0.5 hover:scale-105 hover:shadow-md ${
              sport === s
                ? "border-brand-accent bg-brand-accent/15 text-brand-accent"
                : "border-brand-blue/25 bg-brand-blue/10 text-slate-200 hover:border-brand-blue/40 hover:bg-brand-blue/20 hover:shadow-brand-blue/20"
            }`}
            onClick={() => onSportChange(sport === s ? "" : s)}
          >
            {s}
          </button>
        ))}
      </div>
    </>
  );
}
