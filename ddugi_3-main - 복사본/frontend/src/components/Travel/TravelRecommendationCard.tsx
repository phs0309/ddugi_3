import React from 'react';
import { MapPin, Camera, Utensils, Star } from 'lucide-react';

interface Recommendation {
  name: string;
  type: 'attraction' | 'restaurant' | 'activity';
  description: string;
  location: string;
  price: string;
  image?: string;
}

interface TravelRecommendation {
  type: 'general';
  answer: string;
  recommendations: Recommendation[];
}

interface TravelRecommendationCardProps {
  data: TravelRecommendation;
}

export const TravelRecommendationCard: React.FC<TravelRecommendationCardProps> = ({ data }) => {
  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'attraction': return <Camera className="w-5 h-5" />;
      case 'restaurant': return <Utensils className="w-5 h-5" />;
      case 'activity': return <Star className="w-5 h-5" />;
      default: return <MapPin className="w-5 h-5" />;
    }
  };

  const getRecommendationColor = (type: string) => {
    switch (type) {
      case 'attraction': return 'from-blue-500 to-cyan-500';
      case 'restaurant': return 'from-orange-500 to-red-500';
      case 'activity': return 'from-purple-500 to-pink-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getRecommendationTypeText = (type: string) => {
    switch (type) {
      case 'attraction': return '관광지';
      case 'restaurant': return '맛집';
      case 'activity': return '액티비티';
      default: return '추천';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200 mb-6">
      {/* Answer Section */}
      <div className="p-6 border-b bg-gradient-to-r from-blue-50 to-cyan-50">
        <div className="prose prose-sm max-w-none">
          <div className="text-gray-800 whitespace-pre-wrap">{data.answer}</div>
        </div>
      </div>

      {/* Recommendations Section */}
      {data.recommendations && data.recommendations.length > 0 && (
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            추천 장소
          </h3>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {data.recommendations.map((rec, index) => (
              <div key={index} className="group bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                {/* Image */}
                {rec.image && (
                  <div className="h-48 bg-gray-100 overflow-hidden">
                    <img 
                      src={rec.image} 
                      alt={rec.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/images/busan-default.jpg';
                      }}
                    />
                  </div>
                )}

                <div className="p-4">
                  {/* Type Badge */}
                  <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-white text-xs font-medium mb-3 bg-gradient-to-r ${getRecommendationColor(rec.type)}`}>
                    {getRecommendationIcon(rec.type)}
                    {getRecommendationTypeText(rec.type)}
                  </div>

                  {/* Name */}
                  <h4 className="font-semibold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">
                    {rec.name}
                  </h4>

                  {/* Description */}
                  <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                    {rec.description}
                  </p>

                  {/* Location & Price */}
                  <div className="space-y-2 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      <span>{rec.location}</span>
                    </div>
                    {rec.price && (
                      <div className="flex items-center gap-1">
                        <span className="font-medium text-green-600">{rec.price}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};