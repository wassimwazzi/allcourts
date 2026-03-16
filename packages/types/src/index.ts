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
