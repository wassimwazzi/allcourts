"use client";

import { useEffect, useMemo, useRef } from "react";
import type { DiscoverCourtCard } from "@/lib/discovery-data";
import type { LayerGroup, Map as LeafletMap } from "leaflet";

type DiscoverMapProps = {
  courts: DiscoverCourtCard[];
  selectedCourtId: string | null;
  onSelectCourt: (courtId: string) => void;
};

export function DiscoverMap({ courts, selectedCourtId, onSelectCourt }: DiscoverMapProps) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<LeafletMap | null>(null);
  const markersLayerRef = useRef<LayerGroup | null>(null);

  const mappableCourts = useMemo(
    () => courts.filter((court) => court.coordinate !== null),
    [courts]
  );

  useEffect(() => {
    let cancelled = false;

    async function setupMap() {
      if (!mapRef.current || mapInstanceRef.current) {
        return;
      }

      const L = await import("leaflet");

      if (cancelled || !mapRef.current) {
        return;
      }

      const firstCoordinate = mappableCourts[0]?.coordinate;
      const center: [number, number] = firstCoordinate
        ? [firstCoordinate.latitude, firstCoordinate.longitude]
        : [37.7749, -122.4194];

      const map = L.map(mapRef.current, {
        scrollWheelZoom: false,
        zoomControl: true
      }).setView(center, 11);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);

      mapInstanceRef.current = map;
      markersLayerRef.current = L.layerGroup().addTo(map);
    }

    setupMap();

    return () => {
      cancelled = true;
    };
  }, [mappableCourts]);

  useEffect(() => {
    async function renderMarkers() {
      const map = mapInstanceRef.current;
      const layerGroup = markersLayerRef.current;

      if (!map || !layerGroup) {
        return;
      }

      const L = await import("leaflet");
      layerGroup.clearLayers();

      if (mappableCourts.length === 0) {
        return;
      }

      const bounds = L.latLngBounds([]);

      for (const court of mappableCourts) {
        const coordinate = court.coordinate;

        if (!coordinate) {
          continue;
        }

        const selected = court.id === selectedCourtId;

        const marker = L.circleMarker([coordinate.latitude, coordinate.longitude], {
          radius: selected ? 10 : 8,
          color: selected ? "#2fd5a0" : "#74a8ff",
          weight: selected ? 3 : 2,
          fillColor: selected ? "#66f0c2" : "#74a8ff",
          fillOpacity: selected ? 0.9 : 0.7
        });

        marker.bindTooltip(`<strong>${court.name}</strong><br/>From $${court.priceFrom.toFixed(0)}`, {
          direction: "top"
        });
        marker.on("click", () => onSelectCourt(court.id));
        marker.addTo(layerGroup);
        bounds.extend([coordinate.latitude, coordinate.longitude]);
      }

      if (bounds.isValid()) {
        map.fitBounds(bounds.pad(0.24));
      }
    }

    renderMarkers();
  }, [mappableCourts, onSelectCourt, selectedCourtId]);

  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markersLayerRef.current = null;
      }
    };
  }, []);

  return (
    <div className="discover-map-shell">
      <div className="discover-map" ref={mapRef} role="img" aria-label="Map of available courts" />
      <ul className="map-court-list" aria-label="Available courts on map">
        {mappableCourts.map((court) => {
          const isSelected = court.id === selectedCourtId;

          return (
            <li key={court.id}>
              <button
                type="button"
                className={`map-court-button${isSelected ? " is-selected" : ""}`}
                onClick={() => onSelectCourt(court.id)}
                aria-pressed={isSelected}
              >
                <span>{court.name}</span>
                <small>{court.location}</small>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
