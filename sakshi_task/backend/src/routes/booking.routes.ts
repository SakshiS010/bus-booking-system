import { Router } from 'express';
import {
  createBookingController,
  getBookingStatusController,
} from '../controllers/booking.controller.js';
import { validateRequest } from '../middlewares/validate.js';
import { createBookingSchema } from '../validators/booking.validator.js';

export const bookingRoutes = Router();

bookingRoutes.post('/', validateRequest(createBookingSchema), createBookingController);
bookingRoutes.get('/:id', getBookingStatusController);
