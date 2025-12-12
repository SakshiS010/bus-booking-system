import { pool, getClient } from '../../config/database.js';
import { Bus, CreateBusInput } from '../../types/index.js';
import { logger } from '../../utils/logger.js';

/**
 * Create a new bus with seats
 */
export const createBus = async (data: CreateBusInput): Promise<Bus> => {
  const client = await getClient();
  
  try {
    await client.query('BEGIN');

    // Insert bus
    const busResult = await client.query(
      `INSERT INTO buses (name, route, departure_time, total_seats)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [data.name, data.route, data.departure_time, data.total_seats]
    );

    const bus = busResult.rows[0];

    // Create seats for the bus
    const seatValues = [];
    for (let i = 1; i <= data.total_seats; i++) {
      seatValues.push(`('${bus.id}', ${i})`);
    }

    await client.query(
      `INSERT INTO seats (bus_id, seat_number)
       VALUES ${seatValues.join(', ')}`
    );

    await client.query('COMMIT');
    
    logger.info('Bus created successfully', { busId: bus.id, name: data.name });
    
    return bus;
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('Error creating bus', { error });
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Find all buses with available seat count
 */
export const findAllBuses = async (): Promise<Bus[]> => {
  const result = await pool.query(
    `SELECT 
      b.*,
      COUNT(s.id) FILTER (WHERE s.is_available = TRUE) as available_seats
     FROM buses b
     LEFT JOIN seats s ON b.id = s.bus_id
     GROUP BY b.id
     ORDER BY b.departure_time ASC`
  );

  return result.rows;
};

/**
 * Find bus by ID
 */
export const findBusById = async (id: string): Promise<Bus | null> => {
  const result = await pool.query(
    `SELECT 
      b.*,
      COUNT(s.id) FILTER (WHERE s.is_available = TRUE) as available_seats
     FROM buses b
     LEFT JOIN seats s ON b.id = s.bus_id
     WHERE b.id = $1
     GROUP BY b.id`,
    [id]
  );

  return result.rows[0] || null;
};

/**
 * Get all seats for a bus
 */
export const getSeatsByBusId = async (busId: string) => {
  const result = await pool.query(
    `SELECT * FROM seats WHERE bus_id = $1 ORDER BY seat_number ASC`,
    [busId]
  );

  return result.rows;
};
