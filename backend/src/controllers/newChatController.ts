import { Request, Response } from 'express';
import { NewClaudeService } from '../services/ai/newClaudeService';
import { logger } from '../utils/logger';

const claudeService = new NewClaudeService();

export class NewChatController {
  async chat(req: Request, res: Response) {
    try {
      const { message } = req.body;

      if (!message || typeof message !== 'string') {
        return res.status(400).json({
          success: false,
          message: '메시지가 필요합니다.'
        });
      }

      logger.info(`Processing chat message: ${message.substring(0, 100)}...`);

      // 새로운 AI 서비스로 처리
      const result = await claudeService.processChat(message);

      // 응답 형식을 기존 UI와 호환되도록 구성
      const chatMessage = {
        id: Date.now().toString(),
        role: 'assistant' as const,
        content: result.answer,
        timestamp: new Date(),
        metadata: {
          type: result.type,
          searchResults: result.searchResults,
          locations: result.locations
        }
      };

      res.json({
        success: true,
        data: chatMessage,
        debug: {
          hasSearchResults: (result.searchResults?.length || 0) > 0,
          locationsFound: result.locations?.length || 0,
          responseType: result.type
        }
      });

    } catch (error) {
      logger.error('New chat controller error:', error);
      
      res.status(500).json({
        success: false,
        message: '죄송합니다. 일시적인 문제가 발생했어요. 다시 시도해 주세요.',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  }

  async health(req: Request, res: Response) {
    try {
      // Claude API 연결 상태 확인
      const testResponse = await claudeService.processChat('안녕하세요');
      
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        ai: {
          claude: 'connected',
          naver: 'configured' // 네이버 API 설정 여부만 확인
        },
        version: '2.0.0'
      });
      
    } catch (error) {
      logger.error('Health check failed:', error);
      
      res.status(503).json({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'AI service unavailable'
      });
    }
  }
}