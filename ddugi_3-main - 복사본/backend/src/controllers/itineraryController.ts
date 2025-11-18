import { Request, Response, NextFunction } from 'express';
import { ItineraryGenerator } from '../services/itinerary/itineraryGenerator';
import { ClaudeService } from '../services/claude/claudeService';
import { SearchService } from '../services/search/searchService';
import { logger } from '../utils/logger';
import { TravelQuery, Itinerary } from '../../../shared/types';

export class ItineraryController {
  private itineraryGenerator: ItineraryGenerator;
  private claudeService: ClaudeService;
  private searchService: SearchService;
  private itineraries: Map<string, Itinerary> = new Map();

  constructor() {
    this.itineraryGenerator = new ItineraryGenerator();
    this.claudeService = new ClaudeService();
    this.searchService = new SearchService();
  }

  generateItinerary = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const travelQuery: TravelQuery = req.body;
      
      logger.info(`Generating itinerary for ${travelQuery.destination}`);
      
      const searchResults = await this.gatherDestinationInfo(travelQuery);
      
      const itinerary = await this.itineraryGenerator.generate({
        query: travelQuery,
        searchResults,
        claudeService: this.claudeService
      });
      
      this.itineraries.set(itinerary.id, itinerary);
      
      res.json({
        success: true,
        data: itinerary,
        metadata: {
          generatedAt: new Date().toISOString(),
          estimatedBudget: itinerary.budget.total
        }
      });
    } catch (error) {
      logger.error('Itinerary generation error:', error);
      next(error);
    }
  };

  getItinerary = async (req: Request, res: Response) => {
    const { id } = req.params;
    
    const itinerary = this.itineraries.get(id);
    
    if (!itinerary) {
      return res.status(404).json({
        success: false,
        error: { message: 'Itinerary not found' }
      });
    }
    
    res.json({
      success: true,
      data: itinerary
    });
  };

  updateItinerary = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      const existingItinerary = this.itineraries.get(id);
      
      if (!existingItinerary) {
        return res.status(404).json({
          success: false,
          error: { message: 'Itinerary not found' }
        });
      }
      
      const updatedItinerary = {
        ...existingItinerary,
        ...updates,
        updatedAt: new Date()
      };
      
      this.itineraries.set(id, updatedItinerary);
      
      res.json({
        success: true,
        data: updatedItinerary
      });
    } catch (error) {
      logger.error('Itinerary update error:', error);
      next(error);
    }
  };

  optimizeItinerary = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      
      const itinerary = this.itineraries.get(id);
      
      if (!itinerary) {
        return res.status(404).json({
          success: false,
          error: { message: 'Itinerary not found' }
        });
      }
      
      const optimizedItinerary = await this.itineraryGenerator.optimize(itinerary);
      this.itineraries.set(id, optimizedItinerary);
      
      res.json({
        success: true,
        data: optimizedItinerary,
        metadata: {
          optimizationSummary: {
            costSaved: itinerary.budget.total - optimizedItinerary.budget.total,
            timeOptimized: true
          }
        }
      });
    } catch (error) {
      logger.error('Itinerary optimization error:', error);
      next(error);
    }
  };

  private async gatherDestinationInfo(query: TravelQuery) {
    const searchPromises = [
      this.searchService.searchPlaces(`tourist attractions in ${query.destination}`, {
        destination: query.destination,
        category: 'attractions'
      }),
      this.searchService.searchRestaurants(`best restaurants in ${query.destination}`, {
        destination: query.destination
      }),
      this.searchService.searchActivities(`things to do in ${query.destination}`, {
        destination: query.destination,
        interests: query.interests
      })
    ];
    
    const [places, restaurants, activities] = await Promise.all(searchPromises);
    
    return {
      places,
      restaurants,
      activities
    };
  }
}