import Anthropic from '@anthropic-ai/sdk';
import { logger } from '../../utils/logger';
import { getSystemPrompt, getChatPrompt, getItineraryPrompt } from './promptTemplates';

interface GenerateResponseOptions {
  message: string;
  intent: any;
  context?: any;
}

export class ClaudeService {
  private client: Anthropic;
  private model: string;

  constructor() {
    // Try multiple possible environment variable names
    const apiKey = process.env.ANTHROPIC_API_KEY || 
                   process.env.claude_api_key || 
                   process.env.CLAUDE_API_KEY;
    
    if (!apiKey) {
      logger.error('Claude API key is not configured (tried ANTHROPIC_API_KEY, claude_api_key, CLAUDE_API_KEY)');
      // Create a mock client to prevent initialization errors
      this.client = null as any;
    } else {
      logger.info('Claude API key found, initializing client');
      this.client = new Anthropic({
        apiKey: apiKey
      });
    }
    
    this.model = process.env.CLAUDE_MODEL || 'claude-sonnet-4-5';
  }

  async generateResponse(options: GenerateResponseOptions): Promise<string> {
    try {
      if (!this.client) {
        return "죄송합니다. AI 서비스가 현재 사용할 수 없습니다. 환경 설정을 확인해주세요.";
      }

      const { message, intent, context } = options;
      
      const systemPrompt = getSystemPrompt(intent.type);
      const userPrompt = getChatPrompt(message, context);
      
      logger.info(`Generating Claude response for intent: ${intent.type}`);
      
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: parseInt(process.env.MAX_TOKENS || '1024'),
        temperature: parseFloat(process.env.TEMPERATURE || '0.7'),
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: userPrompt
          }
        ]
      });
      
      const content = response.content[0];
      
      if (content.type !== 'text') {
        throw new Error('Unexpected response type from Claude');
      }
      
      return content.text;
    } catch (error) {
      logger.error('Claude API error:', error);
      throw new Error('Failed to generate AI response');
    }
  }

  async generateItinerary(travelQuery: any, searchResults: any): Promise<any> {
    try {
      if (!this.client) {
        throw new Error('AI service is not available');
      }

      const prompt = getItineraryPrompt(travelQuery, searchResults);
      
      logger.info('Generating itinerary with Claude');
      
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 8192,
        temperature: 0.8,
        system: "You are an expert travel planner. Create detailed, personalized travel itineraries in JSON format.",
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      });
      
      const content = response.content[0];
      
      if (content.type !== 'text') {
        throw new Error('Unexpected response type');
      }
      
      try {
        const jsonMatch = content.text.match(/```json\n?([\s\S]*?)\n?```/);
        const jsonStr = jsonMatch ? jsonMatch[1] : content.text;
        return JSON.parse(jsonStr);
      } catch (parseError) {
        logger.error('Failed to parse itinerary JSON:', parseError);
        throw new Error('Failed to parse itinerary response');
      }
    } catch (error) {
      logger.error('Claude itinerary generation error:', error);
      throw new Error('Failed to generate itinerary');
    }
  }

  async analyzeIntent(message: string): Promise<any> {
    try {
      if (!this.client) {
        return {
          type: 'general',
          requiresSearch: false,
          suggestions: []
        };
      }

      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 1024,
        temperature: 0.3,
        system: `Analyze the user's BUSAN travel-related intent and return a JSON object with:
        - type: "search" | "itinerary" | "recommendation" | "general"
        - requiresSearch: boolean
        - searchQuery: string (if search is needed, add "부산" to the query)
        - destination: string (ALWAYS "부산" or "Busan")
        - dates: object with startDate and endDate (if mentioned)
        - budget: number in KRW (if mentioned)
        - suggestions: array of BUSAN-specific follow-up questions in Korean
        
        IMPORTANT: All suggestions must be about Busan only. Examples:
        - "부산의 어느 지역을 방문하고 싶으신가요?"
        - "부산 맛집을 찾으시나요?"
        - "해운대와 광안리 중 어디가 좋을까요?"`,
        messages: [
          {
            role: 'user',
            content: `Analyze this message: "${message}"`
          }
        ]
      });
      
      const content = response.content[0];
      
      if (content.type !== 'text') {
        throw new Error('Unexpected response type');
      }
      
      try {
        const jsonMatch = content.text.match(/```json\n?([\s\S]*?)\n?```/);
        const jsonStr = jsonMatch ? jsonMatch[1] : content.text;
        return JSON.parse(jsonStr);
      } catch {
        return {
          type: 'general',
          requiresSearch: false,
          suggestions: []
        };
      }
    } catch (error) {
      logger.error('Intent analysis error:', error);
      return {
        type: 'general',
        requiresSearch: false,
        suggestions: []
      };
    }
  }
}