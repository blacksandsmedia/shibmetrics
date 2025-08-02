'use client';

import { useEffect, useState, useCallback } from 'react';

interface RealTimeUpdaterProps {
  onDataUpdate?: (data: {
    priceData: any;
    totalBurnedData: any;
    burnsData: any;
  }) => void;
  initialData: {
    priceData: any;
    totalBurnedData: any;
    burnsData: any;
  };
}

// Client-side component that handles real-time updates
export default function RealTimeUpdater({ onDataUpdate, initialData }: RealTimeUpdaterProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [pageWasHidden, setPageWasHidden] = useState(false);

  // Fetch fresh data with cache-busting
  const fetchFreshData = useCallback(async (forceFresh: boolean = false) => {
    const timestamp = Date.now();
    const priceCacheParam = forceFresh ? `?_t=${timestamp}` : '';
    const burnsCacheParam = forceFresh ? '?force=true' : '';
    
    try {
      const [priceResponse, totalBurnedResponse, burnsResponse] = await Promise.all([
        fetch(`/api/price${priceCacheParam}`, { cache: 'no-cache' }),
        fetch(`/api/total-burned`, { cache: forceFresh ? 'no-cache' : 'default' }),
        fetch(`/api/burns${burnsCacheParam}`, { cache: 'no-cache' })
      ]);
      
      const [priceData, totalBurnedData, burnsData] = await Promise.all([
        priceResponse.ok ? priceResponse.json() : null,
        totalBurnedResponse.ok ? totalBurnedResponse.json() : null,
        burnsResponse.ok ? burnsResponse.json() : null
      ]);
      
      // Validate data
      const isValid = priceData && totalBurnedData && burnsData &&
                     typeof priceData.price === 'number' && priceData.price > 0 &&
                     typeof totalBurnedData.totalBurned === 'number' && totalBurnedData.totalBurned > 0 &&
                     Array.isArray(burnsData.transactions);
      
      if (isValid && onDataUpdate) {
        console.log('✅ Real-time update: Data validated and updated');
        onDataUpdate({ priceData, totalBurnedData, burnsData });
        setLastUpdate(new Date());
        setIsLive(true);
      }
      
    } catch (error) {
      console.warn('⚠️ Real-time update failed:', error);
    }
  }, [onDataUpdate]);

  // Initial setup and polling
  useEffect(() => {
    console.log('🚀 RealTimeUpdater: Setting up real-time updates...');
    
    // Fetch fresh data after initial SSR load
    setTimeout(() => fetchFreshData(true), 1000);
    
    // Set up polling interval
    const pollInterval = setInterval(() => {
      if (!document.hidden) {
        fetchFreshData(false);
      }
    }, 45000); // 45 seconds
    
    return () => clearInterval(pollInterval);
  }, [fetchFreshData]);
  
  // Page visibility handling
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setPageWasHidden(true);
      } else if (pageWasHidden) {
        fetchFreshData(true); // Force fresh data when returning to tab
        setPageWasHidden(false);
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [fetchFreshData, pageWasHidden]);

  // This component doesn't render anything - it's just for side effects
  return (
    <>
      {/* Live Status Indicator - only show when updates are active */}
      {isLive && (
        <div className="ml-4 flex items-center gap-2 bg-green-900/20 border border-green-500/30 rounded-full px-3 py-1">
          <div className={`w-2 h-2 rounded-full ${isUpdating ? 'bg-orange-400 animate-pulse' : 'bg-green-400 animate-pulse'}`}></div>
          <span className={`text-xs font-medium ${isUpdating ? 'text-orange-400' : 'text-green-400'}`}>
            {isUpdating ? 'UPDATING...' : 'LIVE'}
          </span>
        </div>
      )}
      
      {/* Last updated timestamp */}
      {isLive && (
        <div className="text-xs text-gray-400 mt-2">
          Last updated: {lastUpdate.toLocaleTimeString()}
        </div>
      )}
    </>
  );
}