'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Flame, DollarSign, Clock } from 'lucide-react';
import StatCard from '../components/StatCard';
import BurnTransactionTable from '../components/BurnTransactionTable';
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

// Format large numbers for display
function formatNumber(num: number): string {
  if (num >= 1e12) return (num / 1e12).toFixed(2) + 'T';
  if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
  return num.toFixed(2);
}

function formatBurnedAmountHighPrecision(amount: number): string {
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
  if (amount >= 1e12) return (amount / 1e12).toFixed(4) + 'T';
  if (amount >= 1e9) return (amount / 1e9).toFixed(4) + 'B';
  if (amount >= 1e6) return (amount / 1e6).toFixed(4) + 'M';
  if (amount >= 1e3) return (amount / 1e3).toFixed(4) + 'K';
  return amount.toFixed(4);
}

function formatSupplyNumber(supply: number): string {
  return Math.floor(supply).toLocaleString('en-US');
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
        return { ...parsedCache, source: 'cached_fallback' };
      } catch (e) {
        console.warn('Failed to parse cached price data');
      }
    }
  }

  // Minimal fallback if no cache available
  throw new Error('No price data available');
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
        return { ...parsedCache, source: 'cached_fallback' };
      } catch (e) {
        console.warn('Failed to parse cached total burned data');
      }
    }
  }

  // Minimal fallback if no cache available
  throw new Error('No total burned data available');
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
        return { ...parsedCache, source: 'cached_fallback' };
      } catch (e) {
        console.warn('Failed to parse cached burns data');
      }
    }
  }

  // Minimal fallback if no cache available
  throw new Error('No burns data available');
}

// ⚡ FIXED: Client Component with Real-time Updates!
export default function Home() {
  // State management for real-time updates
  const [priceData, setPriceData] = useState<ShibPriceData>(() => {
    // Load from localStorage if available, otherwise minimal initial state
    const cached = typeof window !== 'undefined' ? localStorage.getItem('shibmetrics_price_cache') : null;
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        console.warn('Failed to parse cached price data');
      }
    }
    return {
      price: 0, priceChange24h: 0, marketCap: 0,
      circulatingSupply: 0, totalSupply: 0,
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
          console.warn('⚠️ Price data unavailable:', error.message);
        }
      };

      const fetchTotalBurned = async () => {
        try {
          const result = await fetchTotalBurnedClient();
          setTotalBurnedData(result);
          console.log('🔥 Total burned data loaded:', result.source);
        } catch (error) {
          console.warn('⚠️ Total burned data unavailable:', error.message);
        }
      };

      const fetchBurns = async () => {
        try {
          const result = await fetchBurnsClient();
          setBurnsData(result);
          console.log('📊 Burns data loaded:', result.source, `(${result.transactions.length} transactions)`);
        } catch (error) {
          console.warn('⚠️ Burns data unavailable:', error.message);
        }
      };

      // Fetch all APIs independently
      await Promise.all([fetchPrice(), fetchTotalBurned(), fetchBurns()]);
      setLoading(false);
      console.log('🚀 Client: Initial data fetch complete');
    };

    fetchInitialData();
  }, []);

  // Handle real-time updates from RealTimeUpdater
  const handleDataUpdate = (data: {
    priceData: ShibPriceData;
    totalBurnedData: TotalBurnedData;
    burnsData: BurnsData;
  }) => {
    console.log('🔄 Real-time update received - deployment v2');
    
    // Update state and cache the new data
    setPriceData(data.priceData);
    setTotalBurnedData(data.totalBurnedData);
    setBurnsData(data.burnsData);
    
    // Cache the fresh data in localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('shibmetrics_price_cache', JSON.stringify(data.priceData));
      localStorage.setItem('shibmetrics_totalburned_cache', JSON.stringify(data.totalBurnedData));
      localStorage.setItem('shibmetrics_burns_cache', JSON.stringify(data.burnsData));
    }
  };
  
  // Calculate all metrics from server-side data for instant display
  const burns = burnsData.transactions;
  const totalBurned = totalBurnedData.totalBurned;
  const priceChange = priceData.priceChange24h;
  const marketCap = priceData.marketCap;
  const circulatingSupply = priceData.circulatingSupply;
  const totalSupply = priceData.totalSupply;
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
      formattedChange = `${Math.round(dayOverDayChange).toLocaleString()}`;
    } else if (Math.abs(dayOverDayChange) >= 100) {
      formattedChange = dayOverDayChange.toFixed(1);
    } else {
      formattedChange = dayOverDayChange.toFixed(1);
    }
    
    dayOverDayText = `${sign}${formattedChange}% vs yesterday`;
  } else if (twentyFourHourBurnAmount > 0) {
    dayOverDayText = '🚀 New activity today';
  }
  
  // Additional calculations can be added here if needed

  // Calculate burn percentage
  const totalSupplyOriginal = 1000000000000000; // Original total supply: 1 quadrillion SHIB
  const burnPercentage = (totalBurned / totalSupplyOriginal) * 100;

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
            value={`$${priceData.price?.toFixed(8) || '0.00000000'}`}
            change={`${priceChange > 0 ? '+' : ''}${priceChange?.toFixed(2) || '0.00'}% (24h)`}
            icon={DollarSign}
          />

          <StatCard
            title="24H Burn Activity"
            value={formatBurnedAmountDetailed(twentyFourHourBurnAmount)}
            change={dayOverDayText}
            icon={dayOverDayChange > 0 ? TrendingUp : dayOverDayChange < 0 ? TrendingDown : Flame}
          />

          <StatCard
            title="Burnt from Initial Supply"
            value={formatBurnedAmountHighPrecision(totalBurned)}
            change={`${burnPercentage.toFixed(6)}% of total supply`}
            icon={Flame}
          />

          <StatCard
            title="Market Cap"
            value={`$${formatMarketCap(marketCap)}B`}
            change="From CoinGecko"
            icon={DollarSign}
          />

          <StatCard
            title="Circulating Supply"
            value={formatSupplyNumber(circulatingSupply)}
            change="SHIB tokens"
            icon={Clock}
            isSupplyCard={true}
          />

          <StatCard
            title="Total Supply"
            value={formatSupplyNumber(totalSupply)}
            change="SHIB tokens"
            icon={Clock}
            isSupplyCard={true}
          />
        </div>

        {/* Latest Burn Transactions */}
        <div className="bg-gray-800 rounded-lg border border-gray-700">
          <div className="px-6 py-4 border-b border-gray-700">
            <h3 className="text-lg font-semibold text-white">
              {last24HourBurns.length > 10 
                ? `Recent Burn Transactions (${last24HourBurns.length} in last 24h)` 
                : 'Latest Burn Transactions (Last 10)'}
            </h3>
          </div>
          <BurnTransactionTable transactions={burnsToShow} loading={loading} />
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