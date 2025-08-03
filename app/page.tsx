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
        return data;
      }
    }
  } catch (error) {
    console.warn('⚠️ Client price API failed:', error);
  }

  // Fallback
  return {
    price: 0.00001200,
    priceChange24h: 0.00,
    marketCap: 7200000000,
    circulatingSupply: 589000000000000,
    totalSupply: 999982000000000,
    source: 'client_fallback',
    cached: true
  };
}

async function fetchTotalBurnedClient(): Promise<TotalBurnedData> {
  try {
    const response = await fetch('/api/total-burned', { cache: 'no-cache' });
    
    if (response.ok) {
      const data = await response.json();
      if (!data.error && data.totalBurned) {
        console.log('🔥 Total burned fetched from client');
        return data;
      }
    }
  } catch (error) {
    console.warn('⚠️ Client total burned API failed:', error);
  }

  return {
    totalBurned: 410500000000000, // Updated to use only the 3 official burn addresses
    source: 'client_fallback',
    cached: true
  };
}

async function fetchBurnsClient(): Promise<BurnsData> {
  try {
    const response = await fetch('/api/burns', { cache: 'no-cache' });
    
    if (response.ok) {
      const data = await response.json();
      if (!data.error && data.transactions && Array.isArray(data.transactions)) {
        console.log('🔥 Burns fetched from client');
        return data;
      }
    }
  } catch (error) {
    console.warn('⚠️ Client burns API failed:', error);
  }

  return {
    transactions: [{
      hash: '0x0000000000000000000000000000000000000000000000000000000000000000',
      from: '0x0000000000000000000000000000000000000000',
      to: '0xdead000000000000000042069420694206942069',
      value: '1000000000000000000000000', // 1M SHIB
      timeStamp: String(Math.floor(Date.now() / 1000) - 3600), // 1 hour ago
      blockNumber: '0'
    }],
    source: 'client_fallback',
    cached: true
  };
}

// ⚡ FIXED: Client Component with Real-time Updates!
export default function Home() {
  // State management for real-time updates
  const [priceData, setPriceData] = useState<ShibPriceData>({
    price: 0.00001200, priceChange24h: 0.00, marketCap: 7200000000,
    circulatingSupply: 589000000000000, totalSupply: 999982000000000,
    source: 'initial', cached: true
  });
  const [totalBurnedData, setTotalBurnedData] = useState<TotalBurnedData>({
    totalBurned: 410500000000000, source: 'initial', cached: true
  });
  const [burnsData, setBurnsData] = useState<BurnsData>({
    transactions: [], source: 'initial', cached: true
  });
  const [loading, setLoading] = useState(true);

  // Initial data fetch on component mount
  useEffect(() => {
    console.log('🚀 Client: Fetching initial data...');
    
    const fetchInitialData = async () => {
      try {
        const [priceResult, totalBurnedResult, burnsResult] = await Promise.all([
          fetchShibPriceClient(),
          fetchTotalBurnedClient(), 
          fetchBurnsClient()
        ]);
        
        setPriceData(priceResult);
        setTotalBurnedData(totalBurnedResult);
        setBurnsData(burnsResult);
        
        console.log('🚀 Client: Initial data loaded!', {
          priceSource: priceResult.source,
          totalBurnedSource: totalBurnedResult.source,
          burnsSource: burnsResult.source,
          burnsCount: burnsResult.transactions.length
        });
      } catch (error) {
        console.error('❌ Error fetching initial data:', error);
      } finally {
        setLoading(false);
      }
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
    setPriceData(data.priceData);
    setTotalBurnedData(data.totalBurnedData);
    setBurnsData(data.burnsData);
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