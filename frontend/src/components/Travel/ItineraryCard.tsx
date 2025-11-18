import React from 'react';
import { Calendar, Clock, MapPin, DollarSign, Users } from 'lucide-react';

export const ItineraryCard: React.FC = () => {
  // Mock itinerary data
  const itinerary = {
    destination: '도쿄',
    duration: '3일 2박',
    budget: '1,500,000원',
    travelers: 2,
    days: [
      {
        day: 1,
        date: '12월 15일 (금)',
        activities: [
          {
            time: '09:00',
            title: '센소지 절',
            description: '아사쿠사의 유명한 불교 사원',
            duration: '2시간',
            cost: '무료'
          },
          {
            time: '12:00',
            title: '아사쿠사 맛집 투어',
            description: '전통 일본 요리 체험',
            duration: '1.5시간',
            cost: '25,000원'
          },
          {
            time: '15:00',
            title: '도쿄 스카이트리',
            description: '634m 높이의 전망대',
            duration: '2시간',
            cost: '35,000원'
          }
        ]
      },
      {
        day: 2,
        date: '12월 16일 (토)',
        activities: [
          {
            time: '10:00',
            title: '메이지 신궁',
            description: '도쿄의 대표적인 신사',
            duration: '1.5시간',
            cost: '무료'
          },
          {
            time: '13:00',
            title: '하라주쿠 & 오모테산도',
            description: '쇼핑과 카페 투어',
            duration: '4시간',
            cost: '100,000원'
          },
          {
            time: '19:00',
            title: '신주쿠 야경',
            description: '도쿄 야경 감상',
            duration: '2시간',
            cost: '20,000원'
          }
        ]
      }
    ]
  };

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold mb-2">{itinerary.destination} 여행 일정</h3>
            <div className="flex items-center space-x-4 text-blue-100">
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">{itinerary.duration}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Users className="w-4 h-4" />
                <span className="text-sm">{itinerary.travelers}명</span>
              </div>
              <div className="flex items-center space-x-1">
                <DollarSign className="w-4 h-4" />
                <span className="text-sm">{itinerary.budget}</span>
              </div>
            </div>
          </div>
          <div className="hidden sm:block">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <MapPin className="w-8 h-8" />
            </div>
          </div>
        </div>
      </div>

      {/* Itinerary Days */}
      <div className="p-6 space-y-6">
        {itinerary.days.map((day, dayIndex) => (
          <div key={dayIndex} className="space-y-4">
            {/* Day Header */}
            <div className="flex items-center space-x-3 pb-2 border-b border-gray-200">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                {day.day}
              </div>
              <div>
                <h4 className="font-semibold text-gray-800">DAY {day.day}</h4>
                <p className="text-sm text-gray-600">{day.date}</p>
              </div>
            </div>

            {/* Activities */}
            <div className="space-y-3">
              {day.activities.map((activity, activityIndex) => (
                <div 
                  key={activityIndex} 
                  className="group relative bg-gray-50 rounded-xl p-4 hover:bg-blue-50 transition-colors duration-200"
                >
                  <div className="flex items-start space-x-4">
                    {/* Time */}
                    <div className="flex-shrink-0">
                      <div className="bg-white rounded-lg px-3 py-2 shadow-sm border">
                        <Clock className="w-4 h-4 text-blue-500 mx-auto mb-1" />
                        <p className="text-xs font-semibold text-gray-700">{activity.time}</p>
                      </div>
                    </div>

                    {/* Activity Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <h5 className="font-semibold text-gray-800 group-hover:text-blue-700 transition-colors">
                            {activity.title}
                          </h5>
                          <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                          <div className="flex items-center space-x-3 mt-2">
                            <span className="inline-flex items-center space-x-1 text-xs text-gray-500">
                              <Clock className="w-3 h-3" />
                              <span>{activity.duration}</span>
                            </span>
                            <span className="inline-flex items-center space-x-1 text-xs text-green-600 font-medium">
                              <DollarSign className="w-3 h-3" />
                              <span>{activity.cost}</span>
                            </span>
                          </div>
                        </div>

                        {/* Activity Number */}
                        <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">
                          {activityIndex + 1}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Connection Line (except for last item) */}
                  {activityIndex < day.activities.length - 1 && (
                    <div className="absolute left-8 top-16 w-px h-6 bg-gradient-to-b from-blue-200 to-transparent" />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Footer Actions */}
      <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            ✨ AI가 추천하는 맞춤 일정입니다
          </p>
          <div className="flex space-x-2">
            <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors">
              수정
            </button>
            <button className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg text-sm hover:shadow-lg transition-shadow">
              저장
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};