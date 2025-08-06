'use client';

import { useEffect, useState, useCallback, useRef } from 'react';

interface ShibPriceData {
  price: number;
  priceChange24h: number;
  marketCap: number;
  circulatingSupply: number;
  totalSupply: number;
  volume24h: number;
  source: string;
  cached: boolean;
}

interface TotalBurnedData {
  totalBurned: number;
  source: string;
  cached: boolean;
}

interface BurnsData {
  transactions: Array<{
    hash: string;
    from: string;
    to: string;
    value: string;
    timeStamp: string;
    blockNumber: string;
  }>;
  source: string;
  cached: boolean;
}

interface RealTimeUpdaterProps {
  onDataUpdate?: (data: {
    priceData: ShibPriceData;
    totalBurnedData: TotalBurnedData;
    burnsData: BurnsData;
  }) => void;
  initialData?: {
    priceData: ShibPriceData;
    totalBurnedData: TotalBurnedData;
    burnsData: BurnsData;
  };
}

// Client-side component that handles real-time updates
export default function RealTimeUpdater({ onDataUpdate }: RealTimeUpdaterProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [pageWasHidden, setPageWasHidden] = useState(false);



  // Fetch data from server cache (refreshed every 2 minutes by scheduled function)
  const fetchFreshData = useCallback(async (forceFresh: boolean = false) => {
    console.log('🔄 Fetching data from server cache (updated every 2 minutes by scheduled function)');
    
    try {
      const [priceResponse, totalBurnedResponse, burnsResponse] = await Promise.all([
        fetch('/api/price'),
        fetch('/api/total-burned'), 
        fetch('/api/burns')
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
        // Always update timestamp on successful check
        setLastUpdate(new Date());
        
        // SIMPLIFIED: Always update with fresh data - no complex comparison needed
        console.log('✅ Real-time update: Fresh data received', {
          price: priceData.price,
          marketCap: priceData.marketCap,
          volume: priceData.volume24h,
          totalBurned: totalBurnedData.totalBurned,
          transactions: burnsData.transactions.length
        });
        
        onDataUpdate({ priceData, totalBurnedData, burnsData });
        setIsLive(true);
      }
      
    } catch (error) {
      console.warn('⚠️ Real-time update failed:', error);
    }
  }, [onDataUpdate]); // Simplified dependencies

  // Initial setup and polling
  useEffect(() => {
    console.log('🚀 RealTimeUpdater: Setting up real-time updates...');
    
    // Fetch fresh data after initial SSR load
    setTimeout(() => fetchFreshData(true), 1000);
    
    // Set up polling interval - server data refreshes every 1min via scheduled function
    // Client polls every 30s to display latest server data to users
    const pollInterval = setInterval(() => {
      fetchFreshData(false); // Always fetch - server data stays current via scheduled refresh
    }, 30000); // 30 seconds - displays latest data from server cache
    
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
      

    </>
  );
}