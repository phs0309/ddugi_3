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
      logger.error('Naver API credentials not configured. Please set NAVER_CLIENT_ID and NAVER_CLIENT_SECRET');
      logger.info('Environment check:', {
        hasClientId: !!this.clientId,
        hasClientSecret: !!this.clientSecret,
        nodeEnv: process.env.NODE_ENV
      });
    } else {
      logger.info('Naver API initialized successfully', {
        clientIdLength: this.clientId.length,
        hasSecret: !!this.clientSecret
      });
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
      
      logger.info(`Searching Naver API for: "${query}" (max: ${maxResults})`);

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
        },
        timeout: 10000 // 10초 타임아웃
      });

      logger.info(`Naver API response status: ${response.status}, total: ${response.data.total || 0}, items: ${response.data.items?.length || 0}`);

      if (!response.data.items || response.data.items.length === 0) {
        logger.warn(`No results found for query: ${query}`);
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

      logger.info(`Successfully processed ${cleanedResults.length} results for: ${query}`);
      
      // 첫 번째 결과 미리보기 (디버깅용)
      if (cleanedResults.length > 0) {
        logger.info(`First result preview: ${cleanedResults[0].title} - ${cleanedResults[0].address}`);
      }

      return cleanedResults;

    } catch (error: any) {
      if (error.response) {
        logger.error(`Naver API error - Status: ${error.response.status}, Data:`, error.response.data);
        
        // 401 에러인 경우 API 키 문제 안내
        if (error.response.status === 401) {
          logger.error('Naver API authentication failed. Please check NAVER_CLIENT_ID and NAVER_CLIENT_SECRET');
        }
        // 429 에러인 경우 요청 제한 안내
        else if (error.response.status === 429) {
          logger.error('Naver API rate limit exceeded. Please try again later');
        }
      } else if (error.request) {
        logger.error('Naver API network error - no response received:', error.message);
      } else {
        logger.error('Naver API request setup error:', error.message);
      }
      
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