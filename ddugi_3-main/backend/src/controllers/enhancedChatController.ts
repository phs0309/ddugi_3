import { Request, Response, NextFunction } from 'express';
import { EnhancedClaudeService } from '../services/claude/enhancedClaudeService';
import { logger } from '../utils/logger';
import { ChatMessage } from '../../../shared/types';

export class EnhancedChatController {
  private claudeService: EnhancedClaudeService;

  constructor() {
    this.claudeService = new EnhancedClaudeService();
  }

  handleChat = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { message, sessionId, context } = req.body;
      
      if (!message || !sessionId) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_REQUIRED_FIELDS',
            message: 'Message and sessionId are required'
          }
        });
      }
      
      logger.info(`Processing enhanced chat message for session: ${sessionId}`);
      logger.info(`User message: ${message.substring(0, 100)}...`);
      
      // Enhanced Claude 서비스로 메시지 처리
      const response = await this.claudeService.processMessage(sessionId, message);
      
      // 응답 처리 (response가 object일 수 있으므로 string으로 변환)
      const responseContent = typeof response === 'string' ? response : JSON.stringify(response);
      
      // 응답 생성
      const assistantMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: responseContent,
        timestamp: new Date(),
        metadata: {
          sessionId,
          processingTime: Date.now() - parseInt(req.headers['x-request-start'] as string || '0')
        }
      };
      
      logger.info(`Generated response length: ${responseContent.length} characters`);
      
      res.json({
        success: true,
        data: assistantMessage,
        metadata: {
          sessionId,
          timestamp: new Date().toISOString(),
          hasToolCalls: responseContent.includes('검색') || responseContent.includes('찾았습니다'),
          conversationLength: this.claudeService.getSessionHistory(sessionId).length
        }
      });
      
    } catch (error) {
      logger.error('Enhanced chat processing error:', error);
      
      // 에러 응답
      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: '죄송합니다. 잠시 문제가 발생했어요. 다시 시도해 주시겠어요? 🙏',
        timestamp: new Date()
      };
      
      res.json({
        success: false,
        data: errorMessage,
        error: {
          code: 'PROCESSING_ERROR',
          message: 'Failed to process message'
        }
      });
    }
  };

  getChatHistory = async (req: Request, res: Response) => {
    try {
      const { sessionId } = req.query;
      
      if (!sessionId || typeof sessionId !== 'string') {
        return res.status(400).json({
          success: false,
          error: { 
            code: 'MISSING_SESSION_ID',
            message: 'Session ID is required' 
          }
        });
      }
      
      const history = this.claudeService.getSessionHistory(sessionId);
      
      res.json({
        success: true,
        data: history,
        metadata: {
          sessionId,
          messageCount: history.length,
          conversationStart: history.length > 0 ? history[0].timestamp : null
        }
      });
      
    } catch (error) {
      logger.error('Get chat history error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'HISTORY_RETRIEVAL_ERROR',
          message: 'Failed to retrieve chat history'
        }
      });
    }
  };

  clearChatHistory = async (req: Request, res: Response) => {
    try {
      const { sessionId } = req.body;
      
      if (!sessionId) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_SESSION_ID',
            message: 'Session ID is required'
          }
        });
      }
      
      this.claudeService.clearSessionHistory(sessionId);
      
      res.json({
        success: true,
        message: 'Chat history cleared successfully',
        metadata: {
          sessionId,
          clearedAt: new Date().toISOString()
        }
      });
      
    } catch (error) {
      logger.error('Clear chat history error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'CLEAR_HISTORY_ERROR',
          message: 'Failed to clear chat history'
        }
      });
    }
  };

  // 대화 통계 조회
  getConversationStats = async (req: Request, res: Response) => {
    try {
      const { sessionId } = req.query;
      
      if (!sessionId || typeof sessionId !== 'string') {
        return res.status(400).json({
          success: false,
          error: { message: 'Session ID is required' }
        });
      }
      
      const history = this.claudeService.getSessionHistory(sessionId);
      const userMessages = history.filter(msg => msg.role === 'user');
      const assistantMessages = history.filter(msg => msg.role === 'assistant');
      
      const stats = {
        totalMessages: history.length,
        userMessages: userMessages.length,
        assistantMessages: assistantMessages.length,
        conversationStart: history.length > 0 ? history[0].timestamp : null,
        lastMessage: history.length > 0 ? history[history.length - 1].timestamp : null,
        avgMessageLength: history.length > 0 ? 
          Math.round(history.reduce((sum, msg) => sum + msg.content.length, 0) / history.length) : 0
      };
      
      res.json({
        success: true,
        data: stats
      });
      
    } catch (error) {
      logger.error('Get conversation stats error:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Failed to get conversation statistics' }
      });
    }
  };

  // 개발용: 현재 활성 세션 조회
  getActiveSessions = async (req: Request, res: Response) => {
    try {
      if (process.env.NODE_ENV === 'production') {
        return res.status(403).json({
          success: false,
          error: { message: 'This endpoint is not available in production' }
        });
      }
      
      // 실제로는 Redis나 다른 저장소에서 활성 세션을 가져와야 함
      res.json({
        success: true,
        data: {
          message: 'Active sessions endpoint - implement with session storage'
        }
      });
      
    } catch (error) {
      logger.error('Get active sessions error:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Failed to get active sessions' }
      });
    }
  };
}