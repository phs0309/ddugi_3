import api from './api';
import { ChatMessage, ApiResponse } from '../../../shared/types';

export interface SendMessageRequest {
  message: string;
  sessionId: string;
  context?: any;
}

export interface SendMessageResponse {
  data: ChatMessage;
  metadata?: {
    intent: string;
    sessionId: string;
  };
}

class ChatService {
  async sendMessage(request: SendMessageRequest): Promise<ApiResponse<any>> {
    try {
      // 새로운 간단한 chat API 사용
      const response = await api.post<ApiResponse<any>>('/chat', {
        message: request.message
      });
      return response.data;
    } catch (error: any) {
      console.error('Chat service error:', error);
      
      if (error.response) {
        // Server responded with error status
        const message = error.response.data?.error?.message || error.response.statusText || 'Server error';
        throw new Error(`Failed to send message: ${message}`);
      } else if (error.request) {
        // Request was made but no response received
        throw new Error('Failed to send message: No response from server');
      } else {
        // Something else happened
        throw new Error(`Failed to send message: ${error.message || 'Unknown error'}`);
      }
    }
  }

  async getChatHistory(sessionId: string): Promise<ApiResponse<ChatMessage[]>> {
    try {
      const response = await api.get<ApiResponse<ChatMessage[]>>(`/chat/history`, {
        params: { sessionId }
      });
      return response.data;
    } catch (error) {
      throw new Error('Failed to get chat history');
    }
  }

  async deleteChatMessage(messageId: string, sessionId: string): Promise<void> {
    try {
      await api.delete(`/chat/history/${messageId}`, {
        params: { sessionId }
      });
    } catch (error) {
      throw new Error('Failed to delete message');
    }
  }
}

export const chatService = new ChatService();
export default chatService;