import { z } from 'zod';

export const createBookingSchema = z.object({
  bus_id: z.string()
    .uuid('Invalid bus ID format'),
  seat_ids: z.array(z.string().uuid('Invalid seat ID format'))
    .min(1, 'At least one seat must be selected')
    .max(10, 'Cannot book more than 10 seats at once'),
  passenger_name: z.string()
    .min(2, 'Passenger name must be at least 2 characters')
    .max(100, 'Passenger name must not exceed 100 characters'),
  passenger_email: z.string()
    .email('Invalid email format'),
  passenger_phone: z.string()
    .regex(/^\+?[1-9]\d{9,14}$/, 'Invalid phone number format. Use international format'),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
