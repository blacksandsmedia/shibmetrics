'use client';

import { useState, useEffect, useCallback } from 'react';
import { Flame, Filter, Download, RefreshCw, ExternalLink, History } from 'lucide-react';
import Link from 'next/link';
import { 
  BurnTransaction, 
  BURN_ADDRESSES,
  formatBurnAmount,
  formatNumber,
  formatTimeAgo 
} from '@/lib/api';

export default function BurnTrackerPage() {
  const [allBurns, setAllBurns] = useState<BurnTransaction[]>([]);
  const [filteredBurns, setFilteredBurns] = useState<BurnTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAddress, setSelectedAddress] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'time' | 'amount'>('time');
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  // Force re-render every minute to update "time ago" values dynamically
  const [, forceTimeUpdate] = useState(0);

  // Show latest 25 burns only
  const latestBurns = filteredBurns.slice(0, 25);

  // Initialize with immediate data fetch and setup auto-refresh
  useEffect(() => {
    console.log('🔥 Burn Tracker: Component mounted, fetching initial data...');
    // Start fetching data immediately
    fetchAllBurns();
    
    // Smart auto-refresh: Only update if new burns are detected
    const interval = setInterval(() => {
      if (!document.hidden) {
        console.log('🔥 Checking for new burn transactions...');
        
        // Check for new data without updating UI immediately
        const checkForNewBurns = async () => {
          try {
            const response = await fetch('/api/burns', { cache: 'no-cache' });
            if (response.ok) {
              const data = await response.json();
              const newBurns = data.transactions || [];
              
              // Compare with current data  
              const hasNewBurns = newBurns.length > allBurns.length ||
                (newBurns.length > 0 && allBurns.length > 0 && 
                 newBurns[0].hash !== allBurns[0].hash);
              
              if (hasNewBurns) {
                console.log('🔥 New burn transactions detected, refreshing tracker...');
                fetchAllBurns(false);
              } else {
                console.log('📊 No new burns, keeping current display');
              }
            }
          } catch (error) {
            console.warn('⚠️ Error checking for new burns:', error);
          }
        };
        
        checkForNewBurns();
      }
    }, 60000); // 60 seconds
    
    return () => clearInterval(interval);
  }, []);

  // Update time display every minute to refresh "time ago" calculations without animation
  useEffect(() => {
    const timeInterval = setInterval(() => {
      forceTimeUpdate(prev => prev + 1);
    }, 60000); // Update every minute

    return () => clearInterval(timeInterval);
  }, []);

  const fetchAllBurns = async (forceFresh: boolean = false) => {
    setLoading(true);
    console.log(`🔥 Burn Tracker: Starting to fetch burns from API (forceFresh=${forceFresh})...`);
    try {
      // Fetch from our internal API endpoint with cache-busting when needed
      const cacheParam = forceFresh ? '?force=true' : '';
      const response = await fetch(`/api/burns${cacheParam}`, {
        cache: 'no-cache',
        headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' }
      });
      
      if (!response.ok) {
        throw new Error(`API returned ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('🔥 API Response:', data);
      
      if (data.transactions && Array.isArray(data.transactions)) {
        console.log(`🔥 Got ${data.transactions.length} burns from API`);
        setAllBurns(data.transactions);
      } else {
        console.log('⚠️  No transactions in API response');
        setAllBurns([]);
      }
      
      setLastUpdated(new Date());
      
    } catch (error) {
      console.error('🔥 Error fetching burns:', error);
      setAllBurns([]);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortBurns = useCallback(() => {
    let filtered = [...allBurns];
    console.log(`🔥 Starting filter with ${filtered.length} burns`);

    // Filter by address (support both source and destination filtering)
    if (selectedAddress !== 'all') {
      const beforeFilter = filtered.length;
      const filterAddress = selectedAddress.toLowerCase();
      
      // All burn addresses are destinations (to)
      filtered = filtered.filter(burn => burn.to.toLowerCase() === filterAddress);
      console.log(`🔥 After destination filter (${selectedAddress}): ${filtered.length} (was ${beforeFilter})`);
    }

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === 'time') {
        return parseInt(b.timeStamp) - parseInt(a.timeStamp);
      } else {
        return parseInt(b.value) - parseInt(a.value);
      }
    });

    console.log(`🔥 Final filtered burns: ${filtered.length}`);
    setFilteredBurns(filtered);
  }, [allBurns, selectedAddress, sortBy]);

  useEffect(() => {
    console.log(`🔥 Filtering burns - allBurns: ${allBurns.length}, selectedAddress: ${selectedAddress}, sortBy: ${sortBy}`);
    filterAndSortBurns();
  }, [allBurns, selectedAddress, sortBy, filterAndSortBurns]);

  // Get friendly name for burn address  
  const getAddressName = (address: string): string => {
    const lowerAddress = address.toLowerCase();
    // No longer tracking Community Address as a burn destination
    // Check burn destinations
    for (const [name, addr] of Object.entries(BURN_ADDRESSES)) {
      if ((addr as string).toLowerCase() === lowerAddress) {
        if (name === 'Vitalik Burn (BA-1)') return 'BA-1';
        if (name === 'Dead Address (BA-2)') return 'BA-2';  
        if (name === 'Black Hole (BA-3)') return 'BA-3';
        return name;
      }
    }
    return 'Unknown';
  };



  const totalBurnedAmount = latestBurns.reduce((total, burn) => {
    return total + (parseInt(burn.value) / Math.pow(10, 18));
  }, 0);

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center">
                <Flame className="h-8 w-8 text-orange-500 mr-3" />
                Live SHIB Burn Tracker
              </h1>
              <p className="text-gray-400 mt-2">
                Real-time tracking of the latest 25 Shiba Inu token burn transactions
              </p>
            </div>

          </div>
          
          <div className="mt-4 flex items-center text-sm text-gray-400">
            <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
            <span className="mx-2">•</span>
            <span>Latest 25 transactions</span>
            <span className="mx-2">•</span>
            <span>{formatNumber(totalBurnedAmount)} SHIB shown</span>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8 border border-gray-700">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
                              <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Filter className="h-4 w-4 inline mr-2" />
                  Filter by Address
                </label>
                              <select 
                  value={selectedAddress} 
                  onChange={(e) => setSelectedAddress(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="all">All Addresses</option>
                  <option value={BURN_ADDRESSES['Vitalik Burn (BA-1)']}>Vitalik Burn (BA-1)</option>
                  <option value={BURN_ADDRESSES['Dead Address (BA-2)']}>Dead Address (BA-2)</option>
                  <option value={BURN_ADDRESSES['Black Hole (BA-3)']}>Black Hole (BA-3)</option>
                </select>
            </div>
            
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'time' | 'amount')}
                className="w-full bg-gray-700 border border-gray-600 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="time">Most Recent</option>
                <option value="amount">Largest Amount</option>
              </select>
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-gray-800 rounded-lg border border-gray-700">
          <div className="px-6 py-4 border-b border-gray-700 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-white">
              Latest 25 Burn Transactions
            </h2>
            <div className="flex items-center space-x-4">
              <Link
                href="/history"
                className="flex items-center text-orange-400 hover:text-orange-300 text-sm font-medium transition-colors"
              >
                <History className="h-4 w-4 mr-2" />
                View Full History
              </Link>
              <button className="flex items-center text-gray-400 hover:text-white text-sm">
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </button>
            </div>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <RefreshCw className="h-8 w-8 text-orange-500 animate-spin mx-auto mb-4" />
              <p className="text-gray-400">Loading burn transactions...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-750">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      $SHIB BURNED
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      From Address
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Burn Address
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      DETAILS
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-gray-800 divide-y divide-gray-700">
                  {latestBurns.map((tx) => (
                    <tr key={tx.hash} className="hover:bg-gray-750 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-lg font-bold text-orange-400">
                          🔥 {formatBurnAmount(parseInt(tx.value) / Math.pow(10, 18))}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-300 font-mono">
                          {tx.from.slice(0, 10)}...{tx.from.slice(-8)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-orange-400">
                          {getAddressName(tx.to)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-300">
                          {formatTimeAgo(tx.timeStamp)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <a
                          href={`https://etherscan.io/tx/${tx.hash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 transition-colors flex items-center"
                        >
                          <ExternalLink className="h-4 w-4 mr-1" />
                          View
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* View Full History Button */}
          {!loading && latestBurns.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-700 text-center">
              <Link
                href="/history"
                className="inline-flex items-center px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-colors"
              >
                <History className="h-5 w-5 mr-2" />
                View Full Burn History
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 