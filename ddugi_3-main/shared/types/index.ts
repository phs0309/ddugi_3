export interface TravelQuery {
  destination?: string;
  startDate?: string;
  endDate?: string;
  budget?: number;
  currency?: string;
  travelers?: number;
  interests?: string[];
  accommodationType?: 'budget' | 'mid-range' | 'luxury';
  travelStyle?: 'relaxed' | 'moderate' | 'packed';
}

export interface Itinerary {
  id: string;
  userId?: string;
  destination: string;
  startDate: string;
  endDate: string;
  budget: Budget;
  days: DayPlan[];
  recommendations: Recommendation[];
  createdAt: Date;
  updatedAt: Date;
}

export interface DayPlan {
  day: number;
  date: string;
  activities: Activity[];
  meals: Meal[];
  accommodation?: Accommodation;
  notes?: string;
}

export interface Activity {
  id: string;
  name: string;
  description: string;
  location: Location;
  duration: number; // in minutes
  cost: number;
  category: string;
  rating?: number;
  tips?: string;
  bookingUrl?: string;
  startTime?: string;
  endTime?: string;
}

export interface Meal {
  id: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  restaurant: Restaurant;
  estimatedCost: number;
  recommendations?: string[];
}

export interface Restaurant {
  name: string;
  cuisine: string;
  location: Location;
  priceRange: '$' | '$$' | '$$$' | '$$$$';
  rating?: number;
  specialties?: string[];
  reservationRequired?: boolean;
  website?: string;
}

export interface Accommodation {
  name: string;
  type: string;
  location: Location;
  pricePerNight: number;
  amenities?: string[];
  rating?: number;
  bookingUrl?: string;
  checkIn?: string;
  checkOut?: string;
}

export interface Location {
  address: string;
  city?: string;
  country?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  mapUrl?: string;
}

export interface Budget {
  total: number;
  accommodation: number;
  food: number;
  activities: number;
  transportation: number;
  miscellaneous: number;
  currency: string;
}

export interface Recommendation {
  id: string;
  type: 'attraction' | 'restaurant' | 'activity' | 'shopping' | 'tip';
  name: string;
  description: string;
  location?: Location;
  estimatedCost?: number;
  rating?: number;
  bestTimeToVisit?: string;
  duration?: number;
  tips?: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    itineraryId?: string;
    suggestions?: string[];
    relatedPlaces?: Recommendation[];
    sessionId?: string;
    processingTime?: number;
  };
}

export interface SearchResult {
  id: string;
  title: string;
  snippet: string;
  url: string;
  source: 'web' | 'local' | 'ai';
  relevanceScore?: number;
  metadata?: Record<string, any>;
}

export interface User {
  id: string;
  email?: string;
  preferences?: UserPreferences;
  savedItineraries?: string[];
  createdAt: Date;
}

export interface UserPreferences {
  defaultCurrency: string;
  preferredLanguage: string;
  dietaryRestrictions?: string[];
  accessibilityNeeds?: string[];
  interests: string[];
  avoidances?: string[];
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  metadata?: {
    requestId: string;
    timestamp: Date;
    processingTime?: number;
  };
}

export interface WeatherInfo {
  date: string;
  temperature: {
    min: number;
    max: number;
    unit: 'celsius' | 'fahrenheit';
  };
  condition: string;
  precipitation?: number;
  humidity?: number;
  windSpeed?: number;
}