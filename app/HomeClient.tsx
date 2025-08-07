'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { TrendingUp, TrendingDown, Flame, DollarSign, Clock } from 'lucide-react';
import StatCard from '../components/StatCard';
import BurnTransactionTable from '../components/BurnTransactionTable';
import FlameEffect from '../components/FlameEffect';
import Link from 'next/link';
import RealTimeUpdater from '../components/RealTimeUpdater';

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

interface HomeClientProps {
  initialPriceData?: ShibPriceData | null;
  initialTotalBurnedData?: TotalBurnedData | null;
  initialBurnsData?: BurnsData | null;
}

// Helper function for safe number formatting
function safeToFixed(num: number, digits: number): string {
  if (typeof num !== 'number' || isNaN(num) || !isFinite(num)) {
    return '0.' + '0'.repeat(digits);
  }
  try {
    return num.toFixed(digits);
  } catch {
    return '0.' + '0'.repeat(digits);
  }
}

// Format burn amounts specifically - shows "<1" for very small amounts instead of "0.00"
function formatBurnAmount(num: number, decimals = 2): string {
  // Safety check for invalid inputs
  if (typeof num !== 'number' || isNaN(num) || !isFinite(num)) {
    return '0.' + '0'.repeat(decimals);
  }

  // Convert to millions
  const millions = num / 1_000_000;
  
  // If less than 1 million but greater than 0, show "<1"
  if (millions > 0 && millions < 1) {
    return '<1';
  }
  
  // For very large numbers, use scientific notation or abbreviations
  if (millions >= 1_000_000) { // 1 trillion+
    const trillions = millions / 1_000_000;
    return `${safeToFixed(trillions, 1)}T`;
  } else if (millions >= 1_000) { // 1 billion+
    const billions = millions / 1_000;
    return `${safeToFixed(billions, 1)}B`;
  }
  
  return safeToFixed(millions, decimals);
}

// Format 24h volume
function formatVolume24h(volume: number): string {
  const safeVolume = (typeof volume === 'number' && !isNaN(volume) && isFinite(volume)) ? volume : 0;

  return `$${safeToFixed(safeVolume, 2)}`;
}

export default function HomeClient({ 
  initialPriceData, 
  initialTotalBurnedData, 
  initialBurnsData 
}: HomeClientProps) {
  // State management with server-provided initial data (no zeros!)
  const [priceData, setPriceData] = useState<ShibPriceData>(() => {
    if (initialPriceData && initialPriceData.price > 0) {
      console.log('🚀 Using server-provided price data - no zeros!');
      return initialPriceData;
    }
    
    // Fallback to localStorage if server data unavailable
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem('shibmetrics_price_cache');
      if (cached) {
        try {
          const parsedCache = JSON.parse(cached);
          if (typeof parsedCache.price === 'number' && parsedCache.price > 0) {
            console.log('🗄️ Using localStorage fallback for price data');
            return parsedCache;
          }
        } catch {
          console.warn('Failed to parse cached price data');
        }
      }
    }
    
    // Last resort - but this should rarely happen now
    console.log('⚠️ No initial data available - using minimal defaults');
    return {
      price: 0, priceChange24h: 0, marketCap: 0,
      circulatingSupply: 0, totalSupply: 0, volume24h: 0,
      source: 'default', cached: false
    };
  });

  const [totalBurnedData, setTotalBurnedData] = useState<TotalBurnedData>(() => {
    if (initialTotalBurnedData && initialTotalBurnedData.totalBurned > 0) {
      console.log('🚀 Using server-provided total burned data - no zeros!');
      return initialTotalBurnedData;
    }
    
    // Fallback to localStorage
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem('shibmetrics_totalburned_cache');
      if (cached) {
        try {
          const parsedCache = JSON.parse(cached);
          if (typeof parsedCache.totalBurned === 'number' && parsedCache.totalBurned > 0) {
            console.log('🗄️ Using localStorage fallback for total burned data');
            return parsedCache;
          }
        } catch {
          console.warn('Failed to parse cached total burned data');
        }
      }
    }
    
    console.log('⚠️ No initial total burned data available');
    return { totalBurned: 0, source: 'default', cached: false };
  });

  const [burnsData, setBurnsData] = useState<BurnsData>(() => {
    if (initialBurnsData && initialBurnsData.transactions && initialBurnsData.transactions.length > 0) {
      console.log('🚀 Using server-provided burns data - no empty tables!');
      return initialBurnsData;
    }
    
    // Fallback to localStorage
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem('shibmetrics_burns_cache');
      if (cached) {
        try {
          const parsedCache = JSON.parse(cached);
          if (Array.isArray(parsedCache.transactions) && parsedCache.transactions.length > 0) {
            console.log('🗄️ Using localStorage fallback for burns data');
            return parsedCache;
          }
        } catch {
          console.warn('Failed to parse cached burns data');
        }
      }
    }
    
    console.log('⚠️ No initial burns data available');
    return { transactions: [], source: 'default', cached: false };
  });

  const [loading, setLoading] = useState(false); // No loading needed with server data
  const [showFlameEffect, setShowFlameEffect] = useState(false);
  const [, setPreviousTransactionHashes] = useState<Set<string>>(new Set());
  
  // Track if we're in initial data sync to prevent false flame effects
  const [isInitialDataSync, setIsInitialDataSync] = useState(() => {
    console.log('🚫 Initial data sync period started - flame effects disabled for 30 seconds');
    return true;
  });
  const initialSyncTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
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
      if (initialSyncTimeoutRef.current) {
        clearTimeout(initialSyncTimeoutRef.current);
      }
    };
  }, []);

  // End initial data sync period after 30 seconds
  useEffect(() => {
    initialSyncTimeoutRef.current = setTimeout(() => {
      setIsInitialDataSync(false);
      console.log('✅ Initial data sync period ended - flame effects now enabled');
    }, 30000);

    return () => {
      if (initialSyncTimeoutRef.current) {
        clearTimeout(initialSyncTimeoutRef.current);
      }
    };
  }, []);

  // Initialize transaction hashes tracking for flame effect
  const hasInitializedHashTracking = useRef(false);
  useEffect(() => {
    if (!hasInitializedHashTracking.current && burnsData.transactions.length > 0) {
      const initialHashes = new Set(burnsData.transactions.map(tx => tx.hash));
      setPreviousTransactionHashes(initialHashes);
      hasInitializedHashTracking.current = true;
      console.log('📝 Initialized hash tracking with', initialHashes.size, 'transactions');
    }
  }, [burnsData.transactions]);

  // Handle real-time updates from RealTimeUpdater
  const handleDataUpdate = useCallback((data: {
    priceData?: ShibPriceData;
    totalBurnedData?: TotalBurnedData;
    burnsData?: BurnsData;
  }) => {
    console.log('🔄 Real-time update received - SELECTIVE', {
      price: data.priceData?.price || 'not updated',
      marketCap: data.priceData?.marketCap || 'not updated',
      volume: data.priceData?.volume24h || 'not updated',
      totalBurned: data.totalBurnedData?.totalBurned || 'not updated',
      transactions: data.burnsData?.transactions?.length || 'not updated'
    });
    
    // Only animate if we actually received new data (RealTimeUpdater detected changes)
    const hasActualUpdates = !!(data.priceData || data.totalBurnedData || data.burnsData);
    
    if (!hasActualUpdates) {
      console.log('📊 No data updates received - skipping all processing');
      return;
    }

    console.log('🔄 Processing actual data updates:', {
      priceUpdated: !!data.priceData,
      totalBurnedUpdated: !!data.totalBurnedData, 
      burnsUpdated: !!data.burnsData
    });

    // Selective updates - only update data that's provided
    if (data.priceData) {
      setPriceData(data.priceData);
      if (typeof window !== 'undefined') {
        localStorage.setItem('shibmetrics_price_cache', JSON.stringify(data.priceData));
      }
    }
    
    if (data.totalBurnedData) {
      setTotalBurnedData(data.totalBurnedData);
      if (typeof window !== 'undefined') {
        localStorage.setItem('shibmetrics_totalburned_cache', JSON.stringify(data.totalBurnedData));
      }
    }
    
    if (data.burnsData) {
      setBurnsData(data.burnsData);
      if (typeof window !== 'undefined') {
        localStorage.setItem('shibmetrics_burns_cache', JSON.stringify(data.burnsData));
      }
    }

    // Animation logic - only for the specific cards that were updated
    const changedCards = new Set<string>();
    
    // Only animate cards that actually received new data
    if (data.priceData) {
      changedCards.add('price');
      changedCards.add('marketCap');
      changedCards.add('volume24h');
      changedCards.add('priceChange');
    }
    
    if (data.totalBurnedData) {
      changedCards.add('totalBurned');
    }
    
    // Only trigger animations if we have actual changes
    if (changedCards.size > 0) {
      console.log('🎬 Animating updated cards:', Array.from(changedCards));
      setAnimatingCards(changedCards);
      
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
      animationTimeoutRef.current = setTimeout(() => {
        setAnimatingCards(new Set());
        animationTimeoutRef.current = null;
      }, 2000);
    }
  }, [isInitialDataSync, priceData, totalBurnedData]);

  // Calculate metrics from data
  const burns = Array.isArray(burnsData?.transactions) ? burnsData.transactions : [];
  const totalBurned = (totalBurnedData?.totalBurned != null && typeof totalBurnedData.totalBurned === 'number' && !isNaN(totalBurnedData.totalBurned) && isFinite(totalBurnedData.totalBurned)) ? totalBurnedData.totalBurned : 0;
  const priceChange = (priceData?.priceChange24h != null && typeof priceData.priceChange24h === 'number' && !isNaN(priceData.priceChange24h) && isFinite(priceData.priceChange24h)) ? priceData.priceChange24h : 0;
  const marketCap = (priceData?.marketCap != null && typeof priceData.marketCap === 'number' && !isNaN(priceData.marketCap) && isFinite(priceData.marketCap)) ? priceData.marketCap : 0;
  const volume24h = (priceData?.volume24h != null && typeof priceData.volume24h === 'number' && !isNaN(priceData.volume24h) && isFinite(priceData.volume24h)) ? priceData.volume24h : 0;
  const currentPrice = (priceData?.price != null && typeof priceData.price === 'number' && !isNaN(priceData.price) && isFinite(priceData.price)) ? priceData.price : 0;
  
  // Calculate 24H burn activity
  const now = Date.now();
  const twentyFourHoursAgo = now - (24 * 60 * 60 * 1000);
  
  const last24HourBurns = burns.filter((tx: BurnTransaction) => {
    const txTime = parseInt(tx.timeStamp) * 1000;
    return txTime >= twentyFourHoursAgo;
  });
  
  const total24HBurnAmount = last24HourBurns.reduce((sum: number, tx: BurnTransaction) => {
    const amount = parseFloat(tx.value) / Math.pow(10, 18);
    return sum + amount;
  }, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Flame className="h-12 w-12 text-orange-500" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
              SHIB Metrics
            </h1>
          </div>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Real-time tracking of SHIB burns, price movements, and market metrics. 
            Watch as tokens are permanently removed from circulation.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <StatCard
            title="SHIB Price"
            value={`$${safeToFixed(currentPrice, 10)}`}
            icon={<DollarSign className="h-6 w-6" />}
            trend={priceChange > 0 ? 'up' : priceChange < 0 ? 'down' : 'neutral'}
            trendValue={`${priceChange > 0 ? '+' : ''}${safeToFixed(priceChange, 2)}%`}
            isAnimating={animatingCards.has('price')}
          />
          
          <StatCard
            title="Market Cap"
            value={`$${(marketCap / 1_000_000_000).toFixed(2)}B`}
            icon={<TrendingUp className="h-6 w-6" />}
            trend="neutral"
            trendValue="Live"
            isAnimating={animatingCards.has('marketCap')}
          />
          
          <StatCard
            title="24H Volume"
            value={formatVolume24h(volume24h)}
            icon={<Clock className="h-6 w-6" />}
            trend="neutral"
            trendValue="Trading"
            isAnimating={animatingCards.has('volume24h')}
          />
          
          <StatCard
            title="Total Burned"
            value={`${formatBurnAmount(totalBurned)}M SHIB`}
            icon={<Flame className="h-6 w-6" />}
            trend="up"
            trendValue="Deflationary"
            isAnimating={animatingCards.has('totalBurned')}
          />
        </div>

        {/* 24H Burn Activity */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 mb-8 border border-gray-700/50">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <Flame className="h-6 w-6 text-orange-500" />
            24H Burn Activity
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-gray-400 mb-2">Tokens Burned (24H)</p>
              <p className="text-3xl font-bold text-orange-400">
                {formatBurnAmount(total24HBurnAmount)}M SHIB
              </p>
            </div>
            <div>
              <p className="text-gray-400 mb-2">Burn Transactions (24H)</p>
              <p className="text-3xl font-bold text-blue-400">
                {last24HourBurns.length}
              </p>
            </div>
          </div>
        </div>

        {/* Recent Burns Table */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Flame className="h-6 w-6 text-orange-500" />
            Recent Burn Transactions
          </h2>
          <BurnTransactionTable transactions={burns.slice(0, 10)} />
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Link
            href="/history"
            className="inline-flex items-center px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-colors shadow-lg"
          >
            <Flame className="h-5 w-5 mr-2" />
            View Complete Burn History
          </Link>
        </div>
      </div>

      {/* Flame Effect */}
      {showFlameEffect && (
        <FlameEffect 
          isActive={showFlameEffect} 
          onComplete={() => setShowFlameEffect(false)} 
        />
      )}

      {/* Real-time Updater */}
      <RealTimeUpdater onDataUpdate={handleDataUpdate} />
    </div>
  );
}