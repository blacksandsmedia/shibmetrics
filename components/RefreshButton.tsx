'use client';

import { useState } from 'react';
import { RefreshCw } from 'lucide-react';

interface RefreshButtonProps {
  onRefresh?: () => Promise<void>;
}

export default function RefreshButton({ onRefresh }: RefreshButtonProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    
    try {
      if (onRefresh) {
        // Use custom refresh function if provided
        await onRefresh();
      } else {
        // Fallback to page reload with cache busting
        const currentUrl = new URL(window.location.href);
        currentUrl.searchParams.set('_refresh', Date.now().toString());
        window.location.href = currentUrl.toString();
      }
    } catch (error) {
      console.error('Refresh failed:', error);
    } finally {
      // Add a small delay for visual feedback
      setTimeout(() => {
        setIsRefreshing(false);
      }, 1000);
    }
  };

  return (
    <button
      onClick={handleRefresh}
      disabled={isRefreshing}
      className="ml-4 p-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
      title="Refresh data"
    >
      <RefreshCw className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
    </button>
  );
} 