import React from 'react';
import { MapPin, Calendar, DollarSign, Camera, Utensils, Star } from 'lucide-react';

interface SuggestionChipsProps {
  onSuggestionClick: (suggestion: string) => void;
  variant?: 'default' | 'compact';
}

const suggestions = [
  {
    icon: <MapPin className="w-4 h-4" />,
    label: '부산 2박 3일',
    query: '부산 2박 3일 여행 일정을 짜줘. 예산은 50만원 정도야.',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    icon: <Utensils className="w-4 h-4" />,
    label: '부산 맛집 추천',
    query: '부산 여행에서 꼭 가봐야 할 맛집들을 추천해줘. 특히 돼지국밥과 밀면 맛집을 알려줘.',
    color: 'from-purple-500 to-pink-500'
  },
  {
    icon: <DollarSign className="w-4 h-4" />,
    label: '부산 저예산 여행',
    query: '30만원 이하로 부산 1박 2일 여행을 계획해줘.',
    color: 'from-green-500 to-emerald-500'
  },
  {
    icon: <Camera className="w-4 h-4" />,
    label: '부산 인스타 스팟',
    query: '부산에서 사진 찍기 좋은 인스타그램 스팟들을 알려줘. 감천문화마을, 해동용궁사 같은 곳 말이야.',
    color: 'from-orange-500 to-red-500'
  },
  {
    icon: <Calendar className="w-4 h-4" />,
    label: '부산 겨울 여행',
    query: '12월 부산 여행에서 할 수 있는 것들과 볼거리를 추천해줘.',
    color: 'from-indigo-500 to-blue-500'
  },
  {
    icon: <Star className="w-4 h-4" />,
    label: '부산 커플 여행',
    query: '부산에서 연인과 함께 가기 좋은 로맨틱한 장소들을 추천해줘.',
    color: 'from-pink-500 to-rose-500'
  }
];

export const SuggestionChips: React.FC<SuggestionChipsProps> = ({ 
  onSuggestionClick, 
  variant = 'default' 
}) => {
  const displaySuggestions = variant === 'compact' ? suggestions.slice(0, 3) : suggestions;

  if (variant === 'compact') {
    return (
      <div className="flex flex-wrap gap-2 justify-center">
        {displaySuggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => onSuggestionClick(suggestion.query)}
            className="inline-flex items-center space-x-2 px-3 py-2 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-full text-sm text-gray-700 hover:text-gray-900 hover:bg-white hover:shadow-md transition-all duration-200 transform hover:scale-105"
          >
            <div className={`p-1 bg-gradient-to-r ${suggestion.color} rounded-full text-white`}>
              {suggestion.icon}
            </div>
            <span className="font-medium">{suggestion.label}</span>
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {displaySuggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => onSuggestionClick(suggestion.query)}
            className="group relative overflow-hidden bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl p-4 text-left hover:bg-white hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
          >
            <div className="flex items-center space-x-3">
              <div className={`p-3 bg-gradient-to-r ${suggestion.color} rounded-xl text-white shadow-lg group-hover:shadow-xl transition-shadow duration-300`}>
                {suggestion.icon}
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 group-hover:text-gray-900">
                  {suggestion.label}
                </h3>
                <p className="text-sm text-gray-600 group-hover:text-gray-700">
                  클릭해서 물어보세요
                </p>
              </div>
            </div>
            
            {/* Gradient overlay on hover */}
            <div className={`absolute inset-0 bg-gradient-to-r ${suggestion.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-2xl`} />
          </button>
        ))}
      </div>
      
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-500">
          또는 직접 질문을 입력해보세요! 💬
        </p>
      </div>
    </div>
  );
};