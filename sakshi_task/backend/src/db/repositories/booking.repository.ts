import { pool, getClient } from '../../config/database.js';
import { Booking, CreateBookingInput } from '../../types/index.js';
import { logger } from '../../utils/logger.js';
import { ConflictError } from '../../utils/errors.js';

/**
 * Create a booking with pessimistic locking to prevent race conditions
 * Uses SELECT FOR UPDATE to lock seats during transaction
 */
export const createBookingWithLock = async (
  data: CreateBookingInput
): Promise<Booking> => {
  const client = await getClient();

  try {
    await client.query('BEGIN');

    // Lock the seats for update (pessimistic locking)
    const seatCheckResult = await client.query(
      `SELECT id, is_available 
       FROM seats 
       WHERE id = ANY($1::uuid[])
       FOR UPDATE`,
      [data.seat_ids]
    );

    // Verify all seats exist
    if (seatCheckResult.rows.length !== data.seat_ids.length) {
      throw new ConflictError('One or more seats do not exist');
    }

    // Check if all seats are available
    const unavailableSeats = seatCheckResult.rows.filter(
      (seat) => !seat.is_available
    );

    if (unavailableSeats.length > 0) {
      throw new ConflictError('One or more selected seats are no longer available');
    }

    // Mark seats as unavailable
    await client.query(
      `UPDATE seats 
       SET is_available = FALSE 
       WHERE id = ANY($1::uuid[])`,
      [data.seat_ids]
    );

    // Create booking with PENDING status
    const bookingResult = await client.query(
      `INSERT INTO bookings (bus_id, seat_ids, passenger_name, passenger_email, passenger_phone, status)
       VALUES ($1, $2, $3, $4, $5, 'PENDING')
       RETURNING *`,
      [
        data.bus_id,
        data.seat_ids,
        data.passenger_name,
        data.passenger_email,
        data.passenger_phone,
      ]
    );

    await client.query('COMMIT');

    const booking = bookingResult.rows[0];
    logger.info('Booking created successfully', { 
      bookingId: booking.id, 
      busId: data.bus_id,
      seatCount: data.seat_ids.length 
    });

    return booking;
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('Error creating booking', { error, data });
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Update booking status
 */
export const updateBookingStatus = async (
  id: string,
  status: 'PENDING' | 'CONFIRMED' | 'FAILED'
): Promise<Booking> => {
  const result = await pool.query(
    `UPDATE bookings 
     SET status = $1 
     WHERE id = $2 
     RETURNING *`,
    [status, id]
  );

  return result.rows[0];
};

/**
 * Find booking by ID
 */
export const findBookingById = async (id: string): Promise<Booking | null> => {
  const result = await pool.query(
    `SELECT * FROM bookings WHERE id = $1`,
    [id]
  );

  return result.rows[0] || null;
};

/**
 * Find expired bookings (PENDING for more than 2 minutes)
 */
export const findExpiredBookings = async (): Promise<Booking[]> => {
  const result = await pool.query(
    `SELECT * FROM bookings 
     WHERE status = 'PENDING' 
     AND created_at < NOW() - INTERVAL '2 minutes'`
  );

  return result.rows;
};

/**
 * Release seats for a booking (set back to available)
 */
export const releaseSeats = async (seatIds: string[]): Promise<void> => {
  await pool.query(
    `UPDATE seats 
     SET is_available = TRUE 
     WHERE id = ANY($1::uuid[])`,
    [seatIds]
  );

  logger.info('Seats released', { seatCount: seatIds.length });
};
