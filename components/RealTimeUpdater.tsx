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
    priceData?: ShibPriceData;
    totalBurnedData?: TotalBurnedData;
    burnsData?: BurnsData;
  }) => void;
  initialData?: {
    priceData: ShibPriceData;
    totalBurnedData: TotalBurnedData;
    burnsData: BurnsData;
  };
}

// Client-side component that handles real-time updates
export default function RealTimeUpdater({ onDataUpdate }: RealTimeUpdaterProps) {
  const [isLive, setIsLive] = useState(false);
  const [pageWasHidden, setPageWasHidden] = useState(false);
  
  // Track previous data to detect actual changes
  const [previousData, setPreviousData] = useState<{
    price?: number;
    marketCap?: number;
    volume24h?: number;
    totalBurned?: number;
    priceChange?: number;
    transactionCount?: number;
  }>({});



  // Fetch data from server cache (refreshed every 2 minutes by scheduled function)
  const fetchFreshData = useCallback(async () => {
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
      
      // Smart validation - only update data that's actually valid to prevent showing zeros
      const hasValidPrice = priceData && typeof priceData.price === 'number' && priceData.price > 0;
      const hasValidTotalBurned = totalBurnedData && typeof totalBurnedData.totalBurned === 'number' && totalBurnedData.totalBurned > 0;
      const hasValidBurns = burnsData && Array.isArray(burnsData.transactions) && burnsData.transactions.length > 0;
      
      // Only update if we have at least some valid data
      if ((hasValidPrice || hasValidTotalBurned || hasValidBurns) && onDataUpdate) {
        // Extract current data for comparison
        const currentData = {
          price: hasValidPrice ? priceData.price : previousData.price,
          marketCap: hasValidPrice ? priceData.marketCap : previousData.marketCap,
          volume24h: hasValidPrice ? priceData.volume24h : previousData.volume24h,
          totalBurned: hasValidTotalBurned ? totalBurnedData.totalBurned : previousData.totalBurned,
          priceChange: hasValidPrice ? priceData.priceChange24h : previousData.priceChange,
          transactionCount: hasValidBurns ? burnsData.transactions.length : previousData.transactionCount
        };
        
        // Check for actual changes with appropriate thresholds
        const hasChanges = 
          (Math.abs((currentData.price || 0) - (previousData.price || 0)) > 0.000000001) ||
          (Math.abs((currentData.marketCap || 0) - (previousData.marketCap || 0)) > 1000) ||
          (Math.abs((currentData.volume24h || 0) - (previousData.volume24h || 0)) > 1000) ||
          (Math.abs((currentData.totalBurned || 0) - (previousData.totalBurned || 0)) > 1) ||
          (Math.abs((currentData.priceChange || 0) - (previousData.priceChange || 0)) > 0.01) ||
          (currentData.transactionCount !== previousData.transactionCount);
        
        if (hasChanges || Object.keys(previousData).length === 0) {
          console.log('🔄 Data changes detected, triggering update:', {
            priceChanged: Math.abs((currentData.price || 0) - (previousData.price || 0)) > 0.000000001,
            priceDiff: Math.abs((currentData.price || 0) - (previousData.price || 0)),
            marketCapChanged: Math.abs((currentData.marketCap || 0) - (previousData.marketCap || 0)) > 1000,
            volumeChanged: Math.abs((currentData.volume24h || 0) - (previousData.volume24h || 0)) > 1000,
            totalBurnedChanged: Math.abs((currentData.totalBurned || 0) - (previousData.totalBurned || 0)) > 1,
            priceChangeChanged: Math.abs((currentData.priceChange || 0) - (previousData.priceChange || 0)) > 0.01,
            transactionCountChanged: currentData.transactionCount !== previousData.transactionCount
          });
          
          // Build update data only for changed/valid data
          const updateData: {
            priceData?: ShibPriceData;
            totalBurnedData?: TotalBurnedData;
            burnsData?: BurnsData;
          } = {};
          
          if (hasValidPrice) {
            updateData.priceData = priceData;
          }
          
          if (hasValidTotalBurned) {
            updateData.totalBurnedData = totalBurnedData;
          }
          
          if (hasValidBurns) {
            updateData.burnsData = burnsData;
          }
          
          // Update previous data and trigger parent update
          setPreviousData(currentData);
          onDataUpdate(updateData);
          setIsLive(true);
        } else {
          console.log('📊 Data fetched but no changes detected - skipping animation triggers');
          setIsLive(true); // Still mark as live, just don't trigger updates
        }
      } else {
        console.log('⚠️ No valid data received - keeping existing data to prevent zeros/empty displays');
      }
      
    } catch (error) {
      console.warn('⚠️ Real-time update failed:', error);
    }
  }, [onDataUpdate, previousData]); // Include previousData for change detection

  // Initial setup and polling
  useEffect(() => {
    console.log('🚀 RealTimeUpdater: Setting up real-time updates...');
    
    // Fetch fresh data immediately - no delay for fast initial load
    fetchFreshData();
    
    // Set up polling interval - server data refreshes every 1min via scheduled function
    // Client polls every 30s to display latest server data to users
    const pollInterval = setInterval(() => {
        fetchFreshData(); // Always fetch - server data stays current via scheduled refresh
    }, 30000); // 30 seconds - displays latest data from server cache
    
    return () => clearInterval(pollInterval);
  }, [fetchFreshData]);
  
  // Page visibility handling
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setPageWasHidden(true);
      } else if (pageWasHidden) {
        fetchFreshData(); // Fetch fresh data when returning to tab
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
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
          <span className="text-xs font-medium text-green-400">
            LIVE
          </span>
        </div>
      )}
      

    </>
  );
}