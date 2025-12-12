/**
 * Base application error class
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(statusCode: number, message: string, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 400 Bad Request - Validation errors
 */
export class ValidationError extends AppError {
  constructor(message: string) {
    super(400, message);
  }
}

/**
 * 404 Not Found - Resource not found
 */
export class NotFoundError extends AppError {
  constructor(message: string) {
    super(404, message);
  }
}

/**
 * 409 Conflict - Resource conflict (e.g., seat already booked)
 */
export class ConflictError extends AppError {
  constructor(message: string) {
    super(409, message);
  }
}

/**
 * 500 Internal Server Error - Unexpected errors
 */
export class InternalServerError extends AppError {
  constructor(message: string = 'Internal server error') {
    super(500, message, false);
  }
}
