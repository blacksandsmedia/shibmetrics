import { TrendingUp, TrendingDown, Flame, DollarSign, AlertTriangle, Clock } from 'lucide-react';
import StatCard from '../components/StatCard';
import BurnTransactionTable from '../components/BurnTransactionTable';
import RefreshButton from '../components/RefreshButton';
import { formatTimeAgo } from '../lib/api';

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

function formatMarketCap(marketCap: number): string {
  return (marketCap / 1e9).toFixed(2); // Convert to billions
}

// Server-side data fetching functions
async function fetchShibPrice(): Promise<ShibPriceData | null> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'https://shibmetrics.com'}/api/price`, {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache' }
    });
    
    if (!response.ok) return null;
    const data = await response.json();
    return data.error ? null : data;
  } catch (error) {
    console.error('Failed to fetch price:', error);
    return null;
  }
}

async function fetchTotalBurned(): Promise<TotalBurnedData | null> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'https://shibmetrics.com'}/api/total-burned`, {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache' }
    });
    
    if (!response.ok) return null;
    const data = await response.json();
    return data.error ? null : data;
  } catch (error) {
    console.error('Failed to fetch total burned:', error);
    return null;
  }
}

async function fetchBurns(): Promise<BurnsData | null> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'https://shibmetrics.com'}/api/burns`, {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache' }
    });
    
    if (!response.ok) return null;
    const data = await response.json();
    return data.error ? null : data;
  } catch (error) {
    console.error('Failed to fetch burns:', error);
    return null;
  }
}

// Server-side component - no loading states needed!
export default async function Home() {
  // Fetch all data on the server
  const [priceData, totalBurnedData, burnsData] = await Promise.all([
    fetchShibPrice(),
    fetchTotalBurned(),
    fetchBurns()
  ]);

  // Calculate derived data
  const burns = burnsData?.transactions || [];
  
  // Calculate burns to display: either last 10 OR all burns in last 24 hours (whichever is greater)
  const now = Date.now();
  const twentyFourHoursAgo = now - (24 * 60 * 60 * 1000);
  
  // Filter burns from last 24 hours
  const last24HourBurns = burns.filter(tx => {
    const txTime = parseInt(tx.timeStamp) * 1000;
    return txTime >= twentyFourHoursAgo;
  });
  
  // Show either last 10 burns or all 24h burns (whichever is greater)
  const burnsToShow = last24HourBurns.length > 10 ? last24HourBurns : burns.slice(0, 10);
  
  // Calculate 24H burn activity from actual 24H burns
  const twentyFourHourBurnAmount = last24HourBurns.reduce((total: number, tx: BurnTransaction) => 
    total + (parseInt(tx.value) / 1e18), 0);
  
  const burnRate = twentyFourHourBurnAmount / 24; // SHIB per hour
  const mostRecentBurn = burns[0];

  // Calculate proper time since last burn
  const timeSinceLastBurn = mostRecentBurn ? 
    formatTimeAgo(mostRecentBurn.timeStamp) : 'Unknown';

  // Calculate market cap and burn percentage
  const circulatingSupply = 589246853017681; // Current circulating supply
  const totalSupply = 1000000000000000; // Original total supply: 1 quadrillion SHIB
  const marketCap = priceData?.price ? priceData.price * circulatingSupply : 0;
  const burnPercentage = totalBurnedData?.totalBurned ? (totalBurnedData.totalBurned / totalSupply) * 100 : 0;

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <h1 className="text-4xl md:text-6xl font-bold text-white">🔥 SHIB Burn Tracker</h1>
            <RefreshButton />
          </div>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Track SHIBA INU token burns in real-time. Monitor burn transactions, rates, and supply reduction.
          </p>
        </div>

        {/* Main Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Total SHIB Burned */}
          {totalBurnedData ? (
            <StatCard
              title="Total SHIB Burned"
              value={`${formatBurnedAmount(totalBurnedData.totalBurned)} SHIB`}
              change={`${burnPercentage.toFixed(4)}% of total supply`}
              icon={Flame}
              changeType="neutral"
            />
          ) : (
            <div className="bg-gray-800 rounded-lg p-6 border border-red-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">Total SHIB Burned</p>
                  <p className="mt-2 text-2xl font-semibold text-red-400">Service Error</p>
                  <p className="mt-1 text-sm text-red-300">Unable to load data</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-500" />
              </div>
            </div>
          )}

          {/* 24H Burn Activity */}
          {burnsData ? (
            <StatCard
              title="24H Burn Activity"
              value={`${formatBurnedAmount(twentyFourHourBurnAmount)} SHIB`}
              change={`${last24HourBurns.length} recent burns`}
              icon={TrendingDown}
              changeType="neutral"
            />
          ) : (
            <div className="bg-gray-800 rounded-lg p-6 border border-red-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">24H Burn Activity</p>
                  <p className="mt-2 text-2xl font-semibold text-red-400">Service Error</p>
                  <p className="mt-1 text-sm text-red-300">Unable to load data</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-500" />
              </div>
            </div>
          )}
 
           {/* SHIB Price */}
           {priceData ? (
             <StatCard
               title="SHIB Price"
               value={`$${priceData.price.toFixed(8)}`}
               change={`${priceData.priceChange24h >= 0 ? '+' : ''}${priceData.priceChange24h.toFixed(2)}% (24h)`}
               icon={DollarSign}
               changeType={priceData.priceChange24h >= 0 ? "positive" : "negative"}
             />
           ) : (
             <div className="bg-gray-800 rounded-lg p-6 border border-red-700">
               <div className="flex items-center justify-between">
                 <div>
                   <p className="text-sm font-medium text-gray-400">SHIB Price</p>
                   <p className="mt-2 text-2xl font-semibold text-red-400">Service Error</p>
                   <p className="mt-1 text-sm text-red-300">Unable to load data</p>
                 </div>
                 <AlertTriangle className="h-8 w-8 text-red-500" />
               </div>
             </div>
           )}
         </div>
 
         {/* Secondary Stats */}
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
           {/* Last Burn */}
           {burnsData && mostRecentBurn ? (
             <StatCard
               title="Last Burn"
               value={`${timeSinceLastBurn}`}
               change="Most recent activity"
               icon={Clock}
               changeType="neutral"
             />
           ) : (
             <div className="bg-gray-800 rounded-lg p-6 border border-red-700">
               <div className="flex items-center justify-between">
                 <div>
                   <p className="text-sm font-medium text-gray-400">Last Burn</p>
                   <p className="mt-2 text-2xl font-semibold text-red-400">Service Error</p>
                   <p className="mt-1 text-sm text-red-300">Unable to load data</p>
                 </div>
                 <AlertTriangle className="h-8 w-8 text-red-500" />
               </div>
             </div>
           )}
 
           {/* Burn Rate */}
           {burnsData ? (
            <StatCard
              title="Burn Rate"
              value={`${formatBurnedAmount(burnRate)} SHIB/hr`}
              change={`${formatBurnedAmount(twentyFourHourBurnAmount)} SHIB/day`}
              icon={Flame}
              changeType="neutral"
            />
           ) : (
             <div className="bg-gray-800 rounded-lg p-6 border border-red-700">
               <div className="flex items-center justify-between">
                 <div>
                   <p className="text-sm font-medium text-gray-400">Burn Rate</p>
                   <p className="mt-2 text-2xl font-semibold text-red-400">Service Error</p>
                   <p className="mt-1 text-sm text-red-300">Unable to load data</p>
                 </div>
                 <AlertTriangle className="h-8 w-8 text-red-500" />
               </div>
             </div>
           )}
 
           {/* Market Cap */}
           {priceData ? (
             <StatCard
               title="Market Cap"
               value={`$${formatMarketCap(marketCap)}B`}
               change="Current valuation"
               icon={TrendingUp}
               changeType="neutral"
             />
          ) : (
             <div className="bg-gray-800 rounded-lg p-6 border border-red-700">
               <div className="flex items-center justify-between">
                 <div>
                   <p className="text-sm font-medium text-gray-400">Market Cap</p>
                   <p className="mt-2 text-2xl font-semibold text-red-400">Service Error</p>
                   <p className="mt-1 text-sm text-red-300">Unable to load data</p>
                 </div>
                 <AlertTriangle className="h-8 w-8 text-red-500" />
               </div>
             </div>
          )}
        </div>

        {/* Burn Progress */}
        {totalBurnedData ? (
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
        ) : (
          <div className="bg-gray-800 rounded-xl shadow-lg p-8 mb-12 border border-red-700">
            <h2 className="text-2xl font-bold text-white mb-8 text-center">🔥 Burn Progress</h2>
            <div className="text-center">
              <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <div className="text-red-400 text-lg">Unable to load burn progress</div>
              <div className="text-red-300 text-sm mt-2">Service temporarily unavailable</div>
            </div>
          </div>
        )}

        {/* Latest Burn Transactions */}
        <div className="bg-gray-800 rounded-lg border border-gray-700">
          <div className="px-6 py-4 border-b border-gray-700">
            <h3 className="text-lg font-semibold text-white">
              {last24HourBurns.length > 10 
                ? `Recent Burn Transactions (${last24HourBurns.length} in last 24h)` 
                : 'Latest Burn Transactions (Last 10)'}
            </h3>
          </div>
          {burnsData ? (
            <BurnTransactionTable transactions={burnsToShow} loading={false} />
          ) : (
            <div className="p-8 text-center">
              <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-400">Unable to load burn transactions</p>
              <p className="text-red-300 text-sm mt-2">Service temporarily unavailable</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
