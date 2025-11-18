import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  logger.error({
    error: {
      message: err.message,
      stack: err.stack,
      statusCode,
      path: req.path,
      method: req.method
    }
  });
  
  res.status(statusCode).json({
    success: false,
    error: {
      code: statusCode === 500 ? 'INTERNAL_SERVER_ERROR' : 'REQUEST_ERROR',
      message: statusCode === 500 && process.env.NODE_ENV === 'production' 
        ? 'An unexpected error occurred' 
        : message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    },
    metadata: {
      requestId: req.headers['x-request-id'] || 'unknown',
      timestamp: new Date().toISOString()
    }
  });
};