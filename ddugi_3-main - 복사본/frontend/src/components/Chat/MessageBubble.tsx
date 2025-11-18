import React from 'react';
import ReactMarkdown from 'react-markdown';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { ChatMessage } from '../../../../shared/types';
import { User, Sparkles } from 'lucide-react';
import { TravelItineraryCard } from '../Travel/TravelItineraryCard';
import { TravelRecommendationCard } from '../Travel/TravelRecommendationCard';

interface MessageBubbleProps {
  message: ChatMessage;
  isFirst?: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';
  
  // JSON 데이터 파싱 시도
  let structuredData = null;
  let isStructuredResponse = false;
  
  if (!isUser) {
    try {
      structuredData = JSON.parse(message.content);
      isStructuredResponse = true;
    } catch {
      // JSON이 아닌 일반 텍스트로 처리
      isStructuredResponse = false;
    }
  }
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-fade-in`}>
      <div className={`flex items-start space-x-3 w-full ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-lg ${
          isUser 
            ? 'bg-gradient-to-r from-indigo-500 to-purple-600' 
            : 'bg-gradient-to-r from-blue-500 to-purple-600'
        }`}>
          {isUser ? (
            <User className="w-4 h-4 text-white" />
          ) : (
            <Sparkles className="w-4 h-4 text-white" />
          )}
        </div>
        
        {/* Message Content */}
        <div className={`flex-1 ${isUser ? 'text-right' : 'text-left'}`}>
          {isUser ? (
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-3xl rounded-br-lg px-6 py-4 shadow-lg inline-block max-w-lg">
              <p className="mb-0 text-white">{message.content}</p>
            </div>
          ) : isStructuredResponse && structuredData ? (
            // 구조화된 데이터 렌더링
            <div className="w-full">
              {structuredData.type === 'itinerary' ? (
                <TravelItineraryCard data={structuredData} />
              ) : structuredData.type === 'general' ? (
                <TravelRecommendationCard data={structuredData} />
              ) : (
                // 알 수 없는 구조일 경우 일반 텍스트로 표시
                <div className="bg-white/90 backdrop-blur-sm text-gray-800 rounded-3xl rounded-tl-lg border border-gray-200/50 px-6 py-4 shadow-lg inline-block max-w-4xl">
                  <p className="text-gray-700">{message.content}</p>
                </div>
              )}
            </div>
          ) : (
            // 일반 텍스트 메시지
            <div className="bg-white/90 backdrop-blur-sm text-gray-800 rounded-3xl rounded-tl-lg border border-gray-200/50 px-6 py-4 shadow-lg inline-block max-w-4xl">
              <div className="prose prose-sm max-w-none">
                <ReactMarkdown
                  components={{
                    p: ({ children }) => (
                      <p className="mb-3 last:mb-0 leading-relaxed text-gray-700">
                        {children}
                      </p>
                    ),
                    ul: ({ children }) => (
                      <ul className="list-none space-y-2 mb-4">
                        {children}
                      </ul>
                    ),
                    li: ({ children }) => (
                      <li className="flex items-start space-x-2">
                        <span className="text-blue-500 mt-1">•</span>
                        <span className="text-gray-700">{children}</span>
                      </li>
                    ),
                    strong: ({ children }) => (
                      <strong className="font-semibold text-gray-900">{children}</strong>
                    )
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              </div>
            </div>
          )}
          
          {/* Timestamp */}
          <div className={`mt-2 text-xs text-gray-500 ${isUser ? 'text-right' : 'text-left'}`}>
            {format(new Date(message.timestamp), 'HH:mm', { locale: ko })}
          </div>
        </div>
      </div>
    </div>
  );
};