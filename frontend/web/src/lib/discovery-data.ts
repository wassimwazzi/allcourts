import { getPublicSupabaseEnv } from "@/lib/env";

type FacilityRecord = {
  id: string;
  name: string;
  description: string | null;
  city: string | null;
  state_region: string | null;
  address_line1: string | null;
  latitude: number | string | null;
  longitude: number | string | null;
  rating: number | null;
  settings: Record<string, unknown> | null;
};

type CourtRecord = {
  id: string;
  facility_id: string;
  name: string;
  sport_type: string;
  surface_type: string | null;
  indoor: boolean;
  capacity: number;
  base_price_cents: number;
  currency: string;
  image_url: string | null;
  metadata: Record<string, unknown> | null;
};

type AvailabilityRecord = {
  court_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  slot_minutes: number;
  price_cents: number;
  currency: string;
  availability_type: "recurring" | "override" | "blackout";
  is_bookable: boolean;
};

export type DiscoverCourtCard = {
  id: string;
  name: string;
  sport: string;
  location: string;
  description: string;
  availability: string;
  priceFrom: number;
  travelTime: string;
  capacity: string;
  amenities: string[];
  nextSlots: string[];
  imageUrl: string;
  rating: number | null;
  coordinate: {
    latitude: number;
    longitude: number;
  } | null;
};

export type DiscoverDataResult = {
  courts: DiscoverCourtCard[];
  dataSource: "supabase" | "fallback";
  errorMessage?: string;
};

const sportImages: Record<string, string> = {
  tennis:
    "https://images.unsplash.com/photo-1560012057-4372e14c5085?auto=format&fit=crop&w=900&q=80",
  padel:
    "https://images.unsplash.com/photo-1595434091143-b375ced5fe5c?auto=format&fit=crop&w=900&q=80",
  pickleball:
    "https://images.unsplash.com/photo-1593766788306-28561086694e?auto=format&fit=crop&w=900&q=80",
  squash:
    "https://images.unsplash.com/photo-1547347298-4074fc3086f0?auto=format&fit=crop&w=900&q=80",
  badminton:
    "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=900&q=80",
  futsal:
    "https://images.unsplash.com/photo-1570498839593-e565b39455fc?auto=format&fit=crop&w=900&q=80"
};

const defaultImage =
  "https://images.unsplash.com/photo-1521412644187-c49fa049e84d?auto=format&fit=crop&w=900&q=80";

async function fetchSupabaseRest<T>(path: string): Promise<T> {
  const config = getPublicSupabaseEnv();

  if (!config) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY.");
  }

  const response = await fetch(`${config.supabaseUrl}/rest/v1/${path}`, {
    headers: {
      apikey: config.supabaseAnonKey,
      authorization: `Bearer ${config.supabaseAnonKey}`
    },
    next: { revalidate: 60 }
  });

  if (!response.ok) {
    throw new Error(`Supabase REST request failed (${response.status})`);
  }

  return (await response.json()) as T;
}

function coerceCoordinate(value: number | string | null): number | null {
  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function normalizeSportLabel(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function formatTimeSlot(time: string): string {
  const [hoursRaw, minutesRaw] = time.split(":");
  const hours = Number(hoursRaw);
  const minutes = Number(minutesRaw);

  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) {
    return time;
  }

  const date = new Date();
  date.setHours(hours, minutes, 0, 0);

  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit"
  }).format(date);
}

function getAmenityLabels(metadata: Record<string, unknown> | null, indoor: boolean): string[] {
  const labels: string[] = [];

  if (indoor) {
    labels.push("Indoor");
  }

  for (const [key, value] of Object.entries(metadata ?? {})) {
    if (typeof value !== "boolean" || value !== true) {
      continue;
    }

    labels.push(
      key
        .split("_")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ")
    );
  }

  return labels.length > 0 ? labels.slice(0, 3) : ["Bookable", "Verified facility"];
}

function getImageUrl(court: CourtRecord, facility: FacilityRecord): string {
  const settingsImage =
    (facility.settings?.listing_image_url as string | undefined) ??
    (facility.settings?.listingImageUrl as string | undefined);

  return court.image_url ?? settingsImage ?? sportImages[court.sport_type] ?? defaultImage;
}

function toDiscoverCard(
  court: CourtRecord,
  facility: FacilityRecord,
  availabilities: AvailabilityRecord[],
  dayOfWeek: number
): DiscoverCourtCard {
  const coordinate = {
    latitude: coerceCoordinate(facility.latitude),
    longitude: coerceCoordinate(facility.longitude)
  };

  const validCoordinate =
    coordinate.latitude !== null && coordinate.longitude !== null
      ? { latitude: coordinate.latitude, longitude: coordinate.longitude }
      : null;

  const sortedAvailabilities = availabilities
    .filter((item) => item.is_bookable && item.availability_type !== "blackout")
    .sort((a, b) => a.start_time.localeCompare(b.start_time));

  const daySlots = sortedAvailabilities.filter((item) => item.day_of_week === dayOfWeek);
  const slots = (daySlots.length > 0 ? daySlots : sortedAvailabilities).slice(0, 3);

  const priceCandidates = slots.map((slot) => slot.price_cents).filter((value) => value > 0);
  const fallbackPrice = court.base_price_cents > 0 ? court.base_price_cents : 0;
  const priceFromCents = priceCandidates.length > 0 ? Math.min(...priceCandidates) : fallbackPrice;

  return {
    id: court.id,
    name: `${facility.name} · ${court.name}`,
    sport: normalizeSportLabel(court.sport_type),
    location: [facility.city, facility.state_region].filter(Boolean).join(", "),
    description:
      facility.description ??
      `Book ${court.name} with real-time availability, clear policies, and instant confirmation.`,
    availability: slots.length > 0 ? `${slots.length} slots available` : "Schedule available",
    priceFrom: priceFromCents / 100,
    travelTime: facility.address_line1 ? facility.address_line1 : "Location details available",
    capacity: `Up to ${court.capacity}`,
    amenities: getAmenityLabels(court.metadata, court.indoor),
    nextSlots: slots.map((slot) => formatTimeSlot(slot.start_time)),
    imageUrl: getImageUrl(court, facility),
    rating: facility.rating ?? null,
    coordinate: validCoordinate
  };
}

export function getFallbackDiscoverData(reason: string): DiscoverDataResult {
  return {
    courts: [],
    dataSource: "fallback",
    errorMessage: `${reason} Configure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to load live courts.`
  };
}

export async function getDiscoverData(): Promise<DiscoverDataResult> {
  const config = getPublicSupabaseEnv();

  if (!config) {
    return getFallbackDiscoverData("Live discovery data is unavailable.");
  }

  try {
    const [facilities, courts, availability] = await Promise.all([
      fetchSupabaseRest<FacilityRecord[]>(
        "facilities?select=id,name,description,city,state_region,address_line1,latitude,longitude,rating,settings&status=eq.active&order=name"
      ),
      fetchSupabaseRest<CourtRecord[]>(
        "courts?select=id,facility_id,name,sport_type,surface_type,indoor,capacity,base_price_cents,currency,image_url,metadata&status=eq.active&order=display_order"
      ),
      fetchSupabaseRest<AvailabilityRecord[]>(
        "court_availability?select=court_id,day_of_week,start_time,end_time,slot_minutes,price_cents,currency,availability_type,is_bookable&is_bookable=is.true"
      )
    ]);

    const facilitiesById = new Map(facilities.map((facility) => [facility.id, facility]));
    const availabilityByCourt = new Map<string, AvailabilityRecord[]>();

    for (const slot of availability) {
      const existing = availabilityByCourt.get(slot.court_id);
      if (existing) {
        existing.push(slot);
      } else {
        availabilityByCourt.set(slot.court_id, [slot]);
      }
    }

    const dayOfWeek = new Date().getDay();

    const discoverCourts = courts
      .map((court) => {
        const facility = facilitiesById.get(court.facility_id);

        if (!facility) {
          return null;
        }

        return toDiscoverCard(court, facility, availabilityByCourt.get(court.id) ?? [], dayOfWeek);
      })
      .filter((court): court is DiscoverCourtCard => court !== null)
      .sort((a, b) => a.priceFrom - b.priceFrom || a.name.localeCompare(b.name));

    return {
      courts: discoverCourts,
      dataSource: "supabase"
    };
  } catch (error) {
    return getFallbackDiscoverData(
      error instanceof Error ? `Live discovery data failed: ${error.message}.` : "Live discovery data failed."
    );
  }
}
