import { z } from 'zod';

export const sportSchema = z.enum(['tennis', 'soccer', 'basketball']);

export const bookingWindowSchema = z.object({
  startAt: z.string().datetime(),
  endAt: z.string().datetime(),
});

export const facilitySummarySchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  city: z.string().min(1),
  supportedSports: z.array(sportSchema).min(1),
});

// ─── Profile ──────────────────────────────────────────────────────────────────

export const updateProfileSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters').max(100),
  phone: z
    .string()
    .min(6, 'Phone must be at least 6 characters')
    .max(30)
    .optional()
    .or(z.literal('')),
  timezone: z.string().min(1, 'Timezone is required'),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const signUpSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export type SignUpInput = z.infer<typeof signUpSchema>;

export const signInSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

export type SignInInput = z.infer<typeof signInSchema>;

// ─── Booking Invitations ──────────────────────────────────────────────────────

export const inviteParticipantSchema = z.object({
  bookingId: z.string().uuid(),
  inviteeEmail: z.string().email('Please enter a valid email'),
  role: z.enum(['player', 'spectator']).default('player'),
});

export type InviteParticipantInput = z.infer<typeof inviteParticipantSchema>;
