import Anthropic from '@anthropic-ai/sdk';
import { logger } from '../../utils/logger';
import { ChatMessage } from '../../../../shared/types';
import { SearchService } from '../search/searchService';

interface ConversationContext {
  destination?: string;
  budget?: number;
  duration?: number;
  travelers?: number;
  interests?: string[];
  dates?: {
    startDate?: string;
    endDate?: string;
  };
}

export class EnhancedClaudeService {
  private client: Anthropic;
  private model: string;
  private searchService: SearchService;
  private conversationHistory: Map<string, ChatMessage[]> = new Map();

  constructor() {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY is not configured');
    }

    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY
    });
    
    this.model = process.env.CLAUDE_MODEL || 'claude-3-5-haiku-20241022';
    
    try {
      this.searchService = new SearchService();
    } catch (error) {
      logger.warn('SearchService initialization failed, using fallback mode:', error);
      // Initialize with null and handle gracefully in methods
      this.searchService = null as any;
    }
  }

  async processMessage(sessionId: string, message: string): Promise<any> {
    try {
      // 대화 히스토리 가져오기
      const history = this.getConversationHistory(sessionId);
      
      // 사용자 메시지를 히스토리에 추가
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'user',
        content: message,
        timestamp: new Date()
      };
      this.addToHistory(sessionId, userMessage);

      // Google Search 빠른 테스트 (1초 타임아웃)
      const needsSearch = this.shouldUseSearch(message);
      let searchContext = '';
      
      if (needsSearch) {
        try {
          const searchResults = await Promise.race([
            this.performSearch(message),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Search timeout')), 1000)
            )
          ]) as string;
          searchContext = `\n\n검색된 부산 여행 정보:\n${searchResults}`;
          logger.info('Search completed successfully');
        } catch (error) {
          logger.warn('Search failed, proceeding without search:', error);
          searchContext = '';
        }
      }

      // Claude API 호출 (단순화, 타임아웃 25초)
      const response = await Promise.race([
        this.client.messages.create({
          model: this.model,
          max_tokens: 1000,
          temperature: 0,
          system: this.getSystemPrompt(),
          messages: [{ role: 'user', content: message }]
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Claude API timeout')), 25000)
        )
      ]) as any;

      let assistantResponse = '';

      // 응답 처리
      for (const content of response.content) {
        if (content.type === 'text') {
          assistantResponse += content.text;
        }
      }

      // JSON 파싱 시도
      const structuredResponse = await this.parseAndEnrichResponse(assistantResponse);

      // 어시스턴트 응답을 히스토리에 추가
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: typeof structuredResponse === 'string' ? structuredResponse : JSON.stringify(structuredResponse),
        timestamp: new Date()
      };
      this.addToHistory(sessionId, assistantMessage);

      return structuredResponse;
    } catch (error) {
      logger.error('Enhanced Claude service error:', error);
      throw new Error('AI 응답을 생성하는 중 오류가 발생했습니다.');
    }
  }

  private async handleToolUse(toolUse: any): Promise<any> {
    const { name, id, input } = toolUse;
    
    logger.info(`Tool called: ${name} with input:`, input);

    try {
      if (!this.searchService) {
        return {
          tool_use_id: id,
          type: 'tool_result',
          content: 'Search service not available'
        };
      }

      switch (name) {
        case 'search_hotels':
          const hotelResults = await this.searchService.searchAccommodations(input);
          return {
            tool_use_id: id,
            type: 'tool_result',
            content: JSON.stringify(hotelResults)
          };

        case 'search_restaurants':
          const restaurantResults = await this.searchService.searchRestaurants(
            `restaurants in ${input.destination}`, 
            input
          );
          return {
            tool_use_id: id,
            type: 'tool_result',
            content: JSON.stringify(restaurantResults)
          };

        case 'search_attractions':
          const attractionResults = await this.searchService.searchPlaces(
            `attractions in ${input.destination}`,
            input
          );
          return {
            tool_use_id: id,
            type: 'tool_result',
            content: JSON.stringify(attractionResults)
          };

        case 'get_weather':
          const weatherResults = await this.getWeatherInfo(input.destination);
          return {
            tool_use_id: id,
            type: 'tool_result',
            content: JSON.stringify(weatherResults)
          };

        default:
          return {
            tool_use_id: id,
            type: 'tool_result',
            content: 'Tool not found'
          };
      }
    } catch (error) {
      logger.error(`Tool ${name} error:`, error);
      return {
        tool_use_id: id,
        type: 'tool_result',
        content: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  private async processToolResults(sessionId: string, toolResults: any[], originalMessage: string): Promise<string> {
    const history = this.getConversationHistory(sessionId);
    
    const messages = this.formatMessagesForClaude(history);
    
    // 검색 결과를 프롬프트에 포함하여 자연스러운 응답 생성
    const searchContext = toolResults.length > 0 ? 
      `\n\n검색 결과:\n${toolResults.map(result => result.content).join('\n\n')}` : '';
    
    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 4096,
      temperature: 0.7,
      system: `${this.getSystemPrompt()}\n\n검색 결과를 바탕으로 한국어로 자연스럽고 유용한 답변을 제공하세요. 가격, 위치, 특징 등 구체적인 정보를 포함하세요.${searchContext}`,
      messages: messages
    });

    const content = response.content[0];
    if (content.type === 'text') {
      return content.text;
    }

    return '죄송합니다. 응답을 처리하는 중 문제가 발생했습니다.';
  }


  private getSystemPrompt(): string {
    return `부산 여행 플래너. JSON만 응답.

일정 요청:
{"type":"itinerary","title":"부산 2박3일","summary":"해변 맛집","totalBudget":500000,"duration":"2박3일","days":[{"day":1,"date":"첫째날","theme":"해운대","locations":[{"name":"해운대해수욕장","type":"attraction","address":"해운대구","description":"해변","duration":"2시간","cost":0,"tips":"일출","coordinates":{"lat":35.16,"lng":129.16}}]}],"transportation":"지하철","tips":["신발"],"budget":{"accommodation":200000,"food":150000,"activities":100000,"transportation":30000,"miscellaneous":20000}}

일반:
{"type":"general","answer":"답변","recommendations":[]}`;
  }

  private formatMessagesForClaude(messages: ChatMessage[]): Anthropic.MessageParam[] {
    return messages.map(msg => ({
      role: msg.role === 'system' ? 'assistant' : msg.role,
      content: msg.content
    }));
  }

  private getConversationHistory(sessionId: string): ChatMessage[] {
    return this.conversationHistory.get(sessionId) || [];
  }

  private addToHistory(sessionId: string, message: ChatMessage): void {
    const history = this.getConversationHistory(sessionId);
    history.push(message);
    
    // 최근 10개 메시지만 유지
    if (history.length > 20) { // user + assistant pairs, so 20 = 10 conversations
      history.splice(0, history.length - 20);
    }
    
    this.conversationHistory.set(sessionId, history);
  }

  private async getWeatherInfo(destination: string): Promise<any> {
    // Mock weather data - 실제로는 날씨 API를 연동
    return {
      destination,
      temperature: Math.floor(Math.random() * 30) + 10,
      condition: ['sunny', 'cloudy', 'rainy'][Math.floor(Math.random() * 3)],
      humidity: Math.floor(Math.random() * 40) + 40,
      forecast: '맑은 날씨가 예상됩니다.'
    };
  }

  // 대화 히스토리 관리 메서드들
  getSessionHistory(sessionId: string): ChatMessage[] {
    return this.getConversationHistory(sessionId);
  }

  clearSessionHistory(sessionId: string): void {
    this.conversationHistory.delete(sessionId);
  }

  private shouldUseSearch(message: string): boolean {
    const searchKeywords = [
      '일정', '여행', '추천', '맛집', '관광지', '숙박', '호텔', '펜션', 
      '맛있는', '유명한', '볼거리', '가볼만한', '체험', '액티비티',
      '해운대', '광안리', '태종대', '감천', '자갈치', '국제시장', '송도'
    ];
    
    return searchKeywords.some(keyword => message.includes(keyword));
  }

  private async performSearch(message: string): Promise<string> {
    try {
      if (!this.searchService) {
        logger.warn('Search service not available, skipping search');
        return '';
      }
      
      // 부산 관련 검색 수행
      const query = `부산 ${message}`;
      const searchResults = await this.searchService.search(query);
      
      if (searchResults.length > 0) {
        return searchResults
          .slice(0, 5) // 상위 5개 결과만 사용
          .map(result => `- ${result.title}: ${result.snippet}`)
          .join('\n');
      }
      
      return '검색 결과가 없습니다.';
    } catch (error) {
      logger.error('Search error:', error);
      return '';
    }
  }

  private async parseAndEnrichResponse(response: string): Promise<any> {
    try {
      // JSON 파싱 시도
      const cleanResponse = response.trim();
      let jsonStart = cleanResponse.indexOf('{');
      let jsonEnd = cleanResponse.lastIndexOf('}') + 1;
      
      if (jsonStart === -1 || jsonEnd === 0) {
        // JSON 형태가 아닌 일반 텍스트 응답
        return {
          type: 'general',
          answer: response,
          recommendations: []
        };
      }
      
      const jsonString = cleanResponse.substring(jsonStart, jsonEnd);
      const parsedResponse = JSON.parse(jsonString);
      
      // 이미지 추가 (장소별)
      if (parsedResponse.type === 'itinerary' && parsedResponse.days) {
        for (const day of parsedResponse.days) {
          if (day.locations) {
            for (const location of day.locations) {
              location.image = await this.getLocationImage(location.name);
            }
          }
        }
      } else if (parsedResponse.type === 'general' && parsedResponse.recommendations) {
        for (const rec of parsedResponse.recommendations) {
          rec.image = await this.getLocationImage(rec.name);
        }
      }
      
      return parsedResponse;
    } catch (error) {
      logger.error('JSON parsing error:', error);
      // JSON 파싱 실패시 일반 텍스트로 처리
      return {
        type: 'general',
        answer: response,
        recommendations: []
      };
    }
  }

  private async getLocationImage(locationName: string): Promise<string> {
    try {
      if (!this.searchService) {
        return '/images/busan-default.jpg';
      }
      
      // Google Custom Search API로 이미지 검색
      const query = `부산 ${locationName} 사진`;
      const searchResults = await this.searchService.search(query);
      
      // 첫 번째 검색 결과의 이미지 또는 기본 이미지 반환
      if (searchResults.length > 0 && searchResults[0].metadata?.image) {
        return searchResults[0].metadata.image;
      }
      
      // 기본 부산 이미지
      return '/images/busan-default.jpg';
    } catch (error) {
      logger.error('Image search error:', error);
      return '/images/busan-default.jpg';
    }
  }
}