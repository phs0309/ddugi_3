import { create } from 'zustand';
import { ChatMessage } from '../../../shared/types';

interface ChatStore {
  messages: ChatMessage[];
  sessionId: string;
  isConnected: boolean;
  addMessage: (message: ChatMessage) => void;
  clearMessages: () => void;
  setSessionId: (id: string) => void;
  setConnected: (connected: boolean) => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  messages: [],
  sessionId: `session-${Date.now()}`,
  isConnected: false,
  
  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message]
    })),
  
  clearMessages: () =>
    set(() => ({
      messages: []
    })),
  
  setSessionId: (id) =>
    set(() => ({
      sessionId: id
    })),
  
  setConnected: (connected) =>
    set(() => ({
      isConnected: connected
    }))
}));