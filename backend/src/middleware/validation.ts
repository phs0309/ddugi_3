import { body, query, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request parameters',
        details: errors.array()
      }
    });
  }
  
  next();
};

export const validateChatRequest = [
  body('message')
    .notEmpty().withMessage('Message is required')
    .isString().withMessage('Message must be a string')
    .isLength({ min: 1, max: 5000 }).withMessage('Message must be between 1 and 5000 characters'),
  body('sessionId')
    .notEmpty().withMessage('Session ID is required')
    .isString().withMessage('Session ID must be a string'),
  body('context')
    .optional()
    .isObject().withMessage('Context must be an object'),
  handleValidationErrors
];

export const validateSearchRequest = [
  body('query')
    .optional()
    .isString().withMessage('Query must be a string')
    .isLength({ max: 500 }).withMessage('Query must be less than 500 characters'),
  body('destination')
    .optional()
    .isString().withMessage('Destination must be a string'),
  body('location')
    .optional()
    .isString().withMessage('Location must be a string'),
  body('type')
    .optional()
    .isIn(['places', 'restaurants', 'activities', 'general'])
    .withMessage('Invalid search type'),
  handleValidationErrors
];

export const validateItineraryRequest = [
  body('destination')
    .notEmpty().withMessage('Destination is required')
    .isString().withMessage('Destination must be a string'),
  body('startDate')
    .notEmpty().withMessage('Start date is required')
    .isISO8601().withMessage('Start date must be a valid ISO 8601 date'),
  body('endDate')
    .notEmpty().withMessage('End date is required')
    .isISO8601().withMessage('End date must be a valid ISO 8601 date')
    .custom((value, { req }) => {
      const startDate = new Date(req.body.startDate);
      const endDate = new Date(value);
      return endDate > startDate;
    }).withMessage('End date must be after start date'),
  body('budget')
    .optional()
    .isNumeric().withMessage('Budget must be a number')
    .isFloat({ min: 0 }).withMessage('Budget must be positive'),
  body('currency')
    .optional()
    .isString().withMessage('Currency must be a string')
    .isLength({ min: 3, max: 3 }).withMessage('Currency must be a 3-letter code'),
  body('travelers')
    .optional()
    .isInt({ min: 1, max: 20 }).withMessage('Travelers must be between 1 and 20'),
  body('interests')
    .optional()
    .isArray().withMessage('Interests must be an array')
    .custom((value) => value.every((item: any) => typeof item === 'string'))
    .withMessage('All interests must be strings'),
  body('accommodationType')
    .optional()
    .isIn(['budget', 'mid-range', 'luxury'])
    .withMessage('Invalid accommodation type'),
  body('travelStyle')
    .optional()
    .isIn(['relaxed', 'moderate', 'packed'])
    .withMessage('Invalid travel style'),
  handleValidationErrors
];