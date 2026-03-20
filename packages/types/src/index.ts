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

// ─── User / Profile ──────────────────────────────────────────────────────────

export interface UserProfile {
  id: string;
  email?: string;
  fullName?: string;
  phone?: string;
  avatarUrl?: string;
  timezone: string;
  role: UserRole;
  onboardingStatus: 'pending' | 'active' | 'suspended';
}

// ─── Bookings ─────────────────────────────────────────────────────────────────

export type BookingStatus =
  | 'pending'
  | 'awaiting_payment'
  | 'confirmed'
  | 'checked_in'
  | 'completed'
  | 'cancelled'
  | 'refunded'
  | 'no_show';

export type PaymentStatus =
  | 'unpaid'
  | 'pending'
  | 'authorized'
  | 'paid'
  | 'partially_refunded'
  | 'refunded'
  | 'failed';

export interface BookingSummary {
  id: string;
  bookingReference: string;
  courtId: string;
  courtName: string;
  facilityName: string;
  facilityCity?: string;
  bookingDate: string;    // "YYYY-MM-DD"
  startTime: string;      // "HH:MM"
  endTime: string;        // "HH:MM"
  timezone: string;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  totalCents: number;
  currency: string;
}

export interface BookingDetail extends BookingSummary {
  ownerProfileId: string;
  subtotalCents: number;
  discountCents: number;
  taxCents: number;
  platformFeeCents: number;
  notes?: string;
  bookedForName?: string;
  bookedForPhone?: string;
  guestCount: number;
  confirmedAt?: string;
  cancelledAt?: string;
  participants: BookingParticipant[];
}

// ─── Booking Participants (invitations) ───────────────────────────────────────

export type ParticipantStatus = 'pending' | 'accepted' | 'declined';
export type ParticipantRole = 'player' | 'spectator';

export interface BookingParticipant {
  id: string;
  bookingId: string;
  inviterProfileId: string;
  inviteeProfileId?: string;
  inviteeEmail: string;
  role: ParticipantRole;
  status: ParticipantStatus;
  invitedAt: string;
  respondedAt?: string;
}
