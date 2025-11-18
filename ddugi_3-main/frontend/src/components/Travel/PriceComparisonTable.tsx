import React, { useState } from 'react';
import { TrendingUp, Star, ExternalLink, Filter, ArrowUpDown } from 'lucide-react';

interface PriceOption {
  id: string;
  provider: string;
  type: string;
  name: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviews: number;
  features: string[];
  badge?: string;
  link: string;
}

export const PriceComparisonTable: React.FC = () => {
  const [sortBy, setSortBy] = useState<'price' | 'rating'>('price');
  const [filterType, setFilterType] = useState<'all' | 'hotel' | 'flight' | 'restaurant'>('all');

  // Mock price comparison data
  const priceOptions: PriceOption[] = [
    {
      id: '1',
      provider: 'Booking.com',
      type: 'hotel',
      name: '도쿄 그랜드 호텔',
      price: 180000,
      originalPrice: 220000,
      rating: 4.5,
      reviews: 1240,
      features: ['무료 WiFi', '조식 포함', '24시간 프런트'],
      badge: '인기',
      link: 'https://booking.com'
    },
    {
      id: '2',
      provider: 'Agoda',
      type: 'hotel',
      name: '도쿄 그랜드 호텔',
      price: 165000,
      originalPrice: 200000,
      rating: 4.5,
      reviews: 1240,
      features: ['무료 WiFi', '조식 포함', '수영장'],
      badge: '최저가',
      link: 'https://agoda.com'
    },
    {
      id: '3',
      provider: '대한항공',
      type: 'flight',
      name: '인천 → 도쿄 (왕복)',
      price: 580000,
      rating: 4.2,
      reviews: 892,
      features: ['기내식', '수하물 23kg', '좌석 선택'],
      link: 'https://koreanair.com'
    },
    {
      id: '4',
      provider: 'OpenTable',
      type: 'restaurant',
      name: '스시 다이와 (디너 코스)',
      price: 85000,
      rating: 4.8,
      reviews: 456,
      features: ['미슐린 1스타', '오마카세', '예약 필수'],
      badge: '추천',
      link: 'https://opentable.com'
    }
  ];

  const filteredOptions = priceOptions
    .filter(option => filterType === 'all' || option.type === filterType)
    .sort((a, b) => {
      if (sortBy === 'price') return a.price - b.price;
      return b.rating - a.rating;
    });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'hotel': return '🏨';
      case 'flight': return '✈️';
      case 'restaurant': return '🍽️';
      default: return '📋';
    }
  };

  const getBadgeColor = (badge?: string) => {
    switch (badge) {
      case '최저가': return 'bg-green-100 text-green-800 border-green-200';
      case '인기': return 'bg-blue-100 text-blue-800 border-blue-200';
      case '추천': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-blue-600 text-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold mb-2">💰 가격 비교표</h3>
            <p className="text-green-100">최저가를 찾아 여행 예산을 절약하세요!</p>
          </div>
          <TrendingUp className="w-8 h-8 text-green-200" />
        </div>
      </div>

      {/* Filters and Sort */}
      <div className="p-4 bg-gray-50 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-3 sm:space-y-0">
          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-2">
            {(['all', 'hotel', 'flight', 'restaurant'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterType === type
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-600 hover:bg-blue-50 border border-gray-200'
                }`}
              >
                <Filter className="w-4 h-4 inline mr-1" />
                {type === 'all' ? '전체' : 
                 type === 'hotel' ? '호텔' :
                 type === 'flight' ? '항공' : '맛집'}
              </button>
            ))}
          </div>

          {/* Sort Options */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">정렬:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'price' | 'rating')}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="price">가격순</option>
              <option value="rating">평점순</option>
            </select>
            <ArrowUpDown className="w-4 h-4 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Price Comparison Table */}
      <div className="overflow-x-auto">
        <div className="min-w-full">
          {filteredOptions.map((option, index) => (
            <div 
              key={option.id}
              className={`p-4 border-b border-gray-100 hover:bg-blue-50 transition-colors ${
                index === 0 ? 'bg-green-50' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                {/* Left: Product Info */}
                <div className="flex items-start space-x-4 flex-1">
                  <div className="text-2xl">{getTypeIcon(option.type)}</div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-semibold text-gray-800">{option.name}</h4>
                      {option.badge && (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getBadgeColor(option.badge)}`}>
                          {option.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{option.provider}</p>
                    
                    {/* Features */}
                    <div className="flex flex-wrap gap-2 mb-2">
                      {option.features.map((feature, featureIndex) => (
                        <span 
                          key={featureIndex}
                          className="px-2 py-1 bg-gray-100 text-gray-600 rounded-md text-xs"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>

                    {/* Rating */}
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium text-gray-700">{option.rating}</span>
                      </div>
                      <span className="text-xs text-gray-500">({option.reviews.toLocaleString()}개 리뷰)</span>
                    </div>
                  </div>
                </div>

                {/* Right: Price and Action */}
                <div className="text-right">
                  <div className="mb-2">
                    {option.originalPrice && (
                      <p className="text-sm text-gray-400 line-through">
                        ₩{option.originalPrice.toLocaleString()}
                      </p>
                    )}
                    <p className="text-2xl font-bold text-gray-800">
                      ₩{option.price.toLocaleString()}
                    </p>
                    {option.originalPrice && (
                      <p className="text-sm text-green-600 font-medium">
                        {Math.round(((option.originalPrice - option.price) / option.originalPrice) * 100)}% 할인
                      </p>
                    )}
                  </div>
                  
                  <a
                    href={option.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
                  >
                    <span>예약하기</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 bg-gray-50 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <p>💡 가격은 실시간으로 변동될 수 있습니다</p>
          <p>총 {filteredOptions.length}개 옵션</p>
        </div>
      </div>
    </div>
  );
};