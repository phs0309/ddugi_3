import Anthropic from '@anthropic-ai/sdk';
import { logger } from '../../utils/logger';
import { ChatMessage } from '../../../../shared/types';
import { SearchService } from '../search/searchService';
import { NaverApiService } from '../naver/naverApiService';

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
  private naverService: NaverApiService;
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
      this.searchService = null as any;
    }

    // 네이버 API 서비스 초기화
    try {
      this.naverService = new NaverApiService();
      if (this.naverService.isConfigured()) {
        logger.info('Naver API service initialized successfully');
      } else {
        logger.warn('Naver API credentials not configured');
      }
    } catch (error) {
      logger.warn('NaverApiService initialization failed:', error);
      this.naverService = null as any;
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

      // Claude API 호출 - 도구 사용 가능하도록 설정
      const response = await Promise.race([
        this.client.messages.create({
          model: this.model,
          max_tokens: 2000,
          temperature: 0.3,
          system: this.getSystemPrompt(),
          messages: [{ role: 'user', content: message }],
          tools: this.getNaverTools()
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Claude API timeout')), 30000)
        )
      ]) as any;

      let assistantResponse = '';
      const toolResults: any[] = [];

      // 응답 처리
      for (const content of response.content) {
        if (content.type === 'text') {
          assistantResponse += content.text;
        } else if (content.type === 'tool_use') {
          // 도구 사용 요청 처리
          const toolResult = await this.handleToolUse(content);
          toolResults.push(toolResult);
        }
      }

      // 도구 결과가 있으면 추가 응답 생성
      if (toolResults.length > 0) {
        const followUpResponse = await this.processToolResults(sessionId, toolResults, message);
        assistantResponse = followUpResponse;
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
      if (!this.naverService || !this.naverService.isConfigured()) {
        return {
          tool_use_id: id,
          type: 'tool_result',
          content: 'Naver API service not available'
        };
      }

      switch (name) {
        case 'search_restaurants':
          const restaurantResults = await this.naverService.searchRestaurants(
            input.query, 
            input.location || '부산',
            input.count || 10
          );
          return {
            tool_use_id: id,
            type: 'tool_result',
            content: JSON.stringify({
              success: true,
              results: restaurantResults,
              total: restaurantResults.length
            })
          };

        case 'search_accommodations':
          const accommodationResults = await this.naverService.searchAccommodations(
            input.query,
            input.location || '부산',
            input.count || 10
          );
          return {
            tool_use_id: id,
            type: 'tool_result',
            content: JSON.stringify({
              success: true,
              results: accommodationResults,
              total: accommodationResults.length
            })
          };

        case 'search_local':
          const localResults = await this.naverService.searchLocal(
            input.query,
            input.location || '부산',
            input.count || 15
          );
          return {
            tool_use_id: id,
            type: 'tool_result',
            content: JSON.stringify({
              success: true,
              results: localResults,
              total: localResults.length
            })
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

  private getNaverTools() {
    return [
      {
        name: 'search_restaurants',
        description: '네이버 API를 사용하여 음식점을 검색합니다. 맛집, 카페, 레스토랑 등을 찾을 때 사용하세요.',
        input_schema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: '검색할 음식점 종류나 이름 (예: "해물탕", "이탈리안", "카페")'
            },
            location: {
              type: 'string',
              description: '검색할 지역 (기본값: 부산)',
              default: '부산'
            },
            count: {
              type: 'number',
              description: '검색할 결과 개수 (기본값: 10)',
              default: 10
            }
          },
          required: ['query']
        }
      },
      {
        name: 'search_accommodations',
        description: '네이버 API를 사용하여 숙소를 검색합니다. 호텔, 펜션, 게스트하우스 등을 찾을 때 사용하세요.',
        input_schema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: '검색할 숙소 종류나 이름 (예: "호텔", "펜션", "리조트")'
            },
            location: {
              type: 'string',
              description: '검색할 지역 (기본값: 부산)',
              default: '부산'
            },
            count: {
              type: 'number',
              description: '검색할 결과 개수 (기본값: 10)',
              default: 10
            }
          },
          required: ['query']
        }
      },
      {
        name: 'search_local',
        description: '네이버 API를 사용하여 일반적인 장소나 관광지를 검색합니다. 관광지, 쇼핑몰, 병원 등을 찾을 때 사용하세요.',
        input_schema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: '검색할 장소나 업체 종류 (예: "관광지", "쇼핑몰", "병원")'
            },
            location: {
              type: 'string',
              description: '검색할 지역 (기본값: 부산)',
              default: '부산'
            },
            count: {
              type: 'number',
              description: '검색할 결과 개수 (기본값: 15)',
              default: 15
            }
          },
          required: ['query']
        }
      }
    ];
  }

  private async processToolResults(sessionId: string, toolResults: any[], originalMessage: string): Promise<string> {
    const history = this.getConversationHistory(sessionId);
    
    // 도구 결과를 메시지 형태로 구성
    const toolMessages = toolResults.map(result => ({
      role: 'tool_result' as const,
      tool_use_id: result.tool_use_id,
      content: result.content
    }));

    const messages = [
      ...this.formatMessagesForClaude(history.slice(-6)), // 최근 대화만 포함
      {
        role: 'user' as const,
        content: [
          {
            type: 'text' as const,
            text: originalMessage
          }
        ]
      },
      ...toolMessages
    ];
    
    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 3000,
      temperature: 0.5,
      system: this.getToolResponsePrompt(),
      messages: messages as any
    });

    const content = response.content[0];
    if (content.type === 'text') {
      return content.text;
    }

    return '죄송합니다. 응답을 처리하는 중 문제가 발생했습니다.';
  }


  private getSystemPrompt(): string {
    return `당신은 부산 여행 전문가 챗봇입니다. 사용자의 질문에 따라 적절한 검색 도구를 사용하여 정확한 정보를 제공합니다.

**사용 가능한 도구:**
- search_restaurants: 음식점, 맛집, 카페 등을 검색할 때 사용
- search_accommodations: 호텔, 펜션, 숙소 등을 검색할 때 사용  
- search_local: 관광지, 쇼핑몰, 병원 등 일반 장소를 검색할 때 사용

**도구 사용 가이드라인:**
- 사용자가 음식점이나 맛집을 묻는다면 search_restaurants 사용
- 사용자가 숙박이나 머물 곳을 묻는다면 search_accommodations 사용
- 사용자가 관광지나 기타 장소를 묻는다면 search_local 사용
- 여러 종류의 정보가 필요하면 여러 도구를 순차적으로 사용

**응답 스타일:**
- 도구 사용 전: 검색을 시작한다고 안내
- 도구 사용 후: 검색 결과를 바탕으로 상세하고 유용한 정보 제공
- 친근하고 전문적인 톤으로 답변
- 실제 검색된 장소들의 정보만 제공

사용자의 질문을 분석하여 필요한 경우 적절한 검색 도구를 사용하세요.`;
  }

  private getToolResponsePrompt(): string {
    return `네이버 검색 결과를 바탕으로 사용자에게 유용한 답변을 제공하세요.

**답변 형식:**
1. 검색 결과 요약
2. 각 장소별 상세 정보:
   - 🏢 상호명
   - 📍 주소 (도로명주소 우선)
   - ☎ 전화번호 (있는 경우)
   - 🏷️ 카테고리
   - 📝 설명/특징

**추가 팁:**
- 위치별 접근성 안내
- 주변 관광지나 편의시설 정보
- 방문 시 유의사항이나 추천사항
- 대중교통 이용 방법

검색된 실제 정보만 사용하고, 추측하지 마세요. 친근하고 도움이 되는 톤으로 답변하세요.`;
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

  // 기존 검색 메서드들은 Claude의 도구 기반 시스템으로 대체됨

  private async parseAndEnrichResponse(response: string): Promise<any> {
    // 일반 텍스트 응답으로 처리
    return {
      type: 'general',
      answer: response.trim(),
      recommendations: []
    };
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