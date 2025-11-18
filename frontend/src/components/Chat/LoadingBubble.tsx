import React from 'react';
import { Sparkles, Search } from 'lucide-react';

export const LoadingBubble: React.FC = () => {
  return (
    <div className="flex justify-start animate-fade-in">
      <div className="flex items-start space-x-3 max-w-2xl">
        {/* AI Avatar */}
        <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        
        {/* Loading Content */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl rounded-tl-lg px-6 py-4 shadow-lg border border-gray-200/50">
          <div className="flex items-center space-x-3">
            {/* Animated Search Icon */}
            <div className="p-2 bg-blue-100 rounded-full">
              <Search className="w-4 h-4 text-blue-600 animate-pulse" />
            </div>
            
            {/* Loading Text */}
            <div className="flex flex-col">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-sm font-medium text-gray-700">여행 정보를 찾는 중</span>
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="w-40 h-1 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-loading-bar" />
              </div>
            </div>
          </div>
          
          {/* Loading Steps */}
          <div className="mt-4 space-y-2">
            <div className="flex items-center space-x-2 text-xs text-gray-600">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span>최신 정보 검색 중...</span>
            </div>
            <div className="flex items-center space-x-2 text-xs text-gray-600">
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
              <span>맞춤 추천 생성 중...</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};