import { ClaudeService } from './claudeService';
import { logger } from '../../utils/logger';

export interface Intent {
  type: 'search' | 'itinerary' | 'recommendation' | 'general';
  requiresSearch: boolean;
  searchQuery?: string;
  destination?: string;
  dates?: {
    startDate?: string;
    endDate?: string;
  };
  budget?: number;
  suggestions?: string[];
}

export class IntentAnalyzer {
  private claudeService: ClaudeService;
  
  constructor() {
    this.claudeService = new ClaudeService();
  }
  
  async analyzeIntent(message: string): Promise<Intent> {
    try {
      const intent = await this.claudeService.analyzeIntent(message);
      
      logger.info(`Intent analyzed: ${JSON.stringify(intent)}`);
      
      return this.validateIntent(intent);
    } catch (error) {
      logger.error('Intent analysis failed:', error);
      
      return this.fallbackIntentAnalysis(message);
    }
  }
  
  private validateIntent(intent: any): Intent {
    const validTypes = ['search', 'itinerary', 'recommendation', 'general'];
    
    return {
      type: validTypes.includes(intent.type) ? intent.type : 'general',
      requiresSearch: Boolean(intent.requiresSearch),
      searchQuery: intent.searchQuery,
      destination: intent.destination,
      dates: intent.dates,
      budget: intent.budget,
      suggestions: Array.isArray(intent.suggestions) ? intent.suggestions : []
    };
  }
  
  private fallbackIntentAnalysis(message: string): Intent {
    const lowerMessage = message.toLowerCase();
    
    const keywords = {
      itinerary: ['itinerary', 'plan', 'schedule', 'trip to', 'travel to'],
      search: ['where', 'what', 'find', 'best', 'recommend', 'restaurant', 'hotel', 'attraction'],
      recommendation: ['suggest', 'should i', 'advice', 'tips', 'help me choose']
    };
    
    let detectedType: Intent['type'] = 'general';
    let requiresSearch = false;
    
    for (const [type, words] of Object.entries(keywords)) {
      if (words.some(word => lowerMessage.includes(word))) {
        detectedType = type as Intent['type'];
        if (type === 'search') requiresSearch = true;
        break;
      }
    }
    
    const destinationMatch = message.match(/(?:to|in|at|visit)\s+([A-Z][a-zA-Z\s]+)/);
    const budgetMatch = message.match(/\$?\d+(?:,\d{3})*(?:\.\d{2})?/);
    
    return {
      type: detectedType,
      requiresSearch,
      destination: destinationMatch?.[1],
      budget: budgetMatch ? parseFloat(budgetMatch[0].replace(/[$,]/g, '')) : undefined,
      suggestions: this.generateSuggestions(detectedType)
    };
  }
  
  private generateSuggestions(type: Intent['type']): string[] {
    const suggestions: Record<Intent['type'], string[]> = {
      itinerary: [
        '부산 여행 일정은 며칠로 계획하시나요?',
        '부산 여행 예산은 어느 정도로 생각하시나요?',
        '해운대, 광안리, 감천문화마을 중 어디를 가보고 싶으신가요?'
      ],
      search: [
        '부산의 어느 지역 맛집을 찾으시나요? (해운대, 서면, 남포동 등)',
        '부산 전통음식(밀면, 돼지국밥, 어묵)을 드시고 싶으신가요?',
        '부산의 해산물 요리를 찾으시나요?'
      ],
      recommendation: [
        '부산의 바다를 보고 싶으신가요, 아니면 도시 관광을 원하시나요?',
        '부산 여행은 처음이신가요?',
        '자갈치시장이나 국제시장 쇼핑에 관심 있으신가요?'
      ],
      general: [
        '부산 여행 일정을 짜는데 도움이 필요하신가요?',
        '부산의 유명 관광지를 추천해드릴까요?',
        '부산 맛집 정보가 필요하신가요?'
      ]
    };
    
    return suggestions[type];
  }
}