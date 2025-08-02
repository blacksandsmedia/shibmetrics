'use client';

import { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function RefreshButton() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const router = useRouter();

  const handleRefresh = async () => {
    setIsRefreshing(true);
    
    // Force a hard refresh of the page to get fresh server-side data
    router.refresh();
    
    // Add a small delay for visual feedback
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
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