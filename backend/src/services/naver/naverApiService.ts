import axios from 'axios';
import { logger } from '../../utils/logger';

export interface NaverPlace {
  title: string;
  link: string;
  category: string;
  description: string;
  telephone: string;
  address: string;
  roadAddress: string;
  mapx: string;
  mapy: string;
}

export interface NaverSearchResult {
  total: number;
  start: number;
  display: number;
  items: NaverPlace[];
}

export class NaverApiService {
  private clientId: string;
  private clientSecret: string;
  private baseUrl = 'https://openapi.naver.com/v1/search';

  constructor() {
    this.clientId = process.env.NAVER_CLIENT_ID || '';
    this.clientSecret = process.env.NAVER_CLIENT_SECRET || '';

    if (!this.clientId || !this.clientSecret) {
      logger.warn('Naver API credentials not found. Service will be limited.');
    }
  }

  private getHeaders() {
    return {
      'X-Naver-Client-Id': this.clientId,
      'X-Naver-Client-Secret': this.clientSecret,
      'User-Agent': 'travel-ai-service/1.0.0'
    };
  }

  async searchRestaurants(query: string, location: string = '부산', display: number = 10): Promise<NaverPlace[]> {
    try {
      if (!this.clientId || !this.clientSecret) {
        throw new Error('Naver API credentials not configured');
      }

      const searchQuery = `${location} ${query} 맛집`;
      
      const response = await axios.get(`${this.baseUrl}/local.json`, {
        params: {
          query: searchQuery,
          display,
          start: 1,
          sort: 'random'
        },
        headers: this.getHeaders()
      });

      const result: NaverSearchResult = response.data;
      
      // HTML 태그 제거 및 데이터 정리
      const cleanedItems = result.items.map(item => ({
        ...item,
        title: this.removeHtmlTags(item.title),
        description: this.removeHtmlTags(item.description),
        category: this.removeHtmlTags(item.category)
      }));

      logger.info(`Found ${cleanedItems.length} restaurants for query: ${searchQuery}`);
      return cleanedItems;

    } catch (error) {
      logger.error('Naver restaurant search error:', error);
      throw new Error('음식점 검색에 실패했습니다.');
    }
  }

  async searchAccommodations(query: string, location: string = '부산', display: number = 10): Promise<NaverPlace[]> {
    try {
      if (!this.clientId || !this.clientSecret) {
        throw new Error('Naver API credentials not configured');
      }

      const searchQuery = `${location} ${query} 숙소 호텔`;
      
      const response = await axios.get(`${this.baseUrl}/local.json`, {
        params: {
          query: searchQuery,
          display,
          start: 1,
          sort: 'random'
        },
        headers: this.getHeaders()
      });

      const result: NaverSearchResult = response.data;
      
      // HTML 태그 제거 및 데이터 정리
      const cleanedItems = result.items.map(item => ({
        ...item,
        title: this.removeHtmlTags(item.title),
        description: this.removeHtmlTags(item.description),
        category: this.removeHtmlTags(item.category)
      }));

      logger.info(`Found ${cleanedItems.length} accommodations for query: ${searchQuery}`);
      return cleanedItems;

    } catch (error) {
      logger.error('Naver accommodation search error:', error);
      throw new Error('숙소 검색에 실패했습니다.');
    }
  }

  async searchLocal(query: string, location: string = '부산', display: number = 15): Promise<NaverPlace[]> {
    try {
      if (!this.clientId || !this.clientSecret) {
        throw new Error('Naver API credentials not configured');
      }

      const searchQuery = `${location} ${query}`;
      
      const response = await axios.get(`${this.baseUrl}/local.json`, {
        params: {
          query: searchQuery,
          display,
          start: 1,
          sort: 'random'
        },
        headers: this.getHeaders()
      });

      const result: NaverSearchResult = response.data;
      
      // HTML 태그 제거 및 데이터 정리
      const cleanedItems = result.items.map(item => ({
        ...item,
        title: this.removeHtmlTags(item.title),
        description: this.removeHtmlTags(item.description),
        category: this.removeHtmlTags(item.category)
      }));

      logger.info(`Found ${cleanedItems.length} local places for query: ${searchQuery}`);
      return cleanedItems;

    } catch (error) {
      logger.error('Naver local search error:', error);
      throw new Error('지역 검색에 실패했습니다.');
    }
  }

  private removeHtmlTags(text: string): string {
    return text.replace(/<[^>]*>/g, '').trim();
  }

  async getPlaceDetails(title: string, address: string): Promise<string> {
    try {
      // 네이버 검색 API를 통해 상세 정보 검색
      const response = await axios.get(`${this.baseUrl}/blog.json`, {
        params: {
          query: `${title} ${address} 후기`,
          display: 3,
          start: 1,
          sort: 'sim'
        },
        headers: this.getHeaders()
      });

      if (response.data.items && response.data.items.length > 0) {
        const blogPosts = response.data.items.map((item: any) => 
          this.removeHtmlTags(item.description)
        );
        return blogPosts.join(' ');
      }

      return '';
    } catch (error) {
      logger.error('Failed to get place details:', error);
      return '';
    }
  }

  isConfigured(): boolean {
    return !!(this.clientId && this.clientSecret);
  }
}