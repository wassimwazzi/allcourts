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
