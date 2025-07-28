import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: LucideIcon;
  loading?: boolean;
}

export default function StatCard({ 
  title, 
  value, 
  change, 
  changeType = 'neutral', 
  icon: Icon,
  loading = false 
}: StatCardProps) {
  const changeColor = {
    positive: 'text-green-400',
    negative: 'text-red-400',
    neutral: 'text-gray-400'
  }[changeType];

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-400">{title}</p>
          {loading ? (
            <div className="mt-2 h-8 bg-gray-700 rounded animate-pulse"></div>
          ) : (
            <p className="mt-2 text-3xl font-semibold text-white">{value}</p>
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