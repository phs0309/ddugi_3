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
      // 환경 변수 확인
      const hasClaudeAPI = !!process.env.ANTHROPIC_API_KEY;
      const hasNaverClientId = !!process.env.NAVER_CLIENT_ID;
      const hasNaverSecret = !!process.env.NAVER_CLIENT_SECRET;
      const hasNaverAPI = hasNaverClientId && hasNaverSecret;

      logger.info('Health check - Environment status:', {
        hasClaudeAPI,
        hasNaverClientId,
        hasNaverSecret,
        nodeEnv: process.env.NODE_ENV
      });

      // 간단한 Claude 테스트 (실제로는 호출하지 않고 설정만 확인)
      let claudeStatus = hasClaudeAPI ? 'configured' : 'missing';
      let naverStatus = hasNaverAPI ? 'configured' : 'missing';

      const overallStatus = hasClaudeAPI ? 'healthy' : 'degraded';
      
      const response = {
        status: overallStatus,
        timestamp: new Date().toISOString(),
        services: {
          claude: {
            status: claudeStatus,
            required: true
          },
          naver: {
            status: naverStatus,
            required: false,
            note: naverStatus === 'missing' ? 'Will use Claude-only mode' : 'Real-time search enabled'
          }
        },
        version: '2.0.0',
        features: {
          basicChat: hasClaudeAPI,
          realTimeSearch: hasNaverAPI
        }
      };

      const httpStatus = hasClaudeAPI ? 200 : 503;
      res.status(httpStatus).json(response);
      
    } catch (error) {
      logger.error('Health check failed:', error);
      
      res.status(503).json({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Health check failed',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  }
}