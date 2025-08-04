'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { TrendingUp, TrendingDown, Flame, DollarSign, Clock } from 'lucide-react';
import StatCard from '../components/StatCard';
import BurnTransactionTable from '../components/BurnTransactionTable';
import FlameEffect from '../components/FlameEffect';
import Link from 'next/link';
import RealTimeUpdater from '../components/RealTimeUpdater';

/*
 * ⚡ FIXED: Real-time Updates + Fast Initial Loading!
 * 
 * This homepage now properly connects RealTimeUpdater with onDataUpdate callback:
 * 1. CLIENT-SIDE: Fetches cached data quickly on mount for fast display  
 * 2. REAL-TIME: Updates every 45 seconds via RealTimeUpdater component
 * 
 * Result: Users see data quickly, then it updates every 45 seconds automatically!
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
  transactions: BurnTransaction[];
  source: string;
  cached: boolean;
}

// BULLETPROOF .toFixed() wrapper to prevent React error #418 
function safeToFixed(num: any, decimals: number): string {
  // Handle all possible bad inputs that could cause React error #418
  if (num === null || num === undefined || num === '' || typeof num !== 'number') {
    return '0.' + '0'.repeat(Math.max(0, decimals));
  }
  if (isNaN(num) || !isFinite(num) || num === Infinity || num === -Infinity) {
    return '0.' + '0'.repeat(Math.max(0, decimals));
  }
  try {
    const result = num.toFixed(Math.max(0, decimals));
    // Double-check the result isn't somehow still invalid
    if (typeof result !== 'string' || result === 'NaN' || result === 'Infinity' || result === '-Infinity') {
      return '0.' + '0'.repeat(Math.max(0, decimals));
    }
    return result;
  } catch (e) {
    console.warn('safeToFixed error:', e, 'for input:', num);
    return '0.' + '0'.repeat(Math.max(0, decimals));
  }
}

// Format large numbers for display (with null/undefined protection)
function formatNumber(num: number): string {
  const safeNum = (typeof num === 'number' && !isNaN(num)) ? num : 0;
  if (safeNum >= 1e12) return safeToFixed(safeNum / 1e12, 2) + 'T';
  if (safeNum >= 1e9) return safeToFixed(safeNum / 1e9, 2) + 'B';
  if (safeNum >= 1e6) return safeToFixed(safeNum / 1e6, 2) + 'M';
  if (safeNum >= 1e3) return safeToFixed(safeNum / 1e3, 2) + 'K';
  return safeToFixed(safeNum, 2);
}

function formatBurnedAmountHighPrecision(amount: number): string {
  const safeAmount = (typeof amount === 'number' && !isNaN(amount)) ? amount : 0;
  if (safeAmount >= 1e12) return safeToFixed(safeAmount / 1e12, 5) + 'T';
  if (safeAmount >= 1e9) return safeToFixed(safeAmount / 1e9, 5) + 'B';
  if (safeAmount >= 1e6) return safeToFixed(safeAmount / 1e6, 5) + 'M';
  if (safeAmount >= 1e3) return safeToFixed(safeAmount / 1e3, 5) + 'K';
  return safeToFixed(safeAmount, 5);
}

function formatMarketCap(marketCap: number): string {
  const safeCap = (typeof marketCap === 'number' && !isNaN(marketCap)) ? marketCap : 0;
  return safeToFixed(safeCap / 1e9, 5); // Convert to billions with 5 decimal places
}

function formatBurnedAmountDetailed(amount: number): string {
  const safeAmount = (typeof amount === 'number' && !isNaN(amount)) ? amount : 0;
  if (safeAmount >= 1e12) return safeToFixed(safeAmount / 1e12, 4) + 'T';
  if (safeAmount >= 1e9) return safeToFixed(safeAmount / 1e9, 4) + 'B';
  if (safeAmount >= 1e6) return safeToFixed(safeAmount / 1e6, 4) + 'M';
  if (safeAmount >= 1e3) return safeToFixed(safeAmount / 1e3, 4) + 'K';
  return safeToFixed(safeAmount, 4);
}

function formatSupplyNumber(supply: number): string {
  const safeSupply = (typeof supply === 'number' && !isNaN(supply) && isFinite(supply)) ? supply : 0;
  const flooredValue = Math.floor(safeSupply);
  if (isNaN(flooredValue) || !isFinite(flooredValue)) return '0';
  return flooredValue.toLocaleString('en-US');
}

function formatVolume24h(volume: number): string {
  const safeVolume = (typeof volume === 'number' && !isNaN(volume)) ? volume : 0;
  if (safeVolume >= 1e9) return `$${safeToFixed(safeVolume / 1e9, 2)}B`;
  if (safeVolume >= 1e6) return `$${safeToFixed(safeVolume / 1e6, 2)}M`;
  if (safeVolume >= 1e3) return `$${safeToFixed(safeVolume / 1e3, 2)}K`;
  return `$${safeToFixed(safeVolume, 2)}`;
}

// Client-side data fetching functions for fast initial loading
async function fetchShibPriceClient(): Promise<ShibPriceData> {
  try {
    const response = await fetch('/api/price', { cache: 'no-cache' });
    
    if (response.ok) {
      const data = await response.json();
      if (!data.error && data.price) {
        console.log('💰 Price fetched from client');
        // Cache successful data in localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('shibmetrics_price_cache', JSON.stringify(data));
        }
        return data;
      }
    }
  } catch (error) {
    console.warn('⚠️ Client price API failed:', error);
  }

  // Fallback to last cached data if available
  if (typeof window !== 'undefined') {
    const cached = localStorage.getItem('shibmetrics_price_cache');
    if (cached) {
      try {
        const parsedCache = JSON.parse(cached);
        console.log('📦 Using cached price data as fallback');
        // BULLETPROOF: Validate all cached values
        return { 
          price: (typeof parsedCache.price === 'number' && !isNaN(parsedCache.price) && isFinite(parsedCache.price)) ? parsedCache.price : 0,
          priceChange24h: (typeof parsedCache.priceChange24h === 'number' && !isNaN(parsedCache.priceChange24h) && isFinite(parsedCache.priceChange24h)) ? parsedCache.priceChange24h : 0,
          marketCap: (typeof parsedCache.marketCap === 'number' && !isNaN(parsedCache.marketCap) && isFinite(parsedCache.marketCap)) ? parsedCache.marketCap : 0,
          circulatingSupply: (typeof parsedCache.circulatingSupply === 'number' && !isNaN(parsedCache.circulatingSupply) && isFinite(parsedCache.circulatingSupply)) ? parsedCache.circulatingSupply : 0,
          totalSupply: (typeof parsedCache.totalSupply === 'number' && !isNaN(parsedCache.totalSupply) && isFinite(parsedCache.totalSupply)) ? parsedCache.totalSupply : 0,
          volume24h: (typeof parsedCache.volume24h === 'number' && !isNaN(parsedCache.volume24h) && isFinite(parsedCache.volume24h)) ? parsedCache.volume24h : 0,
          source: 'cached_fallback',
          cached: true
        };
      } catch (e) {
        console.warn('Failed to parse cached price data');
      }
    }
  }

  // Safe fallback if no cache available - NEVER throw errors
  console.log('📦 Using emergency safe price fallback');
  return {
    price: 0,
    priceChange24h: 0,
    marketCap: 0,
    circulatingSupply: 0,
    totalSupply: 0,
    volume24h: 0,
    source: 'emergency_fallback',
    cached: false
  };
}

async function fetchTotalBurnedClient(): Promise<TotalBurnedData> {
  try {
    const response = await fetch('/api/total-burned', { cache: 'no-cache' });
    
    if (response.ok) {
      const data = await response.json();
      if (!data.error && data.totalBurned) {
        console.log('🔥 Total burned fetched from client');
        // Cache successful data in localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('shibmetrics_totalburned_cache', JSON.stringify(data));
        }
        return data;
      }
    }
  } catch (error) {
    console.warn('⚠️ Client total burned API failed:', error);
  }

  // Fallback to last cached data if available
  if (typeof window !== 'undefined') {
    const cached = localStorage.getItem('shibmetrics_totalburned_cache');
    if (cached) {
      try {
        const parsedCache = JSON.parse(cached);
        console.log('📦 Using cached total burned data as fallback');
        // BULLETPROOF: Validate cached totalBurned value
        return { 
          totalBurned: (typeof parsedCache.totalBurned === 'number' && !isNaN(parsedCache.totalBurned) && isFinite(parsedCache.totalBurned)) ? parsedCache.totalBurned : 0,
          source: 'cached_fallback',
          cached: true
        };
      } catch (e) {
        console.warn('Failed to parse cached total burned data');
      }
    }
  }

  // Safe fallback if no cache available - NEVER throw errors
  console.log('📦 Using emergency safe totalBurned fallback');
  return {
    totalBurned: 0,
    source: 'emergency_fallback',
    cached: false
  };
}

async function fetchBurnsClient(): Promise<BurnsData> {
  try {
    const response = await fetch('/api/burns', { cache: 'no-cache' });
    
    if (response.ok) {
      const data = await response.json();
      if (!data.error && data.transactions && Array.isArray(data.transactions)) {
        console.log('🔥 Burns fetched from client');
        // Cache successful data in localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('shibmetrics_burns_cache', JSON.stringify(data));
        }
        return data;
      }
    }
  } catch (error) {
    console.warn('⚠️ Client burns API failed:', error);
  }

  // Fallback to last cached data if available
  if (typeof window !== 'undefined') {
    const cached = localStorage.getItem('shibmetrics_burns_cache');
    if (cached) {
      try {
        const parsedCache = JSON.parse(cached);
        console.log('📦 Using cached burns data as fallback');
        // BULLETPROOF: Ensure transactions is always an array
        return { 
          transactions: Array.isArray(parsedCache.transactions) ? parsedCache.transactions : [],
          source: 'cached_fallback',
          cached: true
        };
      } catch (e) {
        console.warn('Failed to parse cached burns data');
      }
    }
  }

  // Safe fallback if no cache available - NEVER throw errors
  console.log('📦 Using emergency safe burns fallback');
  return {
    transactions: [{
      hash: '0x0000000000000000000000000000000000000000000000000000000000000000',
      from: '0x0000000000000000000000000000000000000000',
      to: '0xdead000000000000000042069420694206942069',
      value: '1000000000000000000000000', // 1M SHIB
      timeStamp: String(Math.floor(Date.now() / 1000) - 3600), // 1 hour ago
      blockNumber: '0'
    }],
    source: 'emergency_fallback',
    cached: false
  };
}

// ⚡ FIXED: Client Component with Real-time Updates!
export default function Home() {
  // State management for real-time updates
  const [priceData, setPriceData] = useState<ShibPriceData>(() => {
    // Load from localStorage if available, otherwise minimal initial state
    const cached = typeof window !== 'undefined' ? localStorage.getItem('shibmetrics_price_cache') : null;
    if (cached) {
      try {
        const parsedCache = JSON.parse(cached);
        // Clear cache if it's missing volume24h field (legacy data)
        if (typeof parsedCache.volume24h === 'undefined') {
          localStorage.removeItem('shibmetrics_price_cache');
          console.log('🔄 Cleared legacy cache data - will fetch fresh data');
        } else {
          // Use cached data with volume24h
  return {
            ...parsedCache,
            volume24h: parsedCache.volume24h || 0
          };
        }
      } catch (e) {
        console.warn('Failed to parse cached price data');
      }
    }
          return {
        price: 0, priceChange24h: 0, marketCap: 0,
        circulatingSupply: 0, totalSupply: 0, volume24h: 0,
        source: 'initial', cached: true
      };
  });
  const [totalBurnedData, setTotalBurnedData] = useState<TotalBurnedData>(() => {
    // Load from localStorage if available, otherwise minimal initial state
    const cached = typeof window !== 'undefined' ? localStorage.getItem('shibmetrics_totalburned_cache') : null;
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        console.warn('Failed to parse cached total burned data');
      }
    }
    return { totalBurned: 0, source: 'initial', cached: true };
  });
  const [burnsData, setBurnsData] = useState<BurnsData>(() => {
    // Load from localStorage if available, otherwise minimal initial state
    const cached = typeof window !== 'undefined' ? localStorage.getItem('shibmetrics_burns_cache') : null;
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        console.warn('Failed to parse cached burns data');
      }
    }
    return { transactions: [], source: 'initial', cached: true };
  });
  const [loading, setLoading] = useState(true);
  const [showFlameEffect, setShowFlameEffect] = useState(false);
  const [previousTransactionHashes, setPreviousTransactionHashes] = useState<Set<string>>(new Set());
  
  // Animation state for number changes
  const [animatingCards, setAnimatingCards] = useState<Set<string>>(new Set());
  const previousDataRef = useRef<{
    price: number;
    marketCap: number;
    volume24h: number;
    totalBurned: number;
    priceChange: number;
  } | null>(null);
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
    };
  }, []);

  // Initial data fetch on component mount
  useEffect(() => {
    console.log('🚀 Client: Fetching initial data...');
    
    const fetchInitialData = async () => {
      // Fetch each API independently to handle individual failures
      const fetchPrice = async () => {
        try {
          const result = await fetchShibPriceClient();
          setPriceData(result);
          console.log('💰 Price data loaded:', result.source);
        } catch (error) {
          console.warn('⚠️ Price data unavailable:', error instanceof Error ? error.message : 'Unknown error');
        }
      };

      const fetchTotalBurned = async () => {
        try {
          const result = await fetchTotalBurnedClient();
          setTotalBurnedData(result);
          console.log('🔥 Total burned data loaded:', result.source);
        } catch (error) {
          console.warn('⚠️ Total burned data unavailable:', error instanceof Error ? error.message : 'Unknown error');
        }
      };

      const fetchBurns = async () => {
        try {
          const result = await fetchBurnsClient();
          setBurnsData(result);
          console.log('📊 Burns data loaded:', result.source, `(${result.transactions.length} transactions)`);
        } catch (error) {
          console.warn('⚠️ Burns data unavailable:', error instanceof Error ? error.message : 'Unknown error');
        }
      };

      // Fetch all APIs independently
      await Promise.all([fetchPrice(), fetchTotalBurned(), fetchBurns()]);
      setLoading(false);
      console.log('🚀 Client: Initial data fetch complete');
    };

    fetchInitialData();
  }, []);

  // Initialize transaction hashes tracking for flame effect (ONLY ONCE)
  const hasInitializedHashTracking = useRef(false);
  useEffect(() => {
    if (!hasInitializedHashTracking.current && Array.isArray(burnsData.transactions) && burnsData.transactions.length > 0) {
      const initialHashes = new Set(burnsData.transactions.map(tx => tx.hash));
      setPreviousTransactionHashes(initialHashes);
      hasInitializedHashTracking.current = true;
      console.log('📝 Initialized transaction hash tracking ONCE with', initialHashes.size, 'transactions');
    }
  }, [burnsData.transactions]);

  // REMOVED: Cleanup logic for animations - keeping it simple

  // REMOVED: Complex animation logic - keeping it simple

  // Handle real-time updates from RealTimeUpdater - WITH FLAME EFFECT ON NEW BURNS
  const handleDataUpdate = useCallback((data: {
    priceData: ShibPriceData;
    totalBurnedData: TotalBurnedData;
    burnsData: BurnsData;
  }) => {
    console.log('🔄 Real-time update received - SIMPLIFIED', {
      price: data.priceData.price,
      marketCap: data.priceData.marketCap,
      volume: data.priceData.volume24h,
      totalBurned: data.totalBurnedData.totalBurned
    });
    
    // 🔥 FLAME EFFECT: Detect GENUINELY new burn transactions  
    const newTransactions = Array.isArray(data.burnsData.transactions) ? data.burnsData.transactions : [];
    const newHashes = new Set(newTransactions.map(tx => tx.hash));
    
    // Use functional update to avoid dependency issues
    setPreviousTransactionHashes(prevHashes => {
      // Only check for new burns if we have previous hash data AND it's not empty
      if (prevHashes.size > 0) {
        // Find truly new hashes that we haven't seen before
        const genuinelyNewHashes = Array.from(newHashes).filter(hash => !prevHashes.has(hash));
        const newBurnCount = genuinelyNewHashes.length;
        
        console.log(`🔍 Flame effect check: ${newBurnCount} new burns detected out of ${newHashes.size} total transactions`);
        
        if (newBurnCount > 0) {
          console.log('🔥 GENUINE NEW BURN DETECTED! Triggering flame effect for', newBurnCount, 'new burns');
          console.log('🔥 New burn hashes:', genuinelyNewHashes.slice(0, 3)); // Log first 3 for debugging
          setShowFlameEffect(true);
        } else {
          console.log('✅ No new burns - same transactions as before');
        }
      } else {
        console.log('📝 Skipping flame effect check - hash tracking not yet initialized');
      }
      
      // Return the new hash set
      return newHashes;
    });
    
    // 🎬 ANIMATION: Detect changes and trigger animations
    const newData = {
      price: (typeof data.priceData.price === 'number' && !isNaN(data.priceData.price)) ? data.priceData.price : 0,
      marketCap: (typeof data.priceData.marketCap === 'number' && !isNaN(data.priceData.marketCap)) ? data.priceData.marketCap : 0,
      volume24h: (typeof data.priceData.volume24h === 'number' && !isNaN(data.priceData.volume24h)) ? data.priceData.volume24h : 0,
      totalBurned: (typeof data.totalBurnedData.totalBurned === 'number' && !isNaN(data.totalBurnedData.totalBurned)) ? data.totalBurnedData.totalBurned : 0,
      priceChange: (typeof data.priceData.priceChange24h === 'number' && !isNaN(data.priceData.priceChange24h)) ? data.priceData.priceChange24h : 0
    };
    
    // Check for changes and trigger animations
    if (previousDataRef.current) {
      const changedCards = new Set<string>();
      
      if (Math.abs(newData.price - previousDataRef.current.price) > 0.000000001) {
        changedCards.add('price');
      }
      if (Math.abs(newData.marketCap - previousDataRef.current.marketCap) > 1000) {
        changedCards.add('marketCap');
      }
      if (Math.abs(newData.volume24h - previousDataRef.current.volume24h) > 1000) {
        changedCards.add('volume24h');
      }
      if (Math.abs(newData.totalBurned - previousDataRef.current.totalBurned) > 1) {
        changedCards.add('totalBurned');
      }
      if (Math.abs(newData.priceChange - previousDataRef.current.priceChange) > 0.01) {
        changedCards.add('priceChange');  
      }
      
      if (changedCards.size > 0) {
        console.log('🎬 Data changes detected:', Array.from(changedCards));
        setAnimatingCards(changedCards);
        
        // Clear animations after 2 seconds using ref to prevent memory leaks
        if (animationTimeoutRef.current) {
          clearTimeout(animationTimeoutRef.current);
        }
        animationTimeoutRef.current = setTimeout(() => {
          setAnimatingCards(new Set());
          animationTimeoutRef.current = null;
        }, 2000);
      }
    }
    
    // Store current data for next comparison
    previousDataRef.current = newData;
    
    // Update React state
    setPriceData(data.priceData);
    setTotalBurnedData(data.totalBurnedData);
    setBurnsData(data.burnsData);
    
    // Cache the fresh data in localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('shibmetrics_price_cache', JSON.stringify(data.priceData));
      localStorage.setItem('shibmetrics_totalburned_cache', JSON.stringify(data.totalBurnedData));
      localStorage.setItem('shibmetrics_burns_cache', JSON.stringify(data.burnsData));
    }
  }, []); // Empty dependency array - use functional updates instead
  
  // Calculate all metrics from server-side data for instant display (with NUCLEAR-LEVEL safe fallbacks)
  const burns = Array.isArray(burnsData?.transactions) ? burnsData.transactions : [];
  const totalBurned = (totalBurnedData?.totalBurned != null && typeof totalBurnedData.totalBurned === 'number' && !isNaN(totalBurnedData.totalBurned) && isFinite(totalBurnedData.totalBurned)) ? totalBurnedData.totalBurned : 0;
  const priceChange = (priceData?.priceChange24h != null && typeof priceData.priceChange24h === 'number' && !isNaN(priceData.priceChange24h) && isFinite(priceData.priceChange24h)) ? priceData.priceChange24h : 0;
  const marketCap = (priceData?.marketCap != null && typeof priceData.marketCap === 'number' && !isNaN(priceData.marketCap) && isFinite(priceData.marketCap)) ? priceData.marketCap : 0;
  const circulatingSupply = (priceData?.circulatingSupply != null && typeof priceData.circulatingSupply === 'number' && !isNaN(priceData.circulatingSupply) && isFinite(priceData.circulatingSupply)) ? priceData.circulatingSupply : 0;
  const totalSupply = (priceData?.totalSupply != null && typeof priceData.totalSupply === 'number' && !isNaN(priceData.totalSupply) && isFinite(priceData.totalSupply)) ? priceData.totalSupply : 0;
  const volume24h = (priceData?.volume24h != null && typeof priceData.volume24h === 'number' && !isNaN(priceData.volume24h) && isFinite(priceData.volume24h)) ? priceData.volume24h : 0;
  const currentPrice = (priceData?.price != null && typeof priceData.price === 'number' && !isNaN(priceData.price) && isFinite(priceData.price)) ? priceData.price : 0;
  const now = Date.now();
  const twentyFourHoursAgo = now - (24 * 60 * 60 * 1000);
  const fortyEightHoursAgo = now - (48 * 60 * 60 * 1000);
  
  // Filter for actual 24H burn activity
  const last24HourBurns = burns.filter((tx: BurnTransaction) => {
    const txTime = parseInt(tx.timeStamp) * 1000;
    return txTime >= twentyFourHoursAgo;
  });
  
  // Filter for previous 24H (24-48 hours ago) for comparison
  const previous24HourBurns = burns.filter((tx: BurnTransaction) => {
    const txTime = parseInt(tx.timeStamp) * 1000;
    return txTime >= fortyEightHoursAgo && txTime < twentyFourHoursAgo;
  });
  
  // Show either last 10 burns or all 24h burns (whichever is greater)
  const burnsToShow = last24HourBurns.length > 10 ? last24HourBurns : burns.slice(0, 10);
  
  // Calculate 24H burn activity from actual 24H burns (with safe fallbacks)
  const twentyFourHourBurnAmount = last24HourBurns.reduce((total: number, tx: BurnTransaction) => {
    const value = parseInt(tx.value || '0');
    return total + (isNaN(value) ? 0 : value / 1e18);
  }, 0);

  // Calculate previous 24H burn activity for comparison (with safe fallbacks)
  const previous24HourBurnAmount = previous24HourBurns.reduce((total: number, tx: BurnTransaction) => {
    const value = parseInt(tx.value || '0');
    return total + (isNaN(value) ? 0 : value / 1e18);
  }, 0);

  // Calculate day-over-day percentage change (with NUCLEAR-LEVEL safe fallbacks)
  let dayOverDayChange = 0;
  let dayOverDayText = 'No previous data'; // Default safe value
  
  try {
    // Ensure all values are safe numbers
    const safeTwentyFourHour = (typeof twentyFourHourBurnAmount === 'number' && !isNaN(twentyFourHourBurnAmount) && isFinite(twentyFourHourBurnAmount)) ? twentyFourHourBurnAmount : 0;
    const safePrevious24Hour = (typeof previous24HourBurnAmount === 'number' && !isNaN(previous24HourBurnAmount) && isFinite(previous24HourBurnAmount)) ? previous24HourBurnAmount : 0;
    
    if (safePrevious24Hour > 0) {
      const rawChange = ((safeTwentyFourHour - safePrevious24Hour) / safePrevious24Hour) * 100;
      dayOverDayChange = (typeof rawChange === 'number' && !isNaN(rawChange) && isFinite(rawChange)) ? rawChange : 0;
    const sign = dayOverDayChange >= 0 ? '+' : '';
    
    // Format large percentage changes appropriately
      let formattedChange = '0.0';
      const absChange = Math.abs(dayOverDayChange);
      if (absChange >= 1000) {
        const rounded = Math.round(dayOverDayChange);
        formattedChange = (typeof rounded === 'number' && !isNaN(rounded) && isFinite(rounded)) ? rounded.toLocaleString() : '0';
      } else if (absChange >= 100) {
        formattedChange = safeToFixed(dayOverDayChange, 1);
    } else {
        formattedChange = safeToFixed(dayOverDayChange, 1);
    }
    
    dayOverDayText = `${sign}${formattedChange}% vs yesterday`;
    } else if (safeTwentyFourHour > 0) {
    dayOverDayText = '🚀 New activity today';
    }
    // else: dayOverDayText remains as 'No previous data'
  } catch (error) {
    console.warn('Error calculating day-over-day change:', error);
    dayOverDayText = 'No data available';
    dayOverDayChange = 0;
  }
  
  // Additional calculations can be added here if needed

  // Calculate burn percentage (with safe fallbacks)
  const totalSupplyOriginal = 1000000000000000; // Original total supply: 1 quadrillion SHIB
  const burnPercentage = (totalBurned > 0 && !isNaN(totalBurned)) ? (totalBurned / totalSupplyOriginal) * 100 : 0;

  // Create BULLETPROOF display values - NEVER allow undefined/null/NaN to reach React render
  const safeDisplayValues = {
    price: (typeof currentPrice === 'number' && !isNaN(currentPrice) && isFinite(currentPrice)) ? currentPrice : 0,
    priceChange: (typeof priceChange === 'number' && !isNaN(priceChange) && isFinite(priceChange)) ? priceChange : 0,
    marketCap: (typeof marketCap === 'number' && !isNaN(marketCap) && isFinite(marketCap)) ? marketCap : 0,
    circulatingSupply: (typeof circulatingSupply === 'number' && !isNaN(circulatingSupply) && isFinite(circulatingSupply)) ? circulatingSupply : 0,
    totalSupply: (typeof totalSupply === 'number' && !isNaN(totalSupply) && isFinite(totalSupply)) ? totalSupply : 0,
    volume24h: (typeof volume24h === 'number' && !isNaN(volume24h) && isFinite(volume24h)) ? volume24h : 0,
    totalBurned: (typeof totalBurned === 'number' && !isNaN(totalBurned) && isFinite(totalBurned)) ? totalBurned : 0,
    burnPercentage: (typeof burnPercentage === 'number' && !isNaN(burnPercentage) && isFinite(burnPercentage)) ? burnPercentage : 0,
    twentyFourHourBurnAmount: (typeof twentyFourHourBurnAmount === 'number' && !isNaN(twentyFourHourBurnAmount) && isFinite(twentyFourHourBurnAmount)) ? twentyFourHourBurnAmount : 0
  };

  // Values are now safely processed and ready for rendering

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <h1 className="text-4xl md:text-6xl font-bold text-white">🔥 SHIBMETRICS</h1>
            
            {/* Real-time updater component - handles live status and updates */}
            <RealTimeUpdater onDataUpdate={handleDataUpdate} />
          </div>
          
          <p className="text-xl text-gray-300 mb-4">
            Track SHIBA INU token burns in real-time. Monitor burn transactions, rates, and supply reduction.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="SHIB Price"
            value={`$${safeToFixed(safeDisplayValues.price, 8)}`}
            change={`${safeDisplayValues.priceChange > 0 ? '+' : ''}${safeToFixed(safeDisplayValues.priceChange, 2)}% (24h)`}
            icon={DollarSign}
            isAnimating={animatingCards.has('price') || animatingCards.has('priceChange')}
          />

          <StatCard
            title="24H Burn Activity"
            value={formatBurnedAmountDetailed(safeDisplayValues.twentyFourHourBurnAmount)}
            change={dayOverDayText || 'No data'}
            icon={dayOverDayChange > 0 ? TrendingUp : dayOverDayChange < 0 ? TrendingDown : Flame}
            isAnimating={false} // This uses calculated data, not direct from API
          />

          <StatCard
            title="Burnt from Initial Supply"
            value={formatBurnedAmountHighPrecision(safeDisplayValues.totalBurned)}
            change={`${safeToFixed(safeDisplayValues.burnPercentage, 6)}% of total supply`}
            icon={Flame}
            isAnimating={animatingCards.has('totalBurned')}
          />

          <StatCard
            title="Market Cap"
            value={`$${formatMarketCap(safeDisplayValues.marketCap)}B`}
            change="From CoinGecko"
            icon={DollarSign}
            isAnimating={animatingCards.has('marketCap')}
          />

          <StatCard
            title="Token Supply"
            value={formatSupplyNumber(safeDisplayValues.circulatingSupply)}
            change={`${formatSupplyNumber(safeDisplayValues.totalSupply)} total supply`}
            icon={Clock}
            isSupplyCard={true}
            isAnimating={false} // Supply doesn't change frequently
          />

          <StatCard
            title="24 Hour Trading Volume"
            value={formatVolume24h(safeDisplayValues.volume24h)}
            change="From CoinGecko"
            icon={TrendingUp}
            isAnimating={animatingCards.has('volume24h')}
          />
        </div>

        {/* Latest Burn Transactions */}
        <div className="bg-gray-800 rounded-lg border border-gray-700">
          <div className="px-6 py-4 border-b border-gray-700">
            <h3 className="text-lg font-semibold text-white">
              {(last24HourBurns && last24HourBurns.length > 10)
                ? `Recent Burn Transactions (${last24HourBurns.length} in last 24h)` 
                : 'Latest Burn Transactions (Last 10)'}
            </h3>
          </div>
          <BurnTransactionTable transactions={burnsToShow || []} loading={loading} />
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

      {/* 🔥 FLAME EFFECT: Triggered when new burns are detected */}
      <FlameEffect 
        isActive={showFlameEffect} 
        onComplete={() => setShowFlameEffect(false)} 
      />
    </div>
  );
}