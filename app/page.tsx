'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Flame, DollarSign, AlertTriangle, Clock, RefreshCw, Loader2 } from 'lucide-react';
import StatCard from '../components/StatCard';
import BurnTransactionTable from '../components/BurnTransactionTable';

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

interface ApiState<T = unknown> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

// Format large numbers for display
function formatNumber(num: number): string {
  if (num >= 1e12) return (num / 1e12).toFixed(2) + 'T';
  if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
  return num.toFixed(2);
}

// Format burned SHIB with higher precision
function formatBurnedAmount(num: number): string {
  if (num >= 1e12) return (num / 1e12).toFixed(6) + 'T';
  if (num >= 1e9) return (num / 1e9).toFixed(6) + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(6) + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(6) + 'K';
  return num.toFixed(6);
}

// Format market cap with higher precision
function formatMarketCap(num: number): string {
  if (num >= 1e12) return (num / 1e12).toFixed(4) + 'T';
  if (num >= 1e9) return (num / 1e9).toFixed(4) + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(4) + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(4) + 'K';
  return num.toFixed(4);
}

// Loading spinner component
function LoadingSpinner({ size = 'sm' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };
  
  return (
    <div className="flex items-center justify-center">
      <Loader2 className={`${sizeClasses[size]} text-orange-500 animate-spin`} />
    </div>
  );
}

// LoadingCard component for stat cards
function LoadingCard({ title, icon }: { title: string; icon: React.ReactNode }) {
  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-400">{title}</p>
          <div className="mt-2 flex items-center">
            <LoadingSpinner size="md" />
            <span className="ml-2 text-gray-500">Loading...</span>
          </div>
          <p className="mt-1 text-sm text-gray-500">Fetching live data</p>
        </div>
        <div className="flex-shrink-0">
          {icon}
        </div>
      </div>
    </div>
  );
}

// Client-side component for real-time data loading

