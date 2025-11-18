import { Itinerary, Budget, DayPlan } from '../../../../shared/types';
import { logger } from '../../utils/logger';

export class BudgetCalculator {
  calculate(itinerary: Itinerary): Budget {
    logger.info('Calculating budget for itinerary');
    
    const days = itinerary.days.length;
    const accommodationCost = this.calculateAccommodationCost(itinerary);
    const foodCost = this.calculateFoodCost(itinerary.days);
    const activitiesCost = this.calculateActivitiesCost(itinerary.days);
    const transportationCost = this.estimateTransportationCost(days, itinerary.destination);
    const miscellaneousCost = (accommodationCost + foodCost + activitiesCost) * 0.1;
    
    const total = accommodationCost + foodCost + activitiesCost + transportationCost + miscellaneousCost;
    
    return {
      total: Math.round(total),
      accommodation: Math.round(accommodationCost),
      food: Math.round(foodCost),
      activities: Math.round(activitiesCost),
      transportation: Math.round(transportationCost),
      miscellaneous: Math.round(miscellaneousCost),
      currency: itinerary.budget?.currency || 'USD'
    };
  }

  optimize(itinerary: Itinerary): Budget {
    logger.info('Optimizing budget for itinerary');
    
    const currentBudget = this.calculate(itinerary);
    
    if (!itinerary.budget || currentBudget.total <= itinerary.budget.total) {
      return currentBudget;
    }
    
    const targetBudget = itinerary.budget.total;
    const ratio = targetBudget / currentBudget.total;
    
    return {
      total: targetBudget,
      accommodation: Math.round(currentBudget.accommodation * ratio),
      food: Math.round(currentBudget.food * ratio),
      activities: Math.round(currentBudget.activities * ratio),
      transportation: Math.round(currentBudget.transportation * ratio),
      miscellaneous: Math.round(currentBudget.miscellaneous * ratio),
      currency: currentBudget.currency
    };
  }

  private calculateAccommodationCost(itinerary: Itinerary): number {
    const nights = itinerary.days.length - 1 || 1;
    let pricePerNight = 100;
    
    const hasAccommodation = itinerary.days.some(day => day.accommodation);
    
    if (hasAccommodation) {
      const accommodationCosts = itinerary.days
        .filter(day => day.accommodation)
        .map(day => day.accommodation!.pricePerNight);
      
      if (accommodationCosts.length > 0) {
        pricePerNight = accommodationCosts.reduce((a, b) => a + b, 0) / accommodationCosts.length;
      }
    }
    
    return nights * pricePerNight;
  }

  private calculateFoodCost(days: DayPlan[]): number {
    let totalFoodCost = 0;
    
    days.forEach(day => {
      if (day.meals && day.meals.length > 0) {
        totalFoodCost += day.meals.reduce((sum, meal) => sum + (meal.estimatedCost || 30), 0);
      } else {
        totalFoodCost += 90;
      }
    });
    
    return totalFoodCost;
  }

  private calculateActivitiesCost(days: DayPlan[]): number {
    let totalActivitiesCost = 0;
    
    days.forEach(day => {
      if (day.activities && day.activities.length > 0) {
        totalActivitiesCost += day.activities.reduce((sum, activity) => sum + (activity.cost || 50), 0);
      } else {
        totalActivitiesCost += 100;
      }
    });
    
    return totalActivitiesCost;
  }

  private estimateTransportationCost(days: number, destination: string): number {
    const dailyTransport = 20;
    
    const airportTransfer = 50;
    
    const interCityTravel = days > 3 ? 100 : 0;
    
    return (dailyTransport * days) + (airportTransfer * 2) + interCityTravel;
  }
}