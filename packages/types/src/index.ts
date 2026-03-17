export type Sport = 'tennis' | 'soccer' | 'basketball';

export type UserRole = 'player' | 'facility_manager' | 'facility_staff' | 'platform_admin';

export interface FacilitySummary {
  id: string;
  name: string;
  city: string;
  supportedSports: Sport[];
}

export interface BookingWindow {
  startAt: string;
  endAt: string;
}

export type CheckoutStep = 'slot' | 'details' | 'payment' | 'confirmed';

export interface CheckoutCourt {
  courtId: string;
  courtName: string;
  facilityName: string;
  sport: string;
  location: string;
  imageUrl: string;
  currency: string;
  availabilityByDay: Record<string, CheckoutSlot[]>; // key: "YYYY-MM-DD"
}

export interface CheckoutSlot {
  date: string;       // "YYYY-MM-DD"
  startTime: string;  // "HH:MM"
  endTime: string;    // "HH:MM"
  priceCents: number;
  currency: string;
  label: string;      // formatted display label e.g. "9:00 AM – 10:00 AM"
}
