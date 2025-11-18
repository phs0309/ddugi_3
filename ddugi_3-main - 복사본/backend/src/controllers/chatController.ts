import { Request, Response, NextFunction } from 'express';
import { ClaudeService } from '../services/claude/claudeService';
import { IntentAnalyzer } from '../services/claude/intentAnalyzer';
import { SearchService } from '../services/search/searchService';
import { logger } from '../utils/logger';
import { ChatMessage } from '../../../shared/types';

export class ChatController {
  private claudeService: ClaudeService;
  private intentAnalyzer: IntentAnalyzer;
  private searchService: SearchService;
  private chatHistory: Map<string, ChatMessage[]> = new Map();

  constructor() {
    this.claudeService = new ClaudeService();
    this.intentAnalyzer = new IntentAnalyzer();
    this.searchService = new SearchService();
  }

  handleChat = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { message, sessionId, context } = req.body;
      
      logger.info(`Processing chat message for session: ${sessionId}`);
      
      const intent = await this.intentAnalyzer.analyzeIntent(message);
      logger.info(`Detected intent: ${intent.type}`);
      
      let enrichedContext = context || {};
      
      if (intent.requiresSearch) {
        const searchResults = await this.searchService.search(intent.searchQuery || message);
        enrichedContext.searchResults = searchResults;
      }
      
      const response = await this.claudeService.generateResponse({
        message,
        intent,
        context: enrichedContext
      });
      
      const chatMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
        metadata: {
          suggestions: intent.suggestions
        }
      };
      
      this.addToHistory(sessionId, {
        id: Date.now().toString(),
        role: 'user',
        content: message,
        timestamp: new Date()
      });
      this.addToHistory(sessionId, chatMessage);
      
      res.json({
        success: true,
        data: chatMessage,
        metadata: {
          intent: intent.type,
          sessionId
        }
      });
    } catch (error) {
      logger.error('Chat processing error:', error);
      next(error);
    }
  };

  getChatHistory = async (req: Request, res: Response) => {
    const { sessionId } = req.query;
    
    if (!sessionId || typeof sessionId !== 'string') {
      return res.status(400).json({
        success: false,
        error: { message: 'Session ID is required' }
      });
    }
    
    const history = this.chatHistory.get(sessionId) || [];
    
    res.json({
      success: true,
      data: history
    });
  };

  deleteChatMessage = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { sessionId } = req.query;
    
    if (!sessionId || typeof sessionId !== 'string') {
      return res.status(400).json({
        success: false,
        error: { message: 'Session ID is required' }
      });
    }
    
    const history = this.chatHistory.get(sessionId) || [];
    const filteredHistory = history.filter(msg => msg.id !== id);
    this.chatHistory.set(sessionId, filteredHistory);
    
    res.json({
      success: true,
      message: 'Message deleted successfully'
    });
  };

  private addToHistory(sessionId: string, message: ChatMessage) {
    const history = this.chatHistory.get(sessionId) || [];
    history.push(message);
    
    if (history.length > 100) {
      history.shift();
    }
    
    this.chatHistory.set(sessionId, history);
  }
}