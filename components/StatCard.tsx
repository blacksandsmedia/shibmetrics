import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: LucideIcon;
  loading?: boolean;
  isSupplyCard?: boolean; // Flag for supply cards that need responsive text
  hasChanged?: boolean; // Flag to trigger animation when value changes
  animationType?: 'flash' | 'pulse' | 'glow'; // Type of animation to apply
}

export default function StatCard({ 
  title, 
  value, 
  change, 
  changeType = 'neutral', 
  icon: Icon,
  loading = false,
  isSupplyCard = false,
  hasChanged = false,
  animationType = 'flash'
}: StatCardProps) {
  const changeColor = {
    positive: 'text-green-400',
    negative: 'text-red-400',
    neutral: 'text-gray-400'
  }[changeType];

  // Animation classes based on type and state
  const getAnimationClasses = () => {
    if (!hasChanged) return '';
    
    switch (animationType) {
      case 'flash':
        return 'animate-pulse bg-orange-500/20 border-orange-400 shadow-lg shadow-orange-500/20';
      case 'pulse':
        return 'animate-pulse scale-105 border-blue-400 shadow-lg shadow-blue-500/20';
      case 'glow':
        return 'border-green-400 shadow-lg shadow-green-500/30 bg-green-500/10';
      default:
        return 'animate-pulse bg-orange-500/20 border-orange-400 shadow-lg shadow-orange-500/20';
    }
  };

  return (
    <div className={`bg-gray-800 rounded-lg p-6 border border-gray-700 transition-all duration-700 ease-in-out ${getAnimationClasses()}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-400">{title}</p>
          {loading ? (
            <div className="mt-2 h-8 bg-gray-700 rounded animate-pulse"></div>
          ) : (
            <p className={`mt-2 font-semibold text-white transition-all duration-500 ease-in-out ${
              isSupplyCard 
                ? 'text-xl sm:text-2xl lg:text-3xl break-all' // Responsive font for supply cards
                : 'text-3xl' // Regular font for other cards
            } ${hasChanged ? 'scale-105 text-orange-300' : ''}`}>
              {value}
            </p>
          )}
          {change && !loading && (
            <p className={`mt-1 text-sm ${changeColor}`}>
              {change}
            </p>
          )}
        </div>
        <div className="flex-shrink-0">
          <Icon className="h-8 w-8 text-orange-500" />
        </div>
      </div>
    </div>
  );
} 