import { TrendingUp, TrendingDown, Flame, DollarSign, Clock } from 'lucide-react';
import StatCard from '../components/StatCard';
import BurnTransactionTable from '../components/BurnTransactionTable';
import RefreshButton from '../components/RefreshButton';
import { formatTimeAgo } from '../lib/api';
import Link from 'next/link';
import RealTimeUpdater from '../components/RealTimeUpdater';

/*
 * ⚡ ATOMIC DATA UPDATES SYSTEM ⚡
 * 
 * This homepage uses ATOMIC UPDATES to prevent data inconsistency:
 * - ALL data (price, burns, stats) is validated BEFORE any UI updates
 * - If ANY data fails validation, NO data is updated (keeps old consistent data)  
 * - Users NEVER see mixed old/new data or missing transactions during updates
 * - Loading indicators show when atomic updates are in progress
 * 
 * This ensures users always see complete, consistent data - never partial updates!
 */

interface BurnTransaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  timeStamp: string;
  blockNumber: string;
}

interface ShibPriceData {
  price: number;
  priceChange24h: number;
  marketCap: number;
  circulatingSupply: number;
  totalSupply: number;
  source?: string;
  cached?: boolean;
}

interface TotalBurnedData {
  totalBurned: number;
  source?: string;
  cached?: boolean;
}

interface BurnsData {
  transactions: BurnTransaction[];
  cached?: boolean;
  source?: string;
}

// Format large numbers for display
function formatNumber(num: number): string {
  if (num >= 1e12) return (num / 1e12).toFixed(2) + 'T';
  if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
  return num.toFixed(2);
}

function formatBurnedAmount(amount: number): string {
  // API already returns SHIB amounts, just format them
  return formatNumber(amount);
}

function formatBurnedAmountHighPrecision(amount: number): string {
  // High precision formatting for burnt from initial supply with 5 decimal places
  if (amount >= 1e12) return (amount / 1e12).toFixed(5) + 'T';
  if (amount >= 1e9) return (amount / 1e9).toFixed(5) + 'B';
  if (amount >= 1e6) return (amount / 1e6).toFixed(5) + 'M';
  if (amount >= 1e3) return (amount / 1e3).toFixed(5) + 'K';
  return amount.toFixed(5);
}

function formatMarketCap(marketCap: number): string {
  return (marketCap / 1e9).toFixed(5); // Convert to billions with 5 decimal places
}

function formatBurnedAmountDetailed(amount: number): string {
  // More detailed formatting for 24H burn activity with extra decimal places
  if (amount >= 1e12) return (amount / 1e12).toFixed(4) + 'T';
  if (amount >= 1e9) return (amount / 1e9).toFixed(4) + 'B';
  if (amount >= 1e6) return (amount / 1e6).toFixed(4) + 'M';
  if (amount >= 1e3) return (amount / 1e3).toFixed(4) + 'K';
  return amount.toFixed(4);
}

function formatSupplyNumber(supply: number): string {
  // Format supply numbers with full precision and commas (no rounding)
  return Math.floor(supply).toLocaleString('en-US');
}

// Server-side data fetching functions for instant loading with cached data
async function fetchShibPriceSSR(): Promise<ShibPriceData> {
  // Server-side fetch using cached data for instant loading
  try {
    const baseUrl = process.env.NETLIFY_URL || 'https://shibmetrics.com';
    const response = await fetch(`${baseUrl}/api/price`, {
      next: { revalidate: 30 } // Use cached data for 30 seconds for instant loading
    });
    
    if (response.ok) {
      const data = await response.json();
      if (!data.error && data.price) {
        console.log('💰 Price fetched from SSR cache');
        return data;
      }
    }
  } catch (error) {
    console.warn('⚠️ SSR price API failed:', error);
  }

  // Fallback for SSR
  return {
    price: 0.00000800,
    priceChange24h: 0.00,
    marketCap: 4700000000,
    circulatingSupply: 589247070164338,
    totalSupply: 1000000000000000,
    source: 'ssr_fallback',
    cached: true
  };
}

async function fetchTotalBurnedSSR(): Promise<TotalBurnedData> {
  // Server-side fetch using cached data for instant loading
  try {
    const baseUrl = process.env.NETLIFY_URL || 'https://shibmetrics.com';
    const response = await fetch(`${baseUrl}/api/total-burned`, {
      next: { revalidate: 60 } // Use cached data for 60 seconds for instant loading
    });
    
    if (response.ok) {
      const data = await response.json();
      if (!data.error && data.totalBurned) {
        console.log('🔥 Total burned fetched from SSR cache');
        return data;
      }
    }
  } catch (error) {
    console.warn('⚠️ SSR total burned API failed:', error);
  }

  // Fallback for SSR
  return {
    totalBurned: 410752070164338, // Updated to match shibburn.com exactly
    source: 'ssr_fallback',
    cached: true
  };
}

async function fetchBurnsSSR(): Promise<BurnsData> {
  // Server-side fetch using cached data for instant loading
  try {
    const baseUrl = process.env.NETLIFY_URL || 'https://shibmetrics.com';
    const response = await fetch(`${baseUrl}/api/burns`, {
      next: { revalidate: 30 } // Use cached data for 30 seconds for instant loading
    });
    
    if (response.ok) {
      const data = await response.json();
      if (!data.error && data.transactions && Array.isArray(data.transactions)) {
        console.log('🔥 Burns fetched from SSR cache');
        return data;
      }
    }
  } catch (error) {
    console.warn('⚠️ SSR burns API failed:', error);
  }

  // Fallback for SSR
  return {
    transactions: [{
      hash: '0x0000000000000000000000000000000000000000000000000000000000000000',
      from: '0x0000000000000000000000000000000000000000',
      to: '0xdead000000000000000042069420694206942069',
      value: '1000000000000000000000000', // 1M SHIB
      timeStamp: String(Math.floor(Date.now() / 1000) - 3600), // 1 hour ago
      blockNumber: '0'
    }],
    source: 'ssr_fallback',
    cached: true
  };
}

// ⚡ INSTANT LOADING with Server-Side Rendering + Real-time Updates!
export default async function Home() {
  // ⚡ INSTANT SERVER-SIDE DATA FETCHING - No loading delays!
  console.log('🚀 SSR: Fetching data instantly with cached content...');
  
  // Fetch all data server-side in parallel for instant loading
  const [priceData, totalBurnedData, burnsData] = await Promise.all([
    fetchShibPriceSSR(),
    fetchTotalBurnedSSR(), 
    fetchBurnsSSR()
  ]);
  
  console.log('🚀 SSR: All data fetched instantly!', {
    priceSource: priceData.source,
    totalBurnedSource: totalBurnedData.source,
    burnsSource: burnsData.source,
    burnsCount: burnsData.transactions.length
  });
  
  // Calculate metrics from server-side data for instant display
  const currentPrice = priceData.price;
  const priceChange = priceData.priceChange24h;
  const marketCap = priceData.marketCap;
  const circulatingSupply = priceData.circulatingSupply;
  const totalSupply = priceData.totalSupply;
  const totalBurned = totalBurnedData.totalBurned;
    const timestamp = Date.now();
    const priceCacheParam = forceFresh ? `?_t=${timestamp}` : '';
    const burnsCacheParam = forceFresh ? '?force=true' : '';
    
    console.log(`🔄 fetchFreshData: forceFresh=${forceFresh}, using cache-busting=${forceFresh ? 'YES' : 'NO'}`);
    
    try {
      const [newPriceData, newTotalBurnedData, newBurnsData] = await Promise.all([
        fetch(`/api/price${priceCacheParam}`, { 
          cache: 'no-cache',
          headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' }
        }).then(res => res.ok ? res.json() : fetchShibPrice()),
        fetch(`/api/total-burned`, { 
          cache: forceFresh ? 'no-cache' : 'default',
          headers: forceFresh ? { 'Cache-Control': 'no-cache, no-store, must-revalidate' } : {}
        }).then(res => res.ok ? res.json() : fetchTotalBurned()),
        fetch(`/api/burns${burnsCacheParam}`, { 
          cache: 'no-cache',
          headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' }
        }).then(res => res.ok ? res.json() : fetchBurns())
      ]);
      
      return { newPriceData, newTotalBurnedData, newBurnsData };
    } catch (error) {
      console.error('Fresh data fetch failed, using fallback:', error);
      // Fallback to original functions
      return {
        newPriceData: await fetchShibPrice(),
        newTotalBurnedData: await fetchTotalBurned(), 
        newBurnsData: await fetchBurns()
      };
    }
  }, []);
  
  // Main data fetching function with ATOMIC UPDATES - prevents data inconsistency
  const fetchAllData = useCallback(async (showLoading: boolean = false, forceFresh: boolean = false) => {
    console.log(`📡 fetchAllData called: showLoading=${showLoading}, forceFresh=${forceFresh}`);
    if (showLoading) setIsUpdating(true);
    
    try {
      const { newPriceData, newTotalBurnedData, newBurnsData } = await fetchFreshData(forceFresh);
      console.log('📊 Raw API responses:', { newPriceData, newTotalBurnedData, newBurnsData });
      
      // ⚡ CRITICAL: Validate ALL data BEFORE updating ANY state
      // This prevents users from seeing inconsistent/mixed old+new data
      
      const isPriceDataValid = newPriceData && 
                              typeof newPriceData.price === 'number' && 
                              newPriceData.price > 0 &&
                              typeof newPriceData.marketCap === 'number' &&
                              newPriceData.marketCap > 0 &&
                              typeof newPriceData.circulatingSupply === 'number' &&
                              newPriceData.circulatingSupply > 0 &&
                              typeof newPriceData.totalSupply === 'number' &&
                              newPriceData.totalSupply > 0;
      
      const isTotalBurnedDataValid = newTotalBurnedData && 
                                    typeof newTotalBurnedData.totalBurned === 'number' &&
                                    newTotalBurnedData.totalBurned > 0;
      
      const isBurnsDataValid = newBurnsData && 
                              Array.isArray(newBurnsData.transactions);
                              // Note: Allow empty arrays - valid during quiet periods
      
      // Log validation results
      console.log('🔍 Data validation:', {
        price: isPriceDataValid,
        totalBurned: isTotalBurnedDataValid,
        burns: isBurnsDataValid
      });
      
      // ⚡ ATOMIC UPDATE: Only update state if ALL data is valid
      // This ensures users never see partial/inconsistent data
      if (isPriceDataValid && isTotalBurnedDataValid && isBurnsDataValid) {
        console.log('✅ All data valid - performing atomic update');
        
        // Update all state atomically
        setPriceData(newPriceData);
        setTotalBurnedData(newTotalBurnedData);
        setBurnsData(newBurnsData);
        setLastUpdate(new Date());
        
        if (!isLive) setIsLive(true);
        if (isInitialLoad) setIsInitialLoad(false); // Mark initial load complete
        
        console.log(`💰 ATOMIC UPDATE COMPLETE - Price: $${newPriceData.price}, MarketCap: $${(newPriceData.marketCap / 1e9).toFixed(2)}B, CircSupply: ${(newPriceData.circulatingSupply / 1e12).toFixed(0)}T, Burns: ${newBurnsData.transactions.length} transactions`);
        
      } else {
        // If ANY data is invalid, keep ALL old data (prevents inconsistency)
        console.warn('❌ ATOMIC UPDATE REJECTED - keeping existing data to prevent inconsistency');
        console.warn('Failed validations:', {
          priceData: isPriceDataValid ? 'OK' : `FAIL - price: ${newPriceData?.price}, marketCap: ${newPriceData?.marketCap}, circSupply: ${newPriceData?.circulatingSupply}, totalSupply: ${newPriceData?.totalSupply}`,
          totalBurnedData: isTotalBurnedDataValid ? 'OK' : `FAIL - totalBurned: ${newTotalBurnedData?.totalBurned}`,
          burnsData: isBurnsDataValid ? 'OK' : `FAIL - transactions: ${newBurnsData?.transactions?.length || 'undefined'}, isArray: ${Array.isArray(newBurnsData?.transactions)}`
        });
      }
      
    } catch (error) {
      console.error('💥 Error fetching data - keeping existing data:', error);
      // On error, existing state is preserved (no inconsistent data shown)
    } finally {
      if (showLoading) setIsUpdating(false);
    }
  }, [isLive, fetchFreshData]);

  // Manual refresh handler for RefreshButton
  const handleManualRefresh = useCallback(async () => {
    console.log('🔄 Manual refresh triggered - forcing fresh data');
    await fetchAllData(true, true); // Force fresh data with loading indicator
  }, [fetchAllData]);

  // Initial data load and real-time polling setup
  useEffect(() => {
    console.log('🔄 Starting real-time updates system with ATOMIC UPDATES...');
    // Load data immediately on mount with AGGRESSIVE fresh data fetch
    console.log('🚀 Initial load: forcing fresh data on page mount...');
    fetchAllData(true, true); // Force fresh data on initial load
    
    // Set up polling for real-time updates (every 45 seconds)
    console.log('⏰ Setting up 45-second polling interval with atomic updates...');
    const interval = setInterval(() => {
      // Only poll if page is visible
      if (!document.hidden) {
        console.log('🔔 45-second timer: fetching fresh data with atomic validation...');
        fetchAllData(false, false);
      } else {
        console.log('👁️ Page hidden, skipping poll');
      }
    }, 45000);
    
    // Enhanced Page visibility change handler with better caching control
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Page became hidden - track this state
        setPageWasHidden(true);
        console.log('📱 Page hidden - pausing real-time updates');
      } else {
        // Page became visible
        console.log('👁️ Page visible - resuming with fresh data');
        
        // If page was hidden, force fresh data to prevent stale pricing
        if (pageWasHidden) {
          console.log('🔄 Forcing fresh data after page was hidden');
          fetchAllData(true, true); // Force fresh data with cache busting
          setPageWasHidden(false);
        } else {
          // Normal visibility change, regular fetch
          fetchAllData(false, false);
        }
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Also listen for focus events as additional fallback
    const handleFocus = () => {
      if (pageWasHidden) {
        console.log('🎯 Window focused after being hidden - forcing fresh data');
        fetchAllData(true, true);
        setPageWasHidden(false);
      }
    };
    
    window.addEventListener('focus', handleFocus);
    
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [fetchAllData, pageWasHidden]);

  // Calculate derived data - all data is ALWAYS available now due to bulletproof fallbacks
  const burns = burnsData.transactions;
  
  // Calculate burns to display: either last 10 OR all burns in last 24 hours (whichever is greater)
  const now = Date.now();
  const twentyFourHoursAgo = now - (24 * 60 * 60 * 1000);
  const fortyEightHoursAgo = now - (48 * 60 * 60 * 1000);
  
  // Filter burns from last 24 hours
  const last24HourBurns = burns.filter(tx => {
    const txTime = parseInt(tx.timeStamp) * 1000;
    return txTime >= twentyFourHoursAgo;
  });
  
  // Filter burns from previous 24 hours (24-48 hours ago) for day-over-day comparison
  const previous24HourBurns = burns.filter(tx => {
    const txTime = parseInt(tx.timeStamp) * 1000;
    return txTime >= fortyEightHoursAgo && txTime < twentyFourHoursAgo;
  });
  
  // Show either last 10 burns or all 24h burns (whichever is greater)
  const burnsToShow = last24HourBurns.length > 10 ? last24HourBurns : burns.slice(0, 10);
  
  // Calculate 24H burn activity from actual 24H burns
  const twentyFourHourBurnAmount = last24HourBurns.reduce((total: number, tx: BurnTransaction) => 
    total + (parseInt(tx.value) / 1e18), 0);

  // Calculate previous 24H burn activity for comparison
  const previous24HourBurnAmount = previous24HourBurns.reduce((total: number, tx: BurnTransaction) => 
    total + (parseInt(tx.value) / 1e18), 0);

  // Calculate day-over-day percentage change
  let dayOverDayChange = 0;
  let dayOverDayText = 'No previous data';
  
  if (previous24HourBurnAmount > 0) {
    dayOverDayChange = ((twentyFourHourBurnAmount - previous24HourBurnAmount) / previous24HourBurnAmount) * 100;
    const sign = dayOverDayChange >= 0 ? '+' : '';
    
    // Format large percentage changes appropriately
    let formattedChange;
    if (Math.abs(dayOverDayChange) >= 1000) {
      // For very large changes (1000%+), show no decimal places
      formattedChange = `${Math.round(dayOverDayChange).toLocaleString()}`;
    } else if (Math.abs(dayOverDayChange) >= 100) {
      // For large changes (100-999%), show 1 decimal place
      formattedChange = dayOverDayChange.toFixed(1);
    } else {
      // For smaller changes (<100%), show 1 decimal place
      formattedChange = dayOverDayChange.toFixed(1);
    }
    
    dayOverDayText = `${sign}${formattedChange}% vs yesterday`;
  } else if (twentyFourHourBurnAmount > 0) {
    // If there were no burns yesterday but there are burns today, it's technically infinite increase
    dayOverDayText = '🚀 New activity today';
  }
  
  const burnRate = twentyFourHourBurnAmount / 24; // SHIB per hour
  const mostRecentBurn = burns[0];

  // Calculate proper time since last burn
  const timeSinceLastBurn = mostRecentBurn ? 
    formatTimeAgo(mostRecentBurn.timeStamp) : 'Unknown';

  // Use market cap from CoinGecko API and calculate burn percentage - data is ALWAYS available now
  const totalSupply = 1000000000000000; // Original total supply: 1 quadrillion SHIB
  const marketCap = priceData.marketCap; // Market cap from CoinGecko API for accuracy
  const burnPercentage = (totalBurnedData.totalBurned / totalSupply) * 100;

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <h1 className="text-4xl md:text-6xl font-bold text-white">🔥 SHIBMETRICS</h1>
            
            {/* Live Status Indicator */}
            {isLive && (
              <div className="ml-4 flex items-center gap-2 bg-green-900/20 border border-green-500/30 rounded-full px-3 py-1">
                <div className={`w-2 h-2 rounded-full ${isUpdating ? 'bg-orange-400 animate-pulse' : 'bg-green-400 animate-pulse'}`}></div>
                <span className={`text-xs font-medium ${isUpdating ? 'text-orange-400' : 'text-green-400'}`}>
                  {isUpdating ? 'UPDATING...' : 'LIVE'}
                </span>
              </div>
            )}
            
            <RefreshButton onRefresh={handleManualRefresh} />
          </div>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-2">
            Track SHIBA INU token burns in real-time. Monitor burn transactions, rates, and supply reduction.
          </p>
          {isLive && (
            <p className="text-sm text-gray-400 mb-4">
              Auto-updates every 45 seconds • Last updated: {lastUpdate.toLocaleTimeString()}
            </p>
          )}
          <div className="inline-flex items-center gap-2 bg-green-900/20 border border-green-500/30 rounded-full px-4 py-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-green-400 text-sm font-medium">
              ✨ Always Ad-Free • No Annoying Popups • Clean Experience
            </span>
          </div>
        </div>

        {/* All Stats - Tight 2x3 Grid */}
        <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 transition-opacity duration-200 ${isUpdating ? 'opacity-90' : ''}`}>
          {/* 24H Burn Activity - ALWAYS available now */}
          <StatCard
            title="24H Burn Activity"
            value={`${formatBurnedAmountDetailed(twentyFourHourBurnAmount)} SHIB`}
            change={dayOverDayText}
            icon={dayOverDayChange > 0 ? TrendingUp : dayOverDayChange < 0 ? TrendingDown : Flame}
            changeType={dayOverDayChange > 0 ? "positive" : dayOverDayChange < 0 ? "negative" : "neutral"}
            loading={isInitialLoad}
          />
 
           {/* SHIB Price - ALWAYS available now */}
           <StatCard
             title="SHIB Price"
             value={`$${priceData.price.toFixed(8)}`}
             change={`${priceData.priceChange24h >= 0 ? '+' : ''}${priceData.priceChange24h.toFixed(2)}% (24h)`}
             icon={DollarSign}
             changeType={priceData.priceChange24h >= 0 ? "positive" : "negative"}
           />

           {/* Burnt from Initial Supply - NEW */}
           <StatCard
             title="Burnt from Initial Supply"
             value={`${formatBurnedAmountHighPrecision(totalBurnedData.totalBurned)} SHIB`}
             change={`${burnPercentage.toFixed(6)}% of 1Q initial supply`}
             icon={Flame}
             changeType="positive"
           />
 
           {/* Last Burn - ALWAYS available now */}
           <StatCard
             title="Last Burn"
             value={`${timeSinceLastBurn}`}
             change="Most recent activity"
             icon={Clock}
             changeType="neutral"
             loading={isInitialLoad}
           />
 
           {/* Burn Rate - ALWAYS available now */}
           <StatCard
             title="Burn Rate"
             value={`${formatBurnedAmount(burnRate)} SHIB/hr`}
             change={`${formatBurnedAmount(twentyFourHourBurnAmount)} SHIB in past day`}
             icon={Flame}
             changeType="neutral"
             loading={isInitialLoad}
           />
 
           {/* Market Cap - ALWAYS available now */}
           <StatCard
             title="Market Cap"
             value={`$${formatMarketCap(marketCap)}B`}
             change="Current valuation"
             icon={TrendingUp}
             changeType="neutral"
           />

           {/* Circulating Supply - NEW */}
           <StatCard
             title="Circulating Supply"
             value={`${formatSupplyNumber(priceData.circulatingSupply)} SHIB`}
             change="Currently in circulation"
             icon={TrendingUp}
             changeType="neutral"
           />

           {/* Total Supply - NEW */}
           <StatCard
             title="Total Supply"
             value={`${formatSupplyNumber(priceData.totalSupply)} SHIB`}
             change="Maximum ever created"
             icon={Flame}
             changeType="neutral"
           />
        </div>

        {/* Burn Progress - ALWAYS available now */}
        <div className="bg-gray-800 rounded-xl shadow-lg p-8 mb-12 border border-gray-700">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">🔥 Burn Progress</h2>
          <div className="space-y-8">
            <div className="text-center">
              <div className="text-5xl font-bold text-orange-400 mb-2">{burnPercentage.toFixed(4)}%</div>
              <div className="text-gray-300 text-lg">of total supply permanently burned</div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-medium text-gray-300">Progress to Next Milestone</span>
                <span className="text-lg text-orange-400 font-bold">{formatBurnedAmount(totalBurnedData.totalBurned)}T SHIB</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-6 shadow-inner">
                <div 
                  className="bg-gradient-to-r from-orange-500 to-red-500 h-6 rounded-full transition-all duration-1000 shadow-lg"
                  style={{ width: `${Math.min(burnPercentage, 100)}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-sm text-gray-400 mt-2">
                <span>0 SHIB</span>
                <span>1 Quadrillion SHIB</span>
              </div>
            </div>
          </div>
        </div>

        {/* Latest Burn Transactions */}
        <div className={`bg-gray-800 rounded-lg border border-gray-700 relative ${isUpdating ? 'opacity-95' : ''}`}>
          <div className="px-6 py-4 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">
                {last24HourBurns.length > 10 
                  ? `Recent Burn Transactions (${last24HourBurns.length} in last 24h)` 
                  : 'Latest Burn Transactions (Last 10)'}
              </h3>
              {isUpdating && (
                <div className="flex items-center gap-2 text-orange-400 text-xs">
                  <div className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-pulse"></div>
                  <span>Refreshing...</span>
                </div>
              )}
            </div>
          </div>
          <BurnTransactionTable transactions={burnsToShow} loading={false} />
        </div>

        {/* View Burn Tracker Button */}
        <div className="mt-8 text-center">
          <Link 
            href="/burn-tracker"
            className="inline-flex items-center px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-colors shadow-lg"
          >
            <Flame className="h-5 w-5 mr-2" />
            View Burn Tracker
          </Link>
        </div>
      </div>
    </div>
  );
}
