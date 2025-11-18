import React, { useState, useEffect, useRef } from 'react';
import { MessageBubble } from './MessageBubble';
import { InputBox } from './InputBox';
import { SuggestionChips } from './SuggestionChips';
import { LoadingBubble } from './LoadingBubble';
import { useChatStore } from '../../store/chatStore';
import { chatService } from '../../services/chatService';
import { ChatMessage } from '../../../../shared/types';
import { Sparkles, MessageCircle } from 'lucide-react';

export const ChatInterface: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { messages, addMessage, sessionId, clearMessages } = useChatStore();
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const handleSendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;
    
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date()
    };
    
    addMessage(userMessage);
    setIsLoading(true);
    setIsTyping(true);
    
    try {
      const response = await chatService.sendMessage({
        message: content,
        sessionId
      });
      
      // 타이핑 효과를 위한 지연
      setTimeout(() => {
        if (response.data) {
          addMessage(response.data);
        }
        setIsTyping(false);
      }, 800);
      
    } catch (error) {
      console.error('Failed to send message:', error);
      
      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: '죄송합니다. 일시적인 문제가 발생했어요. 다시 시도해 주세요. 🙏',
        timestamp: new Date()
      };
      
      addMessage(errorMessage);
      setIsTyping(false);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion);
  };
  
  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Travel AI
                </h1>
                <p className="text-sm text-gray-600 hidden sm:block">
                  똑똑한 여행 도우미
                </p>
              </div>
            </div>
            <button
              onClick={clearMessages}
              className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-all duration-200"
            >
              <MessageCircle className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
              <div className="mb-8 relative">
                <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mb-4 mx-auto shadow-lg">
                  <Sparkles className="w-12 h-12 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce">
                  ✨
                </div>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">
                어디로 여행 갈까요?
              </h2>
              <p className="text-gray-600 mb-12 max-w-md leading-relaxed">
                AI가 당신의 완벽한 여행을 계획해드립니다. 
                목적지부터 일정, 예산까지 모든 걸 맞춤 추천해요! ✈️
              </p>
              <SuggestionChips onSuggestionClick={handleSuggestionClick} />
            </div>
          ) : (
            <div className="py-6 space-y-6">
              {messages.map((message, index) => (
                <MessageBubble 
                  key={message.id} 
                  message={message} 
                  isFirst={index === 0}
                />
              ))}
              {isTyping && <LoadingBubble />}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>
      
      {/* Input Area */}
      <div className="bg-white/80 backdrop-blur-sm border-t border-gray-200/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <InputBox
            onSendMessage={handleSendMessage}
            disabled={isLoading}
            placeholder="여행 계획에 대해 무엇이든 물어보세요..."
          />
          {messages.length > 0 && !isLoading && (
            <div className="mt-4">
              <SuggestionChips 
                onSuggestionClick={handleSuggestionClick}
                variant="compact"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};