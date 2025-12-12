import { Request, Response } from 'express';
import * as busService from '../services/bus.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { logger } from '../utils/logger.js';

/**
 * Create a new bus
 * POST /api/buses
 */
export const createBusController = asyncHandler(
  async (req: Request, res: Response) => {
    const bus = await busService.createBus(req.body);
    
    res.status(201).json({
      message: 'Bus created successfully',
      data: bus,
    });
  }
);

/**
 * Get all buses
 * GET /api/buses
 */
export const getAllBusesController = asyncHandler(
  async (req: Request, res: Response) => {
    const buses = await busService.getAllBuses();
    
    res.status(200).json({
      data: buses,
    });
  }
);

/**
 * Get bus by ID
 * GET /api/buses/:id
 */
export const getBusByIdController = asyncHandler(
  async (req: Request, res: Response) => {
    const bus = await busService.getBusById(req.params.id);
    
    res.status(200).json({
      data: bus,
    });
  }
);

/**
 * Get seats for a bus
 * GET /api/buses/:id/seats
 */
export const getSeatsByBusIdController = asyncHandler(
  async (req: Request, res: Response) => {
    const seats = await busService.getSeatsByBusId(req.params.id);
    
    res.status(200).json({
      data: seats,
    });
  }
);
