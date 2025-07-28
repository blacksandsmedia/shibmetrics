'use client';

import { useState, useEffect } from 'react';
import { 
  Calendar, 
  TrendingUp, 
  BarChart3, 
  Flame,
  Clock,
  Target
} from 'lucide-react';
import { formatTimeAgo } from '@/lib/api';
// Helper functions and types
interface BurnTransaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  timeStamp: string;
  blockNumber: string;
}

// Format large numbers for display
function formatNumber(num: number): string {
  if (num >= 1e12) return (num / 1e12).toFixed(2) + 'T';
  if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
  return num.toFixed(2);
}



interface HistoricalData {
  date: string;
  totalBurned: number;
  dailyBurns: number;
  burnCount: number;
}

export default function HistoryPage() {
  const [burns, setBurns] = useState<BurnTransaction[]>([]);
  const [totalBurned, setTotalBurned] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '1y'>('30d');
  const [historicalData, setHistoricalData] = useState<HistoricalData[]>([]);

  // Process real burn transactions into daily aggregates based on timeframe
  const processHistoricalData = (burnTransactions: BurnTransaction[], selectedTimeframe: string) => {
    console.log(`Processing historical data for ${selectedTimeframe} with ${burnTransactions.length} transactions`);
    
    // Determine number of days based on timeframe
    const daysMap = {
      '7d': 7,
      '30d': 30,
      '1y': 365
    };
    const days = daysMap[selectedTimeframe as keyof typeof daysMap] || 30;

    // Group real transactions by date
    const dailyData: { [date: string]: { burns: number; count: number } } = {};
    const now = new Date();
    const cutoffTime = new Date(now.getTime() - (days * 24 * 60 * 60 * 1000));

    // Process real burn transactions
    burnTransactions.forEach(burn => {
      const burnDate = new Date(parseInt(burn.timeStamp) * 1000);
      if (burnDate >= cutoffTime) {
        const dateStr = burnDate.toISOString().split('T')[0];
        const burnAmount = parseInt(burn.value) / 1e18; // Convert from wei to SHIB
        
        if (!dailyData[dateStr]) {
          dailyData[dateStr] = { burns: 0, count: 0 };
        }
        
        dailyData[dateStr].burns += burnAmount;
        dailyData[dateStr].count += 1;
      }
    });

    // Create historical data array with real data
    const historicalData: HistoricalData[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayData = dailyData[dateStr] || { burns: 0, count: 0 };
      
      historicalData.push({
        date: dateStr,
        totalBurned: dayData.burns,
        dailyBurns: dayData.burns,
        burnCount: dayData.count
      });
    }
    
    console.log(`Processed ${historicalData.length} days of real burn data for ${selectedTimeframe}`);
    console.log(`Found ${Object.keys(dailyData).length} days with actual burns`);
    return historicalData;
  };

  // Reprocess data when timeframe changes
  useEffect(() => {
    if (burns.length > 0) {
      console.log(`Timeframe changed to: ${timeframe}`);
      const newHistoricalData = processHistoricalData(burns, timeframe);
      setHistoricalData(newHistoricalData);
    }
  }, [timeframe, burns]);

  // Initial data loading
  useEffect(() => {
    const fetchData = async () => {
      console.log('Loading historical burn data...');
      setLoading(true);
      try {
        const [burnsResponse, totalBurnedResponse] = await Promise.all([
          fetch('/api/burns?all=true&offset=2000').then(res => res.json()),
          fetch('/api/total-burned').then(res => res.json())
        ]);

        const transactions = burnsResponse.transactions || [];
        console.log(`Loaded ${transactions.length} burn transactions`);
        setBurns(transactions);
        setTotalBurned(totalBurnedResponse.totalBurned || 0);
      } catch (error) {
        console.error('Error loading burn data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculate statistics from real data based on current timeframe
  const getFilteredData = () => {
    const daysToShow = {
      '7d': 7,
      '30d': 30,
      '1y': 365
    }[timeframe] || 30;
    
    return historicalData.slice(-daysToShow);
  };

  const filteredData = getFilteredData();
  const totalBurnsInPeriod = filteredData.reduce((sum, day) => sum + day.dailyBurns, 0);
  const avgDailyBurns = filteredData.length > 0 ? totalBurnsInPeriod / filteredData.length : 0;
  const totalTransactions = filteredData.reduce((sum, day) => sum + day.burnCount, 0);
  const initialSupply = 1000000000000000;
  const burnPercentage = (totalBurned / initialSupply) * 100;

  // Get data for chart display (limit to reasonable amount for visualization)
  const getChartData = () => {
    if (timeframe === '1y') {
      // For 1 year, group by months (12 bars)
      const monthlyData: HistoricalData[] = [];
      for (let i = 0; i < 12; i++) {
        const monthStart = new Date();
        monthStart.setMonth(monthStart.getMonth() - i);
        monthStart.setDate(1); // Start of month
        
        const monthEnd = new Date(monthStart);
        monthEnd.setMonth(monthEnd.getMonth() + 1);
        monthEnd.setDate(0); // End of month
        
        const monthData = filteredData.filter(d => {
          const dayDate = new Date(d.date);
          return dayDate >= monthStart && dayDate <= monthEnd;
        });
        
        monthlyData.unshift({
          date: monthStart.toISOString().split('T')[0],
          totalBurned: totalBurned,
          dailyBurns: monthData.reduce((sum, d) => sum + d.dailyBurns, 0),
          burnCount: monthData.reduce((sum, d) => sum + d.burnCount, 0),
        });
      }
      return monthlyData; // Show all 12 months
    }
    
    // For daily timeframes (7d and 30d), show all available data
    return filteredData;
  };

  const chartData = getChartData();

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white flex items-center">
            <Calendar className="h-8 w-8 text-orange-500 mr-3" />
            SHIB Burn History
          </h1>
          <p className="text-gray-400 mt-2">
            Historical analysis of Shiba Inu token burns over time using real transaction data
          </p>
          {!loading && burns.length > 0 && (
            <p className="text-gray-500 text-sm mt-1">
              Showing data from {burns.length} recent burn transactions
            </p>
          )}
          
        </div>

        {/* Time Filter */}
        <div className="mb-8">
          <div className="flex space-x-2">
            {(['7d', '30d', '1y'] as const).map((period) => (
              <button
                key={period}
                onClick={() => setTimeframe(period)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  timeframe === period
                    ? 'bg-orange-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {period === '7d' ? '7 Days' : period === '30d' ? '30 Days' : '1 Year'}
              </button>
            ))}
          </div>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Total Burned</p>
                <p className="mt-2 text-3xl font-semibold text-white">
                  {formatNumber(totalBurned)} SHIB
                </p>
                <p className="mt-1 text-sm text-orange-400">
                  {burnPercentage.toFixed(2)}% of supply
                </p>
              </div>
              <Flame className="h-8 w-8 text-orange-500" />
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">
                  {timeframe === '7d' ? '7-Day' : timeframe === '30d' ? '30-Day' : '1-Year'} Average
                </p>
                <p className="mt-2 text-3xl font-semibold text-white">
                  {formatNumber(avgDailyBurns)}
                </p>
                <p className="mt-1 text-sm text-gray-400">SHIB per day</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Total Transactions</p>
                <p className="mt-2 text-3xl font-semibold text-white">
                  {totalTransactions.toLocaleString()}
                </p>
                <p className="mt-1 text-sm text-gray-400">burn events</p>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">
                  Last {timeframe === '7d' ? '7 Days' : timeframe === '30d' ? '30 Days' : '1 Year'}
                </p>
                <p className="mt-2 text-3xl font-semibold text-white">
                  {formatNumber(totalBurnsInPeriod)}
                </p>
                <p className="mt-1 text-sm text-gray-400">SHIB burned</p>
              </div>
              <Clock className="h-8 w-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Historical Chart */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8 border border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">
              {timeframe === '1y' ? 'Monthly' : 'Daily'} Burn Chart
            </h2>
            <div className="text-sm text-gray-400">
              Last {timeframe} view
            </div>
          </div>
          
          <div className="relative">
            <div className="h-64 bg-gray-900 rounded-lg p-6 overflow-hidden">
              <div className="flex items-end justify-between h-full space-x-2">
                {chartData.length > 0 ? (
                  chartData.map((day, index) => {
                    // Calculate height with proper scaling - max height is 180px (leaving room for padding)
                    const maxDailyBurn = Math.max(...chartData.map(d => d.dailyBurns), 1);
                    const maxBarHeight = 180; // Maximum bar height in pixels
                    const minBarHeight = 4; // Minimum visible height
                    
                    let heightPixels;
                    if (day.dailyBurns <= 0) {
                      heightPixels = 2; // Very small bar for zero values
                    } else {
                      // Scale to fit within maxBarHeight, with minimum height for visibility
                      const scaledHeight = (day.dailyBurns / maxDailyBurn) * maxBarHeight;
                      heightPixels = Math.max(scaledHeight, minBarHeight);
                    }
                    
                    return (
                      <div key={`${day.date}-${index}`} className="flex-1 flex flex-col items-center group">
                        {/* Tooltip */}
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 mb-2 bg-gray-700 text-white text-xs rounded px-2 py-1 whitespace-nowrap absolute -top-16 z-10">
                          <div className="font-semibold">{day.date}</div>
                          <div>{formatNumber(day.dailyBurns)} SHIB</div>
                          <div>{day.burnCount} transactions</div>
                        </div>
                        
                        {/* Bar - using properly scaled pixel height */}
                        <div
                          className={`${
                            day.dailyBurns > 0 
                              ? 'bg-orange-500 hover:bg-orange-400' 
                              : 'bg-gray-600'
                          } rounded-t-lg w-full min-w-[4px] transition-all duration-300 hover:brightness-110 cursor-pointer`}
                          style={{ height: `${heightPixels}px` }}
                        ></div>
                        
                        {/* Date label */}
                        <div className="text-xs text-gray-500 mt-2 text-center">
                          {timeframe === '1y' 
                            ? new Date(day.date).toLocaleDateString('en-US', { month: 'short' })
                            : new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                          }
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="flex items-center justify-center h-full w-full text-gray-400">
                    <div className="text-center">
                      <div className="text-sm">No burn data available</div>
                      <div className="text-xs mt-1">Check back later for updated information</div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Y-axis labels */}
              {chartData.length > 0 && (
                <div className="absolute left-0 top-6 bottom-12 flex flex-col justify-between text-xs text-gray-500">
                  <span>{formatNumber(Math.max(...chartData.map(d => d.dailyBurns), 1))}</span>
                  <span>{formatNumber(Math.max(...chartData.map(d => d.dailyBurns), 1) * 0.5)}</span>
                  <span>0</span>
                </div>
              )}
            </div>
            
            {/* Chart description */}
            <div className="mt-4 text-sm text-gray-400 text-center">
              {timeframe === '1y' 
                ? `Monthly SHIB burn amounts over the last ${timeframe}. Hover over bars for details.`
                : `Daily SHIB burn amounts over the last ${timeframe}. Hover over bars for details.`
              }
              {chartData.length > 0 && (
                <div className="mt-1 text-xs">
                  Showing {chartData.length} data points • 
                  Total burned: {formatNumber(totalBurnsInPeriod)} SHIB
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Burns Timeline */}
        <div className="bg-gray-800 rounded-lg border border-gray-700">
          <div className="px-6 py-4 border-b border-gray-700">
            <h2 className="text-xl font-semibold text-white">Recent Burn Timeline</h2>
          </div>
          
          <div className="p-6">
            {loading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <div className="h-4 bg-gray-700 rounded w-20 animate-pulse"></div>
                    <div className="h-4 bg-gray-700 rounded w-32 animate-pulse"></div>
                    <div className="h-4 bg-gray-700 rounded w-24 animate-pulse"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {burns.slice(0, 20).map((burn, index) => (
                  <div key={burn.hash} className="flex items-center justify-between p-4 bg-gray-750 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                      </div>
                      <div>
                        <div className="text-white font-medium">
                          🔥 {formatNumber(parseInt(burn.value) / Math.pow(10, 18))} SHIB
                        </div>
                        <div className="text-gray-400 text-sm">
                          Block {burn.blockNumber} • {formatTimeAgo(burn.timeStamp)}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <a
                        href={`https://etherscan.io/tx/${burn.hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 text-sm"
                      >
                        View Transaction
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Milestones */}
        <div className="mt-8 bg-gradient-to-r from-orange-900/20 to-red-900/20 rounded-lg p-6 border border-orange-500/20">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
            <Target className="h-5 w-5 mr-2" />
            Burn Milestones
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-400">41.05%</div>
              <div className="text-gray-300">of initial supply burned</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-400">410.5T</div>
              <div className="text-gray-300">SHIB tokens burned</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-400">589.5T</div>
              <div className="text-gray-300">SHIB remaining in circulation</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 