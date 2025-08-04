'use client';

import { useEffect, useState, useCallback } from 'react';

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
  const [lastDataRef, setLastDataRef] = useState<{price?: number, totalBurned?: number, latestTxHash?: string}>({});
  const [isFirstUpdate, setIsFirstUpdate] = useState(true);

  // Smart comparison to detect actual data changes
  const checkForDataChanges = useCallback((priceData: ShibPriceData, totalBurnedData: TotalBurnedData, burnsData: BurnsData) => {
    const latestTxHash = burnsData.transactions.length > 0 ? burnsData.transactions[0].hash : '';
    
    // Check if any critical data changed
    const priceChanged = Math.abs(priceData.price - (lastDataRef.price || 0)) > 0.00000001; // Meaningful price change
    const totalBurnedChanged = totalBurnedData.totalBurned !== lastDataRef.totalBurned;
    const newTransactions = latestTxHash !== lastDataRef.latestTxHash;
    
    const hasChanges = priceChanged || totalBurnedChanged || newTransactions;
    
    if (hasChanges) {
      console.log('🔄 Data changes detected:', {
        priceChanged: priceChanged ? `${lastDataRef.price} → ${priceData.price}` : false,
        totalBurnedChanged: totalBurnedChanged ? `${lastDataRef.totalBurned} → ${totalBurnedData.totalBurned}` : false,
        newTransactions: newTransactions ? `New tx: ${latestTxHash.slice(0,10)}...` : false
      });
      
      // Update reference data
      setLastDataRef({
        price: priceData.price,
        totalBurned: totalBurnedData.totalBurned,
        latestTxHash: latestTxHash
      });
    }
    
    return hasChanges;
  }, [lastDataRef]);

  // Fetch fresh data with periodic cache-busting to ensure accuracy
  const fetchFreshData = useCallback(async (forceFresh: boolean = false) => {
    const timestamp = Date.now();
    // Force fresh data every 2 minutes to prevent stale data
    const lastForcedUpdate = localStorage.getItem('lastForcedUpdate');
    const shouldForceFresh = forceFresh || !lastForcedUpdate || (timestamp - parseInt(lastForcedUpdate)) > 120000;
    
    if (shouldForceFresh && !forceFresh) {
      localStorage.setItem('lastForcedUpdate', timestamp.toString());
      console.log('🔄 Forcing fresh data to prevent stale cache');
    }
    
    const priceCacheParam = shouldForceFresh ? `?_t=${timestamp}` : '';
    const burnsCacheParam = shouldForceFresh ? '?force=true' : '';
    
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
        // Always update timestamp on successful check
        setLastUpdate(new Date());
        
        // Always update on first run, then use smart comparison
        if (isFirstUpdate) {
          console.log('🚀 Real-time update: First update - forcing homepage sync');
          onDataUpdate({ priceData, totalBurnedData, burnsData });
          setIsFirstUpdate(false);
          
          // Initialize reference data
          const latestTxHash = burnsData.transactions.length > 0 ? burnsData.transactions[0].hash : '';
          setLastDataRef({
            price: priceData.price,
            totalBurned: totalBurnedData.totalBurned,
            latestTxHash: latestTxHash
          });
        } else {
          // Smart update: Only update if data actually changed
          const hasNewData = checkForDataChanges(priceData, totalBurnedData, burnsData);
          
          if (hasNewData) {
            console.log('✅ Real-time update: New data detected and updated');
            onDataUpdate({ priceData, totalBurnedData, burnsData });
          } else {
            console.log('📊 Real-time check: No new data, keeping existing display');
          }
        }
        setIsLive(true);
      }
      
    } catch (error) {
      console.warn('⚠️ Real-time update failed:', error);
    }
  }, [onDataUpdate, checkForDataChanges, isFirstUpdate]);

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