'use client';

import { useState, useEffect } from 'react';
import { Flame, Filter, Download, RefreshCw, ExternalLink } from 'lucide-react';
import { 
  fetchBurnTransactions, 
  BurnTransaction, 
  BURN_ADDRESSES,
  formatNumber,
  formatTimeAgo 
} from '@/lib/api';

export default function BurnTrackerPage() {
  const [allBurns, setAllBurns] = useState<BurnTransaction[]>([]);
  const [filteredBurns, setFilteredBurns] = useState<BurnTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAddress, setSelectedAddress] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'time' | 'amount'>('time');
  const [page, setPage] = useState(1);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const itemsPerPage = 25;

  // Initialize with immediate data fetch
  useEffect(() => {
    console.log('🔥 Burn Tracker: Component mounted, fetching initial data...');
    // Start fetching data immediately
    fetchAllBurns();
  }, []);

  useEffect(() => {
    console.log(`🔥 Filtering burns - allBurns: ${allBurns.length}, selectedAddress: ${selectedAddress}, sortBy: ${sortBy}`);
    filterAndSortBurns();
  }, [allBurns, selectedAddress, sortBy]);

  const fetchAllBurns = async () => {
    setLoading(true);
    console.log('🔥 Burn Tracker: Starting to fetch burns from API...');
    try {
      // Fetch from our internal API endpoint instead of direct Etherscan calls
      const response = await fetch('/api/burns');
      
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

  const filterAndSortBurns = () => {
    let filtered = [...allBurns];
    console.log(`🔥 Starting filter with ${filtered.length} burns`);

    // Filter by address
    if (selectedAddress !== 'all') {
      const beforeFilter = filtered.length;
      filtered = filtered.filter(burn => burn.to.toLowerCase() === selectedAddress.toLowerCase());
      console.log(`🔥 After address filter (${selectedAddress}): ${filtered.length} (was ${beforeFilter})`);
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
    setPage(1); // Reset to first page when filtering
  };

  // Get friendly name for burn address  
  const getAddressName = (address: string): string => {
    const lowerAddress = address.toLowerCase();
    // Check if it's the Community Address (source)
    if (lowerAddress === BURN_ADDRESSES['Community Address'].toLowerCase()) {
      return 'CA';
    }
    // Check burn destinations
    for (const [name, addr] of Object.entries(BURN_ADDRESSES)) {
      if ((addr as string).toLowerCase() === lowerAddress) {
        if (name === 'Vitalik Burn Alt') return 'BA-1';
        if (name === 'Dead Address 1') return 'BA-2';  
        if (name === 'Null Address') return 'BA-3';
        return name;
      }
    }
    return 'Unknown';
  };

  // Get address color for display
  const getAddressColor = (address: string): string => {
    const name = getAddressName(address);
    switch (name) {
      case 'Vitalik Burn': return 'text-orange-400';
      case 'ShibaSwap': return 'text-green-400';
      case 'Black Hole': return 'text-purple-400';
      default: return 'text-gray-400';
    }
  };

  const totalPages = Math.ceil(filteredBurns.length / itemsPerPage);
  const paginatedBurns = filteredBurns.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const totalBurnedAmount = filteredBurns.reduce((total, burn) => {
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
                Real-time tracking of all Shiba Inu token burn transactions
              </p>
            </div>
            <button
              onClick={fetchAllBurns}
              disabled={loading}
              className="flex items-center px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
          
          <div className="mt-4 flex items-center text-sm text-gray-400">
            <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
            <span className="mx-2">•</span>
            <span>{filteredBurns.length} transactions</span>
            <span className="mx-2">•</span>
            <span>{formatNumber(totalBurnedAmount)} SHIB burned</span>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8 border border-gray-700">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
                              <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Filter className="h-4 w-4 inline mr-2" />
                  Filter by Burn Destination
                </label>
                              <select 
                  value={selectedAddress} 
                  onChange={(e) => setSelectedAddress(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="all">All Burn Destinations</option>
                  <option value={BURN_ADDRESSES['Vitalik Burn Alt']}>Vitalik Burn Alt (BA-1)</option>
                  <option value={BURN_ADDRESSES['Dead Address 1']}>Dead Address (BA-2)</option>
                  <option value={BURN_ADDRESSES['Null Address']}>Null Address (BA-3)</option>
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
              Burn Transactions
            </h2>
            <button className="flex items-center text-gray-400 hover:text-white text-sm">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </button>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <RefreshCw className="h-8 w-8 text-orange-500 animate-spin mx-auto mb-4" />
              <p className="text-gray-400">Loading burn transactions...</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead className="bg-gray-750">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Amount Burned
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
                        Transaction
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-gray-800 divide-y divide-gray-700">
                    {paginatedBurns.map((tx) => (
                      <tr key={tx.hash} className="hover:bg-gray-750 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-lg font-bold text-orange-400">
                            🔥 {formatNumber(parseInt(tx.value) / Math.pow(10, 18))}
                          </span>
                          <span className="text-gray-400 ml-2">SHIB</span>
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

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-700 flex justify-between items-center">
                  <div className="text-sm text-gray-400">
                    Showing {(page - 1) * itemsPerPage + 1} to {Math.min(page * itemsPerPage, filteredBurns.length)} of {filteredBurns.length} transactions
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setPage(Math.max(1, page - 1))}
                      disabled={page === 1}
                      className="px-3 py-1 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 text-white rounded text-sm transition-colors"
                    >
                      Previous
                    </button>
                    <span className="px-3 py-1 text-gray-400 text-sm">
                      Page {page} of {totalPages}
                    </span>
                    <button
                      onClick={() => setPage(Math.min(totalPages, page + 1))}
                      disabled={page === totalPages}
                      className="px-3 py-1 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 text-white rounded text-sm transition-colors"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
} 