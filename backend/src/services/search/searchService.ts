import axios from 'axios';
import { logger } from '../../utils/logger';
import { SearchResult } from '../../../../shared/types';

interface SearchOptions {
  location?: string;
  type?: string;
  category?: string;
  budget?: string;
  cuisine?: string;
  priceRange?: string;
  mealType?: string;
  destination?: string;
  interests?: string[];
  duration?: number;
}

export class SearchService {
  private apiKey: string;
  private searchEngineId: string;
  private baseUrl: string = 'https://www.googleapis.com/customsearch/v1';

  constructor() {
    if (!process.env.GOOGLE_SEARCH_API_KEY || !process.env.GOOGLE_SEARCH_ENGINE_ID) {
      logger.warn('Google Search API credentials not configured, search functionality will be limited');
      this.apiKey = '';
      this.searchEngineId = '';
    } else {
      this.apiKey = process.env.GOOGLE_SEARCH_API_KEY;
      this.searchEngineId = process.env.GOOGLE_SEARCH_ENGINE_ID;
    }
  }

  async search(query: string, options?: SearchOptions): Promise<SearchResult[]> {
    try {
      if (!this.apiKey || !this.searchEngineId) {
        logger.warn('Search skipped - Google Search API credentials not configured');
        return this.getBusanMockResults(query, options);
      }

      const enhancedQuery = this.enhanceBusanQuery(query, options);
      logger.info(`Searching for Busan information: ${enhancedQuery}`);

      // Search multiple reliable sources for Busan information
      const response = await axios.get(this.baseUrl, {
        params: {
          key: this.apiKey,
          cx: this.searchEngineId,
          q: enhancedQuery,
          num: 10,
          safe: 'medium',
          lr: 'lang_ko', // Korean language for better local results
          // Include multiple trusted sources for Busan information
          orTerms: 'site:visitbusan.net OR site:korean.visitkorea.or.kr OR site:blog.naver.com OR site:tistory.com OR site:tripadvisor.com OR site:klook.com'
        },
        timeout: 2000 // 2초 타임아웃으로 단축
      });

      return this.parseSearchResults(response.data);
    } catch (error) {
      logger.error('Busan search API error:', error);
      return this.getBusanMockResults(query, options);
    }
  }

  async searchPlaces(query: string, options: SearchOptions): Promise<any[]> {
    const busanQuery = `부산 ${query} 관광지 명소 tourist attractions`;
    const results = await this.search(busanQuery, options);
    
    // If no results, use Busan attractions data
    if (results.length === 0) {
      return this.getBusanAttractionsMockData();
    }
    
    return results.map(result => ({
      id: `place-${Date.now()}-${Math.random()}`,
      name: result.title,
      description: result.snippet,
      url: result.url,
      type: 'attraction',
      location: {
        address: '부산',
        city: '부산'
      }
    }));
  }

  private getBusanAttractionsMockData(): any[] {
    // Return empty array to force real search
    // We should not provide potentially incorrect attraction information
    logger.info('No mock data for attractions - real search required');
    return [];
  }

  async searchRestaurants(query: string, options: SearchOptions): Promise<any[]> {
    // Search specifically for Busan restaurants on Visit Busan site
    const busanQuery = `부산 ${query} 맛집 음식점 restaurant food`;
    const results = await this.search(busanQuery, options);
    
    // If no results from API, use Busan-specific restaurant data
    if (results.length === 0) {
      return this.getBusanRestaurantMockData(query);
    }
    
    return results.map(result => ({
      id: `restaurant-${Date.now()}-${Math.random()}`,
      name: result.title,
      description: result.snippet,
      url: result.url,
      cuisine: options.cuisine || '한식/해산물',
      priceRange: options.priceRange || '₩₩',
      location: {
        address: '부산',
        city: '부산'
      }
    }));
  }

  private getBusanRestaurantMockData(query: string): any[] {
    // Return empty array to force real search
    // We should not provide fake restaurant information
    logger.info('No mock data for restaurants - real search required');
    return [];
  }

  async searchActivities(query: string, options: SearchOptions): Promise<any[]> {
    const interestsQuery = options.interests ? options.interests.join(' ') : '';
    const enhancedQuery = `${query} ${interestsQuery} activities experiences tours`;
    const results = await this.search(enhancedQuery, options);
    
    return results.map(result => ({
      id: `activity-${Date.now()}-${Math.random()}`,
      name: result.title,
      description: result.snippet,
      url: result.url,
      type: 'activity',
      duration: options.duration,
      location: {
        address: options.destination || '',
        city: options.destination
      }
    }));
  }

  async searchAccommodations(options: any): Promise<any[]> {
    const { destination, checkin_date, checkout_date, guests, budget_range } = options;
    const query = `hotels ${destination} ${budget_range || ''} accommodation booking`;
    
    try {
      const results = await this.search(query, { destination, type: 'accommodation' });
      
      return results.slice(0, 10).map((result, index) => ({
        id: `hotel-${Date.now()}-${index}`,
        name: result.title,
        description: result.snippet,
        url: result.url,
        type: 'hotel',
        location: {
          address: destination,
          city: destination
        },
        priceRange: this.mapBudgetToPrice(budget_range),
        amenities: this.generateAmenities(),
        rating: (4 + Math.random()).toFixed(1),
        availability: {
          checkin: checkin_date,
          checkout: checkout_date,
          guests: guests || 1
        },
        pricePerNight: this.generatePrice(budget_range),
        currency: 'USD'
      }));
    } catch (error) {
      logger.error('Hotel search error:', error);
      return this.getMockHotels(destination, budget_range);
    }
  }

  private enhanceBusanQuery(query: string, options?: SearchOptions): string {
    let enhanced = `부산 ${query} Busan`; // Include both Korean and English
    
    if (options?.type) {
      enhanced += ` ${options.type}`;
    }
    
    // Add context-specific search terms based on query
    const queryLower = query.toLowerCase();
    
    if (queryLower.includes('맛집') || queryLower.includes('음식') || queryLower.includes('restaurant')) {
      enhanced += ` 맛집 맛있는집 추천 리뷰 후기`;
    } else if (queryLower.includes('관광') || queryLower.includes('여행') || queryLower.includes('attraction')) {
      enhanced += ` 관광지 명소 볼거리 가볼만한곳`;
    } else if (queryLower.includes('숙박') || queryLower.includes('호텔') || queryLower.includes('hotel')) {
      enhanced += ` 호텔 숙박 게스트하우스 펜션`;
    } else {
      enhanced += ` 관광 여행 정보 가이드`;
    }
    
    return enhanced.trim();
  }

  private enhanceQuery(query: string, options?: SearchOptions): string {
    // Keep original method for backward compatibility
    return this.enhanceBusanQuery(query, options);
  }

  private parseSearchResults(data: any): SearchResult[] {
    if (!data?.items) {
      return [];
    }

    return data.items
      .filter(result => {
        // Filter to ensure results are about Busan
        const titleLower = result.title.toLowerCase();
        const snippetLower = result.snippet.toLowerCase();
        return titleLower.includes('부산') || titleLower.includes('busan') || 
               snippetLower.includes('부산') || snippetLower.includes('busan');
      })
      .map((result: any) => {
        // Determine source type from URL
        let sourceType: string = 'web';
        if (result.link.includes('visitbusan.net')) {
          sourceType = 'official';
        } else if (result.link.includes('blog.naver.com') || result.link.includes('tistory.com')) {
          sourceType = 'blog';
        } else if (result.link.includes('tripadvisor.com') || result.link.includes('klook.com')) {
          sourceType = 'travel';
        } else if (result.link.includes('visitkorea.or.kr')) {
          sourceType = 'tourism';
        }

        return {
          id: `search-${Date.now()}-${Math.random()}`,
          title: result.title,
          snippet: result.snippet,
          url: result.link,
          source: sourceType,
          relevanceScore: this.calculateRelevanceScore(result, sourceType),
          metadata: {
            displayUrl: result.displayLink,
            publishedDate: result.pagemap?.metatags?.[0]?.['article:published_time'],
            language: 'ko'
          }
        };
      })
      .sort((a, b) => b.relevanceScore - a.relevanceScore); // Sort by relevance
  }

  private calculateRelevanceScore(result: any, sourceType: string): number {
    let score = 1.0;
    
    // Boost score based on source reliability
    const sourceBoosts: Record<string, number> = {
      'official': 1.5, // Visit Busan, Visit Korea
      'tourism': 1.3,  // Tourism organization sites
      'travel': 1.2,   // TripAdvisor, Klook
      'blog': 1.1,     // Naver Blog, Tistory
      'web': 1.0       // General web
    };
    
    score *= sourceBoosts[sourceType] || 1.0;
    
    // Boost if title/snippet contains key Busan terms
    const titleLower = result.title.toLowerCase();
    const snippetLower = result.snippet.toLowerCase();
    
    const keyTerms = ['해운대', '광안리', '감천문화마을', '자갈치', '태종대', '부산역', '서면'];
    for (const term of keyTerms) {
      if (titleLower.includes(term) || snippetLower.includes(term)) {
        score *= 1.1;
      }
    }
    
    return score;
  }

  private getBusanMockResults(query: string, options?: SearchOptions): SearchResult[] {
    // Return empty array - we should only provide real search results
    logger.info('No mock data available - real search API required');
    return [];
  }

  // Keep original method for backward compatibility
  private getMockResults(query: string, options?: SearchOptions): SearchResult[] {
    return this.getBusanMockResults(query, options);
  }

  private getMockHotels(destination: string, budgetRange?: string): any[] {
    const hotels = [
      {
        name: `${destination} Grand Hotel`,
        description: 'Luxury hotel in the heart of the city with excellent amenities',
        type: 'luxury'
      },
      {
        name: `Central ${destination} Inn`,
        description: 'Mid-range hotel with comfortable rooms and good location',
        type: 'mid-range'
      },
      {
        name: `${destination} Budget Stay`,
        description: 'Clean and affordable accommodation for budget travelers',
        type: 'budget'
      }
    ];

    return hotels.map((hotel, index) => ({
      id: `hotel-mock-${Date.now()}-${index}`,
      name: hotel.name,
      description: hotel.description,
      url: `https://example.com/hotels/${hotel.name.toLowerCase().replace(/\s+/g, '-')}`,
      type: 'hotel',
      location: {
        address: destination,
        city: destination
      },
      priceRange: this.mapBudgetToPrice(budgetRange),
      amenities: this.generateAmenities(),
      rating: (4 + Math.random()).toFixed(1),
      pricePerNight: this.generatePrice(budgetRange),
      currency: 'USD'
    }));
  }

  private mapBudgetToPrice(budgetRange?: string): string {
    switch (budgetRange) {
      case 'budget': return '$';
      case 'luxury': return '$$$$';
      default: return '$$';
    }
  }

  private generatePrice(budgetRange?: string): number {
    switch (budgetRange) {
      case 'budget': return Math.floor(Math.random() * 50) + 30;
      case 'luxury': return Math.floor(Math.random() * 300) + 200;
      default: return Math.floor(Math.random() * 100) + 70;
    }
  }

  private generateAmenities(): string[] {
    const allAmenities = [
      'WiFi', 'Pool', 'Gym', 'Spa', 'Restaurant', 'Bar', 'Room Service',
      'Concierge', 'Business Center', 'Parking', 'Pet Friendly', 'Airport Shuttle'
    ];
    
    const count = Math.floor(Math.random() * 6) + 3;
    return allAmenities.sort(() => 0.5 - Math.random()).slice(0, count);
  }
}