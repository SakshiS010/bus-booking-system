import * as bookingRepository from '../db/repositories/booking.repository.js';
import { CreateBookingInput, Booking } from '../types/index.js';
import { NotFoundError, ConflictError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';
import { getBusById } from './bus.service.js';

/**
 * Create a new booking with concurrency handling
 */
export const createBooking = async (data: CreateBookingInput): Promise<Booking> => {
  logger.info('Creating booking', { 
    busId: data.bus_id, 
    seatCount: data.seat_ids.length 
  });

  // Verify bus exists
  await getBusById(data.bus_id);

  try {
    // Create booking with pessimistic locking
    const booking = await bookingRepository.createBookingWithLock(data);
    
    // In a real application, this would trigger payment processing
    // For now, we'll immediately confirm the booking
    const confirmedBooking = await bookingRepository.updateBookingStatus(
      booking.id,
      'CONFIRMED'
    );
    
    logger.info('Booking confirmed', { bookingId: confirmedBooking.id });
    
    return confirmedBooking;
  } catch (error) {
    if (error instanceof ConflictError) {
      throw error;
    }
    
    logger.error('Unexpected error during booking', { error });
    throw new Error('Failed to create booking');
  }
};

/**
 * Get booking by ID
 */
export const getBookingById = async (id: string): Promise<Booking> => {
  const booking = await bookingRepository.findBookingById(id);
  
  if (!booking) {
    throw new NotFoundError('Booking not found');
  }
  
  return booking;
};

/**
 * Process expired bookings (background job)
 * Marks PENDING bookings as FAILED after 2 minutes and releases seats
 */
export const processExpiredBookings = async (): Promise<void> => {
  try {
    const expiredBookings = await bookingRepository.findExpiredBookings();
    
    if (expiredBookings.length === 0) {
      return;
    }
    
    logger.info('Processing expired bookings', { count: expiredBookings.length });
    
    for (const booking of expiredBookings) {
      // Mark booking as FAILED
      await bookingRepository.updateBookingStatus(booking.id, 'FAILED');
      
      // Release the seats
      await bookingRepository.releaseSeats(booking.seat_ids);
      
      logger.info('Booking expired and seats released', { 
        bookingId: booking.id,
        seatCount: booking.seat_ids.length 
      });
    }
  } catch (error) {
    logger.error('Error processing expired bookings', { error });
  }
};