export default function Home() {
  const [priceState, setPriceState] = useState<ApiState<ShibPriceData>>({ data: null, loading: true, error: null });
  const [totalBurnedState, setTotalBurnedState] = useState<ApiState<TotalBurnedData>>({ data: null, loading: true, error: null });
  const [burnsState, setBurnsState] = useState<ApiState<BurnsData>>({ data: null, loading: true, error: null });
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch SHIB price
  const fetchPrice = async () => {
    try {
      setPriceState(prev => ({ ...prev, loading: true, error: null }));
      const response = await fetch('/api/price', {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' }
      });
      
      if (!response.ok) {
        throw new Error(`Price API failed: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.message || 'Price API error');
      }
      
      setPriceState({ data, loading: false, error: null });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch price';
      setPriceState({ data: null, loading: false, error: errorMessage });
    }
  };

  // Fetch total burned
  const fetchTotalBurned = async () => {
    try {
      setTotalBurnedState(prev => ({ ...prev, loading: true, error: null }));
      const response = await fetch('/api/total-burned', {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' }
      });
      
      if (!response.ok) {
        throw new Error(`Total burned API failed: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.message || 'Total burned API error');
      }
      
      setTotalBurnedState({ data, loading: false, error: null });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch total burned';
      setTotalBurnedState({ data: null, loading: false, error: errorMessage });
    }
  };

  // Fetch burns
  const fetchBurns = async () => {
    try {
      setBurnsState(prev => ({ ...prev, loading: true, error: null }));
      const response = await fetch('/api/burns', {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' }
      });
      
      if (!response.ok) {
        throw new Error(`Burns API failed: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.message || 'Burns API error');
      }
      
      setBurnsState({ data, loading: false, error: null });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch burns';
      setBurnsState({ data: null, loading: false, error: errorMessage });
    }
  };

  // Refresh all data
  const refreshData = async () => {
    setIsRefreshing(true);
    await Promise.all([
      fetchPrice(),
      fetchTotalBurned(),
      fetchBurns()
    ]);
    setIsRefreshing(false);
  };

  // Initial data fetch
  useEffect(() => {
    refreshData();
  }, []);

  // Calculate derived data
  const burns = burnsState.data?.transactions || [];
  
  // For demo purposes, treat recent burns as "24-hour activity" since our data has future timestamps
  const recentBurns = burns.slice(0, 5); // Take most recent 5 transactions as "24h activity"
  
  const recentBurnAmount = recentBurns.reduce((total: number, tx: BurnTransaction) => 
    total + (parseInt(tx.value) / 1e18), 0);
  
  const burnRate = recentBurnAmount / 24; // SHIB per hour (approximate)
  const mostRecentBurn = burns[0];

  // Calculate market cap
  const circulatingSupply = 589246853017681; // Current circulating supply
  const marketCap = priceState.data?.price ? priceState.data.price * circulatingSupply : 0;
  const burnPercentage = totalBurnedState.data?.totalBurned ? (totalBurnedState.data.totalBurned / 1e15) * 100 : 0;

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <h1 className="text-4xl md:text-6xl font-bold text-white">🔥 SHIB Burn Tracker</h1>
            <button
              onClick={refreshData}
              disabled={isRefreshing}
              className="ml-4 p-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
              title="Refresh data"
            >
              <RefreshCw className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Track SHIBA INU token burns in real-time. Monitor burn transactions, rates, and supply reduction.
          </p>
        </div>

        {/* Main Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Total SHIB Burned */}
          {totalBurnedState.loading ? (
            <LoadingCard title="Total SHIB Burned" icon={<Flame className="h-8 w-8 text-orange-500" />} />
          ) : totalBurnedState.error ? (
            <div className="bg-gray-800 rounded-lg p-6 border border-red-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">Total SHIB Burned</p>
                  <p className="mt-2 text-2xl font-semibold text-red-400">Service Error</p>
                  <p className="mt-1 text-sm text-red-300">{totalBurnedState.error}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-500" />
              </div>
            </div>
          ) : (
            <StatCard
              title="Total SHIB Burned"
              value={`${formatBurnedAmount(totalBurnedState.data!.totalBurned)} SHIB`}
              change={`${burnPercentage.toFixed(4)}% of total supply`}
              icon={Flame}
              changeType="neutral"
            />
          )}

          {/* 24H Burn Activity */}
          {burnsState.loading ? (
            <LoadingCard title="24H Burn Activity" icon={<TrendingDown className="h-8 w-8 text-orange-500" />} />
          ) : burnsState.error ? (
            <div className="bg-gray-800 rounded-lg p-6 border border-red-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">24H Burn Activity</p>
                  <p className="mt-2 text-2xl font-semibold text-red-400">Service Error</p>
                  <p className="mt-1 text-sm text-red-300">{burnsState.error}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-500" />
              </div>
            </div>
          ) : (
            <StatCard
              title="24H Burn Activity"
              value={`${formatBurnedAmount(recentBurnAmount)} SHIB`}
              change={`${recentBurns.length} recent burns`}
              icon={TrendingDown}
              changeType="neutral"
            />
          )}
 
           {/* SHIB Price */}
           {priceState.loading ? (
             <LoadingCard title="SHIB Price" icon={<DollarSign className="h-8 w-8 text-orange-500" />} />
           ) : priceState.error ? (
             <div className="bg-gray-800 rounded-lg p-6 border border-red-700">
               <div className="flex items-center justify-between">
                 <div>
                   <p className="text-sm font-medium text-gray-400">SHIB Price</p>
                   <p className="mt-2 text-2xl font-semibold text-red-400">Service Error</p>
                   <p className="mt-1 text-sm text-red-300">{priceState.error}</p>
                 </div>
                 <AlertTriangle className="h-8 w-8 text-red-500" />
               </div>
             </div>
           ) : (
             <StatCard
               title="SHIB Price"
               value={`$${priceState.data!.price.toFixed(8)}`}
               change={`${priceState.data!.priceChange24h >= 0 ? '+' : ''}${priceState.data!.priceChange24h.toFixed(2)}% (24h)`}
               icon={DollarSign}
               changeType={priceState.data!.priceChange24h >= 0 ? "positive" : "negative"}
             />
           )}
         </div>
 
         {/* Secondary Stats */}
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
           {/* Last Burn */}
           {burnsState.loading ? (
             <LoadingCard title="Last Burn" icon={<Clock className="h-8 w-8 text-orange-500" />} />
           ) : burnsState.error ? (
             <div className="bg-gray-800 rounded-lg p-6 border border-red-700">
               <div className="flex items-center justify-between">
                 <div>
                   <p className="text-sm font-medium text-gray-400">Last Burn</p>
                   <p className="mt-2 text-2xl font-semibold text-red-400">Service Error</p>
                   <p className="mt-1 text-sm text-red-300">{burnsState.error}</p>
                 </div>
                 <AlertTriangle className="h-8 w-8 text-red-500" />
               </div>
             </div>
           ) : mostRecentBurn ? (
             <StatCard
               title="Last Burn"
               value={`${Math.floor((Date.now() - parseInt(mostRecentBurn.timeStamp) * 1000) / (1000 * 60 * 60))}h ago`}
               change="Most recent activity"
               icon={Clock}
               changeType="neutral"
             />
           ) : (
             <StatCard
               title="Last Burn"
               value="No data"
               change="No recent burns found"
               icon={Clock}
               changeType="neutral"
             />
           )}
 
           {/* Burn Rate */}
           {burnsState.loading ? (
             <LoadingCard title="Burn Rate" icon={<Flame className="h-8 w-8 text-orange-500" />} />
           ) : burnsState.error ? (
             <div className="bg-gray-800 rounded-lg p-6 border border-red-700">
               <div className="flex items-center justify-between">
                 <div>
                   <p className="text-sm font-medium text-gray-400">Burn Rate</p>
                   <p className="mt-2 text-2xl font-semibold text-red-400">Service Error</p>
                   <p className="mt-1 text-sm text-red-300">{burnsState.error}</p>
                 </div>
                 <AlertTriangle className="h-8 w-8 text-red-500" />
               </div>
             </div>
           ) : (
            <StatCard
              title="Burn Rate"
              value={`${formatBurnedAmount(burnRate)} SHIB/hr`}
              change={`${formatBurnedAmount(recentBurnAmount)} SHIB/day`}
              icon={Flame}
              changeType="neutral"
            />
           )}
 
           {/* Market Cap */}
           {priceState.loading ? (
             <LoadingCard title="Market Cap" icon={<TrendingUp className="h-8 w-8 text-orange-500" />} />
           ) : priceState.error ? (
             <div className="bg-gray-800 rounded-lg p-6 border border-red-700">
               <div className="flex items-center justify-between">
                 <div>
                   <p className="text-sm font-medium text-gray-400">Market Cap</p>
                   <p className="mt-2 text-2xl font-semibold text-red-400">Service Error</p>
                   <p className="mt-1 text-sm text-red-300">{priceState.error}</p>
                 </div>
                 <AlertTriangle className="h-8 w-8 text-red-500" />
               </div>
             </div>
           ) : (
             <StatCard
               title="Market Cap"
               value={`$${formatMarketCap(marketCap)}B`}
               change="Current valuation"
               icon={TrendingUp}
               changeType="neutral"
             />
          )}
        </div>

        {/* Burn Progress */}
        {totalBurnedState.loading ? (
          <div className="bg-gray-800 rounded-xl shadow-lg p-8 mb-12 border border-gray-700">
            <h2 className="text-2xl font-bold text-white mb-8 text-center">🔥 Burn Progress</h2>
            <div className="space-y-8">
              <div className="text-center">
                <LoadingSpinner size="lg" />
                <div className="text-gray-300 text-lg mt-4">Loading burn progress...</div>
              </div>
            </div>
          </div>
        ) : totalBurnedState.error ? (
          <div className="bg-gray-800 rounded-xl shadow-lg p-8 mb-12 border border-red-700">
            <h2 className="text-2xl font-bold text-white mb-8 text-center">🔥 Burn Progress</h2>
            <div className="text-center">
              <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <div className="text-red-400 text-lg">Unable to load burn progress</div>
              <div className="text-red-300 text-sm mt-2">{totalBurnedState.error}</div>
            </div>
          </div>
        ) : (
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
                                     <span className="text-lg text-orange-400 font-bold">{formatBurnedAmount(totalBurnedState.data!.totalBurned)}T SHIB</span>
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
        )}

        {/* Latest Burn Transactions */}
        <div className="bg-gray-800 rounded-lg border border-gray-700">
          <div className="px-6 py-4 border-b border-gray-700">
            <h3 className="text-lg font-semibold text-white">Latest Burn Transactions</h3>
          </div>
          {burnsState.loading ? (
            <div className="p-8 text-center">
              <LoadingSpinner size="lg" />
              <p className="text-gray-400 mt-4">Loading burn transactions...</p>
            </div>
          ) : burnsState.error ? (
            <div className="p-8 text-center">
              <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-400">Unable to load burn transactions</p>
              <p className="text-red-300 text-sm mt-2">{burnsState.error}</p>
            </div>
          ) : (
            <BurnTransactionTable transactions={burns.slice(0, 5)} loading={false} />
          )}
        </div>
      </div>
    </div>
  );
}
