import { TrendingUp, TrendingDown, Flame, DollarSign, AlertTriangle, Clock } from 'lucide-react';
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
}

interface TotalBurnedData {
  totalBurned: number;
  isFromCache: boolean;
  source: string;
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

// Format time since last burn
function formatTimeSince(milliseconds: number): string {
  const minutes = Math.floor(milliseconds / (1000 * 60));
  const hours = Math.floor(milliseconds / (1000 * 60 * 60));
  const days = Math.floor(milliseconds / (1000 * 60 * 60 * 24));
  
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

// Format trend percentage with arrow
function formatTrend(percentage: number): { text: string; type: 'up' | 'down' | 'neutral' } {
  if (Math.abs(percentage) < 1) return { text: 'No change', type: 'neutral' };
  const arrow = percentage > 0 ? '↗' : '↘';
  return { 
    text: `${arrow} ${Math.abs(percentage).toFixed(1)}%`, 
    type: percentage > 0 ? 'up' : 'down' 
  };
}

// Server-side data fetching functions
async function fetchBurnsData(): Promise<BurnTransaction[]> {
  try {
    const response = await fetch('http://localhost:3000/api/burns?all=true&offset=20');
    if (!response.ok) throw new Error(`Burns API failed: ${response.status}`);
    const data = await response.json();
    console.log('✅ Server-side burns fetch successful:', data.transactions?.length || 0, 'transactions from all burn addresses');
    return data.transactions || [];
  } catch (error) {
    console.error('❌ Server-side burns fetch failed:', error);
    return [];
  }
}

async function fetchTotalBurnedData(): Promise<TotalBurnedData> {
  try {
    const response = await fetch('http://localhost:3000/api/total-burned');
    if (!response.ok) throw new Error(`Total burned API failed: ${response.status}`);
    const data = await response.json();
    console.log('✅ Server-side total burned fetch successful:', formatBurnedAmount(data.totalBurned || 0), 'SHIB');
    return data;
  } catch (error) {
    console.error('❌ Server-side total burned fetch failed:', error);
    return { totalBurned: 0, isFromCache: false, source: 'Server fetch failed' };
  }
}

async function fetchPriceData(): Promise<ShibPriceData> {
  try {
    const response = await fetch('http://localhost:3000/api/price');
    if (!response.ok) throw new Error(`Price API failed: ${response.status}`);
    const data = await response.json();
    console.log('✅ Server-side price fetch successful:', `$${data.price?.toFixed(8) || 0}`);
    return data;
  } catch (error) {
    console.error('❌ Server-side price fetch failed:', error);
    return { price: 0, priceChange24h: 0 };
  }
}

export default async function Home() {
  console.log('🏠 Server-side data fetching started...');
  
  // Fetch all data in parallel on the server
  const [burns, totalBurnedData, shibPrice] = await Promise.all([
    fetchBurnsData(),
    fetchTotalBurnedData(),
    fetchPriceData()
  ]);

  console.log('📊 Server-side data summary:', {
    burnsCount: burns.length,
    totalBurned: formatBurnedAmount(totalBurnedData.totalBurned),
    shibPrice: `$${shibPrice.price.toFixed(8)}`
  });

  // Calculate 24H burn activity
  const now = Date.now();
  const twentyFourHoursAgo = now - (24 * 60 * 60 * 1000);
  const twentyFourHourBurns = burns.filter(tx => {
    const txTime = parseInt(tx.timeStamp) * 1000;
    return txTime >= twentyFourHoursAgo;
  });
  const twentyFourHourBurnAmount = twentyFourHourBurns.reduce((total, tx) => 
    total + (parseInt(tx.value) / 1e18), 0);

  // Calculate 7-day burn trend
  const sevenDaysAgo = now - (7 * 24 * 60 * 60 * 1000);
  const fourteenDaysAgo = now - (14 * 24 * 60 * 60 * 1000);
  
  const lastWeekBurns = burns.filter(tx => {
    const txTime = parseInt(tx.timeStamp) * 1000;
    return txTime >= sevenDaysAgo;
  });
  const previousWeekBurns = burns.filter(tx => {
    const txTime = parseInt(tx.timeStamp) * 1000;
    return txTime >= fourteenDaysAgo && txTime < sevenDaysAgo;
  });
  
  const lastWeekAmount = lastWeekBurns.reduce((total, tx) => total + (parseInt(tx.value) / 1e18), 0);
  const previousWeekAmount = previousWeekBurns.reduce((total, tx) => total + (parseInt(tx.value) / 1e18), 0);
  const weeklyTrend = previousWeekAmount > 0 ? ((lastWeekAmount - previousWeekAmount) / previousWeekAmount) * 100 : 0;

  // Get time of last burn
  const lastBurnTime = burns.length > 0 ? parseInt(burns[0].timeStamp) * 1000 : 0;
  const timeSinceLastBurn = lastBurnTime > 0 ? now - lastBurnTime : 0;
  
  // Calculate burn rates per time period
  const dailyBurnRate = twentyFourHourBurnAmount; // SHIB burned per day (last 24h)
  const hourlyBurnRate = dailyBurnRate / 24; // SHIB burned per hour
  
  // Calculate recent burn rate (for display purposes)
  const recentBurnRate = burns.length > 0 ? 
    burns.slice(0, Math.min(burns.length, 5)) // Use recent 5 transactions as proxy for recent activity
    .reduce((total, tx) => total + (parseInt(tx.value) / 1e18), 0) : 0;

  const hasBurnData = burns.length > 0;
  const hasPriceData = shibPrice.price > 0;
  const hasTotalBurnedData = totalBurnedData.totalBurned > 0;

  // Calculate market cap (price * circulating supply)
  // Updated to match CoinMarketCap's current circulating supply as of January 2025
  const circulatingSupply = 589246853017681; // 589.24T SHIB (CoinMarketCap)
  const marketCap = hasPriceData ? shibPrice.price * circulatingSupply : 0;

  // Calculate percentage for progress bar
  const burnedPercentage = hasTotalBurnedData ? (totalBurnedData.totalBurned / 1000000000000000) * 100 : 0; // Out of 1 quadrillion

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            🔥 SHIB Burn Tracker
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Track SHIBA INU token burns in real-time. Monitor burn transactions, rates, and supply reduction.
          </p>
        </div>

        {/* Priority Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* PRIMARY METRICS - What people want to see FIRST */}
          <StatCard
            title="Total SHIB Burned"
            value={hasTotalBurnedData ? `${formatBurnedAmount(totalBurnedData.totalBurned)} SHIB` : "No data available"}
            change={hasTotalBurnedData ? `${burnedPercentage.toFixed(4)}% of total supply` : "API data unavailable"}
            changeType="neutral"
            icon={Flame}
            loading={false}
          />
          
          <StatCard
            title="24H Burn Activity"
            value={hasBurnData ? `${formatNumber(twentyFourHourBurnAmount)} SHIB` : "No data available"}
            change={hasBurnData ? `${twentyFourHourBurns.length} burns today` : "API data unavailable"}
            changeType="neutral" 
            icon={TrendingDown}
            loading={false}
          />
          
          <StatCard
            title="SHIB Price"
            value={hasPriceData ? `$${shibPrice.price.toFixed(8)}` : "No data available"}
            change={hasPriceData ? `${shibPrice.priceChange24h.toFixed(2)}% (24h)` : "API data unavailable"}
            changeType={shibPrice.priceChange24h >= 0 ? "positive" : "negative"}
            icon={DollarSign}
            loading={false}
          />
        </div>

        {/* Secondary Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <StatCard
            title="Last Burn"
            value={hasBurnData ? formatTimeSince(timeSinceLastBurn) : "No data available"}
            change={hasBurnData ? "Most recent activity" : "API data unavailable"}
            changeType="neutral"
            icon={Clock}
            loading={false}
          />
          
          <StatCard
            title="Burn Rate"
            value={hasBurnData ? `${formatNumber(hourlyBurnRate)} SHIB/hr` : "No data available"}
            change={hasBurnData ? `${formatNumber(dailyBurnRate)} SHIB/day` : "API data unavailable"}
            changeType="neutral"
            icon={Flame}
            loading={false}
          />
          
          <StatCard
            title="Market Cap"
            value={hasPriceData ? `$${formatMarketCap(marketCap)}` : "No data available"}
            change={hasPriceData ? "Current valuation" : "API data unavailable"}
            changeType="neutral"
            icon={TrendingUp}
            loading={false}
          />
        </div>

        {/* Supply Overview - More Prominent */}
        <div className="bg-gray-800 rounded-xl shadow-lg p-8 mb-12 border border-gray-700">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">🔥 Burn Progress</h2>
          <div className="space-y-8">
            <div className="text-center">
              <div className="text-5xl font-bold text-orange-400 mb-2">
                {hasTotalBurnedData ? `${burnedPercentage.toFixed(4)}%` : "0%"}
              </div>
              <div className="text-gray-300 text-lg">
                of total supply permanently burned
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-medium text-gray-300">Progress to Next Milestone</span>
                <span className="text-lg text-orange-400 font-bold">
                  {hasTotalBurnedData ? `${formatBurnedAmount(totalBurnedData.totalBurned)} SHIB` : "No data"}
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-6 shadow-inner">
                <div 
                  className="bg-gradient-to-r from-orange-500 to-red-500 h-6 rounded-full transition-all duration-1000 shadow-lg" 
                  style={{ width: `${Math.min(burnedPercentage, 100)}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-sm text-gray-400 mt-2">
                <span>0 SHIB</span>
                <span>1 Quadrillion SHIB</span>
              </div>
            </div>


          </div>
        </div>

        {/* Data Status Alert */}
        {(!hasBurnData || !hasPriceData || !hasTotalBurnedData) && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mr-3" />
              <div>
                <h3 className="text-sm font-medium text-yellow-800">Limited Data Available</h3>
                <p className="text-sm text-yellow-700 mt-1">
                  Some external APIs are temporarily unavailable. Displaying cached or fallback data where possible.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Recent Burn Transactions */}
        {hasBurnData ? (
          <BurnTransactionTable 
            transactions={burns} 
            loading={false}
          />
        ) : (
          <div className="bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-700">
            <h2 className="text-2xl font-bold text-white mb-6">Recent Burn Transactions</h2>
            <div className="text-center py-8">
              <AlertTriangle className="mx-auto h-12 w-12 text-gray-500 mb-4" />
              <p className="text-gray-300">No transaction data available at the moment.</p>
              <p className="text-sm text-gray-400 mt-2">
                Please check back later or verify your API configuration.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
