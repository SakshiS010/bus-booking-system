import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/database.js';
import { AppError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role?: string;
  };
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const token = authHeader.split(' ')[1];

    // Verify JWT with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      logger.warn('Invalid token', { error: error?.message });
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }

    // Attach user to request
    req.user = {
      id: user.id,
      email: user.email || '',
      role: user.user_metadata?.role || 'user',
    };

    logger.debug('User authenticated', { userId: req.user.id, email: req.user.email });
    next();
  } catch (error) {
    next(error);
  }
};

export const requireAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  if (req.user.role !== 'admin') {
    logger.warn('Admin access denied', { userId: req.user.id, role: req.user.role });
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }

  next();
};
