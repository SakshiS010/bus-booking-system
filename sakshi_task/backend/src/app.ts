import express, { Request, Response } from 'express';
import cors from 'cors';
import { busRoutes } from './routes/bus.routes.js';
import { bookingRoutes } from './routes/booking.routes.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { logger } from './utils/logger.js';

export const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req: Request, res: Response, next) => {
  logger.info('Incoming request', {
    method: req.method,
    path: req.path,
    ip: req.ip,
  });
  next();
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/buses', busRoutes);
app.use('/api/bookings', bookingRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ message: 'Route not found' });
});

// Global error handler (must be last)
app.use(errorHandler);
