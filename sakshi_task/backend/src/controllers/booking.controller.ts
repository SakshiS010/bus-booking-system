import { Request, Response } from 'express';
import * as bookingService from '../services/booking.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { logger } from '../utils/logger.js';

/**
 * Create a new booking
 * POST /api/bookings
 */
export const createBookingController = asyncHandler(
  async (req: Request, res: Response) => {
    const booking = await bookingService.createBooking(req.body);
    
    res.status(201).json({
      message: 'Booking created successfully',
      data: booking,
    });
  }
);

/**
 * Get booking status by ID
 * GET /api/bookings/:id
 */
export const getBookingStatusController = asyncHandler(
  async (req: Request, res: Response) => {
    const booking = await bookingService.getBookingById(req.params.id);
    
    res.status(200).json({
      data: booking,
    });
  }
);
