import { Request, Response, NextFunction } from 'express';

/**
 * Global async wrapper handler for Express route handlers
 * Automatically catches errors from async functions and passes them to error middleware
 * 
 * @param fn - Async route handler function
 * @returns Wrapped function that catches errors
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
