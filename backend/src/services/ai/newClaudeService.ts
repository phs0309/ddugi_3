import Anthropic from '@anthropic-ai/sdk';
import { logger } from '../../utils/logger';
import { NaverSearchService } from './naverSearchService';

interface ChatResponse {
  answer: string;
  searchResults?: any[];
  locations?: string[];
  type: 'travel' | 'general';
}

export class NewClaudeService {
  private claude: Anthropic;
  private naverSearch: NaverSearchService;

  constructor() {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY is required');
    }

    this.claude = new Anthropic({
      apiKey: apiKey
    });

    this.naverSearch = new NaverSearchService();
  }

  async processChat(message: string): Promise<ChatResponse> {
    try {
      // 1. Claude에게 초기 답변 요청
      const claudeResponse = await this.getClaudeResponse(message);
      
      // 2. 답변에서 여행 관련 장소/키워드 추출
      const extractedKeywords = this.extractTravelKeywords(claudeResponse);
      
      // 3. 여행 관련 답변인 경우 네이버 검색으로 실제 정보 수집
      let searchResults: any[] = [];
      if (extractedKeywords.length > 0) {
        searchResults = await this.searchTravelInfo(extractedKeywords);
      }

      // 4. 최종 답변 생성 (Claude 답변 + 실제 검색 정보)
      const finalAnswer = await this.generateFinalAnswer(claudeResponse, searchResults);

      return {
        answer: finalAnswer,
        searchResults,
        locations: extractedKeywords,
        type: extractedKeywords.length > 0 ? 'travel' : 'general'
      };

    } catch (error) {
      logger.error('NewClaudeService error:', error);
      throw new Error('AI 서비스 처리 중 오류가 발생했습니다.');
    }
  }

  private async getClaudeResponse(message: string): Promise<string> {
    const response = await this.claude.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 1500,
      temperature: 0.7,
      system: `당신은 부산 여행 전문가입니다. 
      
사용자의 질문에 대해 친근하고 도움이 되는 답변을 제공하세요.
여행 관련 답변을 할 때는 구체적인 장소명, 식당명, 숙소명을 언급하세요.

답변 스타일:
- 친근하고 자연스러운 한국어 사용
- 구체적이고 실용적인 정보 제공
- 부산 지역 전문성 활용`,
      messages: [
        {
          role: 'user',
          content: message
        }
      ]
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude');
    }

    return content.text;
  }

  private extractTravelKeywords(text: string): string[] {
    // 한국어 장소명, 식당명, 숙소명 추출을 위한 패턴
    const patterns = [
      // 일반적인 장소 패턴
      /([가-힣]+(?:해수욕장|공원|시장|타워|센터|몰|광장|마을|동|구))/g,
      // 식당/카페 패턴  
      /([가-힣]+(?:식당|카페|레스토랑|집|횟집|국밥|갈비|치킨|피자))/g,
      // 숙소 패턴
      /([가-힣]+(?:호텔|펜션|게스트하우스|리조트|모텔))/g,
      // 부산 특화 지역명
      /(해운대|광안리|태종대|감천|자갈치|국제시장|송도|서면|남포동|기장|동래)/g
    ];

    const keywords = new Set<string>();
    
    patterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        matches.forEach(match => keywords.add(match));
      }
    });

    return Array.from(keywords).slice(0, 5); // 최대 5개 키워드
  }

  private async searchTravelInfo(keywords: string[]): Promise<any[]> {
    const searchResults: any[] = [];

    for (const keyword of keywords) {
      try {
        // 네이버 검색 API로 실제 정보 수집
        const results = await this.naverSearch.search(keyword, 3); // 키워드당 최대 3개
        searchResults.push(...results);
      } catch (error) {
        logger.warn(`Search failed for keyword: ${keyword}`, error);
      }
    }

    return searchResults.slice(0, 10); // 전체 최대 10개
  }

  private async generateFinalAnswer(claudeResponse: string, searchResults: any[]): Promise<string> {
    if (searchResults.length === 0) {
      return claudeResponse;
    }

    // Claude 답변 + 실제 검색 정보를 결합
    const searchInfo = searchResults.map(result => 
      `**${result.title}**\n📍 ${result.address || result.roadAddress || ''}\n${result.telephone ? `☎ ${result.telephone}` : ''}\n💡 ${result.description || ''}`
    ).join('\n\n');

    const finalResponse = await this.claude.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 2000,
      temperature: 0.5,
      system: `사용자에게 도움이 되는 최종 답변을 만드세요. 
      
기존 답변과 실제 검색된 정보를 자연스럽게 결합하여:
1. 기존 답변의 내용을 유지하면서
2. 실제 검색된 정보를 추가로 제공
3. 중복 제거하고 정리된 형태로 제시

실제 정보가 있는 경우 그것을 우선하여 추천하세요.`,
      messages: [
        {
          role: 'user',
          content: `기존 답변: ${claudeResponse}

실제 검색 정보:
${searchInfo}

위 정보들을 종합하여 사용자에게 도움이 되는 최종 답변을 작성해주세요.`
        }
      ]
    });

    const content = finalResponse.content[0];
    if (content.type !== 'text') {
      return claudeResponse;
    }

    return content.text;
  }
}