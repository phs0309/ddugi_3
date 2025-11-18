import { v4 as uuidv4 } from 'uuid';
import { ClaudeService } from '../claude/claudeService';
import { logger } from '../../utils/logger';
import { TravelQuery, Itinerary, DayPlan, Budget } from '../../../../shared/types';
import { BudgetCalculator } from './budgetCalculator';

interface GenerateOptions {
  query: TravelQuery;
  searchResults: any;
  claudeService: ClaudeService;
}

export class ItineraryGenerator {
  private budgetCalculator: BudgetCalculator;

  constructor() {
    this.budgetCalculator = new BudgetCalculator();
  }

  async generate(options: GenerateOptions): Promise<Itinerary> {
    const { query, searchResults, claudeService } = options;
    
    try {
      logger.info(`Generating itinerary for ${query.destination}`);
      
      const aiItinerary = await claudeService.generateItinerary(query, searchResults);
      
      const itinerary = this.processAIResponse(aiItinerary, query);
      
      itinerary.budget = this.budgetCalculator.calculate(itinerary);
      
      return itinerary;
    } catch (error) {
      logger.error('Failed to generate AI itinerary, using fallback:', error);
      return this.generateFallbackItinerary(query, searchResults);
    }
  }

  async optimize(itinerary: Itinerary): Promise<Itinerary> {
    logger.info(`Optimizing itinerary ${itinerary.id}`);
    
    const optimized = { ...itinerary };
    
    optimized.days = this.optimizeSchedule(itinerary.days);
    
    optimized.budget = this.budgetCalculator.optimize(optimized);
    
    optimized.updatedAt = new Date();
    
    return optimized;
  }

  private processAIResponse(aiResponse: any, query: TravelQuery): Itinerary {
    const id = uuidv4();
    
    return {
      id,
      destination: query.destination || aiResponse.destination,
      startDate: query.startDate || aiResponse.startDate,
      endDate: query.endDate || aiResponse.endDate,
      budget: aiResponse.budget || this.createDefaultBudget(query),
      days: aiResponse.days || [],
      recommendations: aiResponse.recommendations || [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  private generateFallbackItinerary(query: TravelQuery, searchResults: any): Itinerary {
    const id = uuidv4();
    const days = this.calculateDays(query.startDate!, query.endDate!);
    
    const dayPlans: DayPlan[] = this.createDayPlans(days, searchResults);
    
    const budget = this.createDefaultBudget(query);
    
    return {
      id,
      destination: query.destination!,
      startDate: query.startDate!,
      endDate: query.endDate!,
      budget,
      days: dayPlans,
      recommendations: this.createRecommendations(searchResults),
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  private createDayPlans(days: number, searchResults: any): DayPlan[] {
    const plans: DayPlan[] = [];
    const places = searchResults.places || [];
    const restaurants = searchResults.restaurants || [];
    const activities = searchResults.activities || [];
    
    for (let day = 1; day <= days; day++) {
      const dayActivities = activities.slice((day - 1) * 3, day * 3);
      const dayRestaurants = restaurants.slice((day - 1) * 3, day * 3);
      
      plans.push({
        day,
        date: this.addDays(new Date(), day - 1).toISOString().split('T')[0],
        activities: dayActivities.map((activity: any, index: number) => ({
          id: `activity-${day}-${index}`,
          name: activity.name,
          description: activity.description,
          location: activity.location || { address: '' },
          duration: 120,
          cost: 50,
          category: 'sightseeing',
          startTime: `${9 + (index * 3)}:00`,
          endTime: `${11 + (index * 3)}:00`
        })),
        meals: dayRestaurants.map((restaurant: any, index: number) => ({
          id: `meal-${day}-${index}`,
          type: ['breakfast', 'lunch', 'dinner'][index] as any,
          restaurant: {
            name: restaurant.name,
            cuisine: restaurant.cuisine || 'local',
            location: restaurant.location || { address: '' },
            priceRange: restaurant.priceRange || '$$',
            rating: 4.0
          },
          estimatedCost: 30
        }))
      });
    }
    
    return plans;
  }

  private createRecommendations(searchResults: any): any[] {
    const recommendations: any[] = [];
    
    if (searchResults.places) {
      searchResults.places.slice(0, 5).forEach((place: any) => {
        recommendations.push({
          id: uuidv4(),
          type: 'attraction',
          name: place.name,
          description: place.description,
          location: place.location
        });
      });
    }
    
    return recommendations;
  }

  private createDefaultBudget(query: TravelQuery): Budget {
    const totalBudget = query.budget || 1000;
    
    return {
      total: totalBudget,
      accommodation: totalBudget * 0.35,
      food: totalBudget * 0.25,
      activities: totalBudget * 0.25,
      transportation: totalBudget * 0.10,
      miscellaneous: totalBudget * 0.05,
      currency: query.currency || 'USD'
    };
  }

  private optimizeSchedule(days: DayPlan[]): DayPlan[] {
    return days.map(day => {
      const activities = [...day.activities].sort((a, b) => {
        const timeA = parseInt(a.startTime?.split(':')[0] || '0');
        const timeB = parseInt(b.startTime?.split(':')[0] || '0');
        return timeA - timeB;
      });
      
      return { ...day, activities };
    });
  }

  private calculateDays(startDate: string, endDate: string): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays + 1;
  }

  private addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }
}