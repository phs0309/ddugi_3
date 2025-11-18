import axios from 'axios';
import { logger } from '../../utils/logger';

export interface NaverSearchResult {
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

export class NaverSearchService {
  private clientId: string;
  private clientSecret: string;
  private baseUrl = 'https://openapi.naver.com/v1/search';

  constructor() {
    this.clientId = process.env.NAVER_CLIENT_ID || '';
    this.clientSecret = process.env.NAVER_CLIENT_SECRET || '';

    if (!this.clientId || !this.clientSecret) {
      logger.warn('Naver API credentials not configured');
    }
  }

  async search(keyword: string, maxResults: number = 5): Promise<NaverSearchResult[]> {
    if (!this.clientId || !this.clientSecret) {
      logger.warn('Naver API not configured, returning empty results');
      return [];
    }

    try {
      // 부산 지역으로 한정하여 검색
      const query = `부산 ${keyword}`;
      
      const response = await axios.get(`${this.baseUrl}/local.json`, {
        params: {
          query: query,
          display: maxResults,
          start: 1,
          sort: 'random'
        },
        headers: {
          'X-Naver-Client-Id': this.clientId,
          'X-Naver-Client-Secret': this.clientSecret,
          'User-Agent': 'travel-ai-service/1.0.0'
        }
      });

      if (!response.data.items) {
        return [];
      }

      // HTML 태그 제거 및 데이터 정리
      const cleanedResults: NaverSearchResult[] = response.data.items.map((item: any) => ({
        title: this.removeHtmlTags(item.title),
        link: item.link,
        category: this.removeHtmlTags(item.category),
        description: this.removeHtmlTags(item.description),
        telephone: item.telephone || '',
        address: item.address || '',
        roadAddress: item.roadAddress || '',
        mapx: item.mapx || '',
        mapy: item.mapy || ''
      }));

      logger.info(`Naver search found ${cleanedResults.length} results for: ${query}`);
      return cleanedResults;

    } catch (error) {
      logger.error('Naver search error:', error);
      return [];
    }
  }

  private removeHtmlTags(text: string): string {
    if (!text) return '';
    return text.replace(/<[^>]*>/g, '').trim();
  }

  isConfigured(): boolean {
    return !!(this.clientId && this.clientSecret);
  }

  // 특화된 검색 메서드들
  async searchRestaurants(query: string, maxResults: number = 5): Promise<NaverSearchResult[]> {
    return this.search(`${query} 맛집 식당`, maxResults);
  }

  async searchHotels(query: string, maxResults: number = 5): Promise<NaverSearchResult[]> {
    return this.search(`${query} 호텔 숙소`, maxResults);
  }

  async searchAttractions(query: string, maxResults: number = 5): Promise<NaverSearchResult[]> {
    return this.search(`${query} 관광지 명소`, maxResults);
  }
}