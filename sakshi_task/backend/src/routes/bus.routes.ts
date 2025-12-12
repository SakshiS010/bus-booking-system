import { Router } from 'express';
import {
  createBusController,
  getAllBusesController,
  getBusByIdController,
  getSeatsByBusIdController,
} from '../controllers/bus.controller.js';
import { validateRequest } from '../middlewares/validate.js';
import { createBusSchema } from '../validators/bus.validator.js';
import { authenticate, requireAdmin } from '../middlewares/auth.js';

export const busRoutes = Router();

// Admin routes (protected)
busRoutes.post(
  '/',
  authenticate,
  requireAdmin,
  validateRequest(createBusSchema),
  createBusController
);

// Public routes
busRoutes.get('/', getAllBusesController);
busRoutes.get('/:id', getBusByIdController);
busRoutes.get('/:id/seats', getSeatsByBusIdController);
