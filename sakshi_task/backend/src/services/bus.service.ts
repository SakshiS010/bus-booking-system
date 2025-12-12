import * as busRepository from '../db/repositories/bus.repository.js';
import { CreateBusInput, Bus } from '../types/index.js';
import { NotFoundError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';

/**
 * Create a new bus with seats
 */
export const createBus = async (data: CreateBusInput): Promise<Bus> => {
  logger.info('Creating bus', { name: data.name, route: data.route });
  
  const bus = await busRepository.createBus(data);
  
  return bus;
};

/**
 * Get all buses with available seat counts
 */
export const getAllBuses = async (): Promise<Bus[]> => {
  const buses = await busRepository.findAllBuses();
  
  logger.info('Retrieved all buses', { count: buses.length });
  
  return buses;
};

/**
 * Get bus by ID
 */
export const getBusById = async (id: string): Promise<Bus> => {
  const bus = await busRepository.findBusById(id);
  
  if (!bus) {
    throw new NotFoundError('Bus not found');
  }
  
  return bus;
};

/**
 * Get seats for a specific bus
 */
export const getSeatsByBusId = async (busId: string) => {
  // First verify bus exists
  await getBusById(busId);
  
  const seats = await busRepository.getSeatsByBusId(busId);
  
  return seats;
};
