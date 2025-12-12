import { z } from 'zod';

export const createBusSchema = z.object({
  name: z.string()
    .min(3, 'Bus name must be at least 3 characters')
    .max(100, 'Bus name must not exceed 100 characters'),
  route: z.string()
    .min(5, 'Route must be at least 5 characters')
    .max(200, 'Route must not exceed 200 characters'),
  departure_time: z.string()
    .datetime('Invalid datetime format. Use ISO 8601 format'),
  total_seats: z.number()
    .int('Total seats must be an integer')
    .min(10, 'Bus must have at least 10 seats')
    .max(100, 'Bus cannot have more than 100 seats'),
});

export type CreateBusInput = z.infer<typeof createBusSchema>;
