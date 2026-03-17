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
      <div className="search-filters">
        <div className="filter-item">
          <label htmlFor="sport-filter" className="filter-label">Sport</label>
          <select
            id="sport-filter"
            className="filter-select"
            value={sport}
            onChange={(e) => onSportChange(e.target.value)}
          >
            <option value="">All Sports</option>
            {sports.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div className="filter-item">
          <label htmlFor="location-filter" className="filter-label">Location</label>
          <select
            id="location-filter"
            className="filter-select"
            value={location}
            onChange={(e) => onLocationChange(e.target.value)}
          >
            <option value="">Any Location</option>
            {locations.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </div>
        <div className="filter-item">
          <label htmlFor="price-filter" className="filter-label">Price</label>
          <select
            id="price-filter"
            className="filter-select"
            value={priceRange}
            onChange={(e) => onPriceChange(e.target.value)}
          >
            <option value="">Any Price</option>
            <option value="budget">Under $30</option>
            <option value="mid">$30\u2013$50</option>
            <option value="premium">$50+</option>
          </select>
        </div>
      </div>
      <div className="sport-chips">
        {sports.map((s) => (
          <button
            key={s}
            type="button"
            className={`sport-chip${sport === s ? " sport-chip-active" : ""}`}
            onClick={() => onSportChange(sport === s ? "" : s)}
          >
            {s}
          </button>
        ))}
      </div>
    </>
  );
}
