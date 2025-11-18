import React from 'react';
import { MapPin, Clock, DollarSign, Camera, Navigation } from 'lucide-react';

interface Location {
  name: string;
  type: 'attraction' | 'restaurant' | 'accommodation';
  address: string;
  description: string;
  duration: string;
  cost: number;
  tips: string;
  coordinates: { lat: number; lng: number };
  image?: string;
}

interface DayPlan {
  day: number;
  date: string;
  theme: string;
  locations: Location[];
}

interface TravelItinerary {
  type: 'itinerary';
  title: string;
  summary: string;
  totalBudget: number;
  duration: string;
  days: DayPlan[];
  transportation: string;
  tips: string[];
  budget: {
    accommodation: number;
    food: number;
    activities: number;
    transportation: number;
    miscellaneous: number;
  };
}

interface TravelItineraryCardProps {
  data: TravelItinerary;
}

export const TravelItineraryCard: React.FC<TravelItineraryCardProps> = ({ data }) => {
  const getLocationTypeIcon = (type: string) => {
    switch (type) {
      case 'attraction': return <Camera className="w-4 h-4" />;
      case 'restaurant': return <MapPin className="w-4 h-4" />;
      case 'accommodation': return <Navigation className="w-4 h-4" />;
      default: return <MapPin className="w-4 h-4" />;
    }
  };

  const getLocationTypeColor = (type: string) => {
    switch (type) {
      case 'attraction': return 'bg-blue-100 text-blue-800';
      case 'restaurant': return 'bg-orange-100 text-orange-800';
      case 'accommodation': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200 mb-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-6">
        <h2 className="text-2xl font-bold mb-2">{data.title}</h2>
        <p className="text-blue-100 mb-3">{data.summary}</p>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{data.duration}</span>
          </div>
          <div className="flex items-center gap-1">
            <DollarSign className="w-4 h-4" />
            <span>{data.totalBudget.toLocaleString()}원</span>
          </div>
        </div>
      </div>

      {/* Budget Overview */}
      <div className="p-6 bg-gray-50 border-b">
        <h3 className="font-semibold mb-3 text-gray-800">예산 분석</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="text-center">
            <div className="text-lg font-bold text-green-600">{data.budget.accommodation.toLocaleString()}</div>
            <div className="text-xs text-gray-600">숙박</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-orange-600">{data.budget.food.toLocaleString()}</div>
            <div className="text-xs text-gray-600">식비</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-blue-600">{data.budget.activities.toLocaleString()}</div>
            <div className="text-xs text-gray-600">관광</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-purple-600">{data.budget.transportation.toLocaleString()}</div>
            <div className="text-xs text-gray-600">교통</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-gray-600">{data.budget.miscellaneous.toLocaleString()}</div>
            <div className="text-xs text-gray-600">기타</div>
          </div>
        </div>
      </div>

      {/* Days */}
      <div className="p-6">
        {data.days.map((day, dayIndex) => (
          <div key={dayIndex} className="mb-8 last:mb-0">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                {day.day}
              </div>
              <div>
                <h4 className="font-bold text-gray-800">{day.date}</h4>
                <p className="text-sm text-blue-600">{day.theme}</p>
              </div>
            </div>

            <div className="ml-5 space-y-4">
              {day.locations.map((location, locationIndex) => (
                <div key={locationIndex} className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                  <div className="flex gap-4">
                    {/* Location Image */}
                    {location.image && (
                      <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        <img 
                          src={location.image} 
                          alt={location.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/images/busan-default.jpg';
                          }}
                        />
                      </div>
                    )}

                    {/* Location Details */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h5 className="font-semibold text-gray-800">{location.name}</h5>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getLocationTypeColor(location.type)}`}>
                          {getLocationTypeIcon(location.type)}
                          {location.type === 'attraction' ? '관광지' : 
                           location.type === 'restaurant' ? '맛집' : '숙박'}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-2">{location.description}</p>
                      
                      <div className="flex items-center gap-4 text-xs text-gray-500 mb-2">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          <span>{location.address}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{location.duration}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-3 h-3" />
                          <span>{location.cost.toLocaleString()}원</span>
                        </div>
                      </div>
                      
                      {location.tips && (
                        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-2 text-xs text-yellow-800">
                          💡 {location.tips}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Transportation & Tips */}
      <div className="p-6 bg-gray-50">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">🚌 교통 정보</h4>
            <p className="text-sm text-gray-600">{data.transportation}</p>
          </div>
          
          {data.tips.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">💡 여행 팁</h4>
              <ul className="space-y-1">
                {data.tips.map((tip, index) => (
                  <li key={index} className="text-sm text-gray-600">• {tip}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};