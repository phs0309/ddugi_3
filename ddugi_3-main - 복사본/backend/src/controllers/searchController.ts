import { Request, Response, NextFunction } from 'express';
import { SearchService } from '../services/search/searchService';
import { logger } from '../utils/logger';

export class SearchController {
  private searchService: SearchService;

  constructor() {
    this.searchService = new SearchService();
  }

  search = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { query, location, type } = req.body;
      
      logger.info(`Searching for: ${query}`);
      
      const results = await this.searchService.search(query, {
        location,
        type
      });
      
      res.json({
        success: true,
        data: results,
        metadata: {
          count: results.length,
          query,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      logger.error('Search error:', error);
      next(error);
    }
  };

  searchPlaces = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { destination, category, budget } = req.body;
      
      const query = `${category} places in ${destination} ${budget ? `budget ${budget}` : ''}`;
      const results = await this.searchService.searchPlaces(query, {
        destination,
        category,
        budget
      });
      
      res.json({
        success: true,
        data: results
      });
    } catch (error) {
      logger.error('Place search error:', error);
      next(error);
    }
  };

  searchRestaurants = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { destination, cuisine, priceRange, mealType } = req.body;
      
      const query = `${cuisine || ''} restaurants in ${destination} ${priceRange || ''} ${mealType || ''}`.trim();
      const results = await this.searchService.searchRestaurants(query, {
        destination,
        cuisine,
        priceRange,
        mealType
      });
      
      res.json({
        success: true,
        data: results
      });
    } catch (error) {
      logger.error('Restaurant search error:', error);
      next(error);
    }
  };

  searchActivities = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { destination, interests, duration, budget } = req.body;
      
      const query = `activities ${interests?.join(' ')} in ${destination}`;
      const results = await this.searchService.searchActivities(query, {
        destination,
        interests,
        duration,
        budget
      });
      
      res.json({
        success: true,
        data: results
      });
    } catch (error) {
      logger.error('Activity search error:', error);
      next(error);
    }
  };
}