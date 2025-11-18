import React from 'react';
import { MapPin, Calendar, DollarSign, Compass } from 'lucide-react';

interface QuickActionsProps {
  onAction: (action: string) => void;
}

const quickActions = [
  {
    icon: <MapPin size={20} />,
    label: '부산 명소',
    action: '부산에서 꼭 가봐야 할 유명한 관광지들을 추천해줘'
  },
  {
    icon: <Calendar size={20} />,
    label: '부산 일정 짜기',
    action: '부산 1박 2일 여행 일정을 짜줘, 예산은 40만원 정도야'
  },
  {
    icon: <DollarSign size={20} />,
    label: '저예산 부산여행',
    action: '부산에서 저렴하게 즐길 수 있는 관광지와 맛집들을 알려줘'
  },
  {
    icon: <Compass size={20} />,
    label: '부산 액티비티',
    action: '부산에서 할 수 있는 재미있는 액티비티와 체험을 추천해줘'
  }
];

export const QuickActions: React.FC<QuickActionsProps> = ({ onAction }) => {
  return (
    <div className="grid grid-cols-2 gap-3 max-w-2xl mx-auto">
      {quickActions.map((item, index) => (
        <button
          key={index}
          onClick={() => onAction(item.action)}
          className="flex items-center space-x-3 px-4 py-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-primary-300 transition text-left group"
        >
          <div className="text-gray-500 group-hover:text-primary-500 transition">
            {item.icon}
          </div>
          <div>
            <p className="font-medium text-gray-800">{item.label}</p>
            <p className="text-xs text-gray-500">클릭해서 물어보기</p>
          </div>
        </button>
      ))}
    </div>
  );
};