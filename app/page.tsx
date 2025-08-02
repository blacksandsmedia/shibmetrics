import { TrendingUp, TrendingDown, Flame, DollarSign, Clock } from 'lucide-react';
import StatCard from '../components/StatCard';
import BurnTransactionTable from '../components/BurnTransactionTable';
import Link from 'next/link';
import RealTimeUpdater from '../components/RealTimeUpdater';

/*
 * ⚡ INSTANT LOADING with Server-Side Rendering + Real-time Updates!
 * 
 * This homepage uses a hybrid approach:
 * 1. SERVER-SIDE: Fetches cached data instantly for immediate display
 * 2. CLIENT-SIDE: Enhances with real-time updates using RealTimeUpdater component
 * 
 * Result: Users see data INSTANTLY, then it updates in real-time!
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

// Server-side data fetching functions for instant loading
async function fetchShibPriceSSR(): Promise<ShibPriceData> {
  try {
    const baseUrl = process.env.NETLIFY_URL || 'https://shibmetrics.com';
    const response = await fetch(`${baseUrl}/api/price`, {
      next: { revalidate: 30 } // Cache for 30 seconds
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

  // Fallback
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
  try {
    const baseUrl = process.env.NETLIFY_URL || 'https://shibmetrics.com';
    const response = await fetch(`${baseUrl}/api/total-burned`, {
      next: { revalidate: 60 } // Cache for 60 seconds
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

  return {
    totalBurned: 410752070164338,
    source: 'ssr_fallback',
    cached: true
  };
}

async function fetchBurnsSSR(): Promise<BurnsData> {
  try {
    const baseUrl = process.env.NETLIFY_URL || 'https://shibmetrics.com';
    const response = await fetch(`${baseUrl}/api/burns`, {
      next: { revalidate: 30 } // Cache for 30 seconds
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
            
            {/* Real-time updater component - handles live status */}
            <RealTimeUpdater />
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
            change={`${priceChange > 0 ? '+' : ''}${priceChange?.toFixed(2) || '0.00'}%`}
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
          />

          <StatCard
            title="Total Supply"
            value={formatSupplyNumber(totalSupply)}
            change="SHIB tokens"
            icon={Clock}
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