'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  History, 
  ExternalLink, 
  ChevronLeft, 
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';

// Types
interface BurnTransaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  timeStamp: string;
  blockNumber: string;
  tokenName: string;
  tokenSymbol: string;
  tokenDecimal: string;
}

// SHIB burn destination addresses - ONLY the 3 official addresses (matches other pages)
const BURN_DESTINATIONS = {
  '0xdead000000000000000042069420694206942069': 'BA-1', // Vitalik Burn (BA-1)
  '0x000000000000000000000000000000000000dead': 'BA-2', // Dead Address (BA-2)
  '0x0000000000000000000000000000000000000000': 'BA-3', // Genesis/Black Hole (BA-3)
};

// Helper functions
function formatNumber(num: number): string {
  if (num >= 1e12) return (num / 1e12).toFixed(3) + 'T';
  if (num >= 1e9) return (num / 1e9).toFixed(3) + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(3) + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(3) + 'K';
  return num.toLocaleString();
}

function formatShibAmount(value: string): string {
  // Use BigInt to handle very large numbers properly
  try {
    const bigIntValue = BigInt(value);
    const amount = Number(bigIntValue) / 1e18;
    
    // For very small positive amounts that would show as "0.00", show "<1" instead
    if (amount > 0 && amount < 1) {
      return '<1';
    }
    
    return formatNumber(amount);
  } catch {
    console.warn('Invalid value for formatShibAmount:', value);
    return '0';
  }
}

function formatTimeAgo(timestamp: string): string {
  const now = Date.now();
  const txTime = parseInt(timestamp) * 1000;
  const diffMs = now - txTime;
  
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 60) return `${diffMinutes} minutes ago`;
  if (diffHours < 24) return `${diffHours} hours ago`;
  if (diffDays === 1) return 'Yesterday';
  return `${diffDays} days ago`;
}

function getBurnDestinationName(address: string): string {
  return BURN_DESTINATIONS[address.toLowerCase() as keyof typeof BURN_DESTINATIONS] || 'Unknown';
}

function truncateAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export default function BurnHistoryPage() {
  const [allTransactions, setAllTransactions] = useState<BurnTransaction[]>([]);
  // Force re-render every minute to update "time ago" values dynamically
  const [, forceTimeUpdate] = useState(0);
  const [filteredTransactions, setFilteredTransactions] = useState<BurnTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDestination, setSelectedDestination] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'time' | 'amount'>('time');
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  
  const itemsPerPage = 50;
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTransactions = filteredTransactions.slice(startIndex, endIndex);
  
  // 🚨 DEBUG: Log pagination state to diagnose table display issue
  console.log(`📊 PAGINATION DEBUG: filteredTransactions=${filteredTransactions.length}, currentPage=${currentPage}, startIndex=${startIndex}, endIndex=${endIndex}, currentTransactions=${currentTransactions.length}, loading=${loading}`);

  // Fetch burn data - COMPLETE HISTORICAL DATASET (5+ years of SHIB burns)
  const fetchBurnHistory = useCallback(async (forceFresh: boolean = false) => {
    setLoading(true);
    try {
      console.log(`📚 Fetching COMPLETE SHIB burn history (5+ years of data)...`);
      
      // Use historical dataset API for COMPLETE burn history - not just recent burns
      // This gives us ALL SHIB burns from 2020 onwards, not just recent ~300 transactions
      // Request maximum transactions (25,000 limit) - NOT the default 100!
      const params = forceFresh ? `?limit=25000&_t=${Date.now()}` : '?limit=25000';
      const response = await fetch(`/api/historical/dataset${params}`, {
        cache: forceFresh ? 'no-cache' : 'default',
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Historical dataset API failed: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log(`📚 Got ${data.transactions?.length || 0} transactions from COMPLETE historical dataset`);
      
      const transactions = data.transactions || [];
      
      // Sort by timestamp descending (most recent first) - SAME as burn tracker
      const sortedTransactions = transactions.sort((a: BurnTransaction, b: BurnTransaction) => {
        const timeA = parseInt(a.timeStamp) || 0;
        const timeB = parseInt(b.timeStamp) || 0;
        return timeB - timeA; // Descending order (newest first)
      });
      
      // Validate transactions (same validation as burn tracker)
      const validTransactions = sortedTransactions.filter((tx: BurnTransaction) => {
        try {
          BigInt(tx.value || '0');
          return true;
        } catch {
          console.log('Invalid transaction value:', tx.value);
          return false;
        }
      });
      
      console.log(`✅ COMPLETE HISTORY: Loaded ${validTransactions.length} transactions from ALL of SHIB history (5+ years)`);
      setAllTransactions(validTransactions);
      setLastUpdated(new Date());
      
    } catch (error) {
      console.error('❌ Error fetching burn history:', error);
      setAllTransactions([]);
    } finally {
      setLoading(false);
    }
  }, []);



  // Filter and sort transactions
  useEffect(() => {
    let filtered = [...allTransactions];
    
    console.log(`🔍 FILTERING DEBUG: selectedDestination="${selectedDestination}", allTransactions count=${allTransactions.length}`);
    
    // Filter by destination
    if (selectedDestination !== 'all') {
      console.log(`🔍 Filtering by: "${selectedDestination}"`);
      const beforeCount = filtered.length;
      filtered = filtered.filter(tx => tx.to.toLowerCase() === selectedDestination.toLowerCase());
      console.log(`🔍 Filter result: ${filtered.length} matches (was ${beforeCount})`);
      
      // Debug: Show first few matching transactions
      if (filtered.length > 0) {
        console.log(`🔍 Sample matches:`, filtered.slice(0, 3).map(tx => ({ to: tx.to, hash: tx.hash.slice(0, 10) })));
      } else {
        // Debug: Show what addresses we actually have
        const uniqueAddresses = [...new Set(allTransactions.map(tx => tx.to.toLowerCase()))];
        console.log(`🔍 Available addresses in data:`, uniqueAddresses);
        console.log(`🔍 Looking for address:`, selectedDestination.toLowerCase());
      }
    }
    
    // Sort
    filtered.sort((a, b) => {
      if (sortBy === 'time') {
        return parseInt(b.timeStamp) - parseInt(a.timeStamp);
      } else {
        // Use BigInt for proper comparison of large values
        try {
          const valueA = BigInt(a.value);
          const valueB = BigInt(b.value);
          if (valueB > valueA) return 1;
          if (valueB < valueA) return -1;
          return 0;
        } catch {
          return 0; // If comparison fails, treat as equal
        }
      }
    });
    
    setFilteredTransactions(filtered);
    setCurrentPage(1); // Reset to first page when filtering
  }, [allTransactions, selectedDestination, sortBy]);

  // Load data on component mount
  useEffect(() => {
    console.log('🔄 History page mounting, fetching data...');
    fetchBurnHistory();
  }, [fetchBurnHistory]);

  // Smart auto-refresh: Only update if new transactions are detected
  useEffect(() => {
    const interval = setInterval(() => {
      if (!document.hidden) {
        console.log('🔄 Checking for new burn transactions...');
        
        // Check for new data without updating UI immediately
        const checkForNewData = async () => {
          try {
            const response = await fetch(`/api/historical/dataset?limit=25000&_t=${Date.now()}`, { cache: 'no-cache' });
            if (response.ok) {
              const data = await response.json();
              const newTransactions = data.transactions || [];
              
              // Compare with current data
              const hasNewTransactions = newTransactions.length > allTransactions.length ||
                (newTransactions.length > 0 && allTransactions.length > 0 && 
                 newTransactions[0].hash !== allTransactions[0].hash);
              
              if (hasNewTransactions) {
                console.log('📚 New historical burn transactions detected, updating complete history...');
                fetchBurnHistory(true); // Force fresh fetch
              } else {
                console.log('📊 No new transactions in historical dataset, keeping current display');
              }
            }
          } catch (error) {
            console.warn('⚠️ Error checking for new historical transactions:', error);
          }
        };
        
        checkForNewData();
      }
    }, 60 * 1000); // 60 seconds to match burn tracker frequency
    
    return () => clearInterval(interval);
  }, [fetchBurnHistory, allTransactions]);

  // Update time display every minute to refresh "time ago" calculations without animation
  useEffect(() => {
    const timeInterval = setInterval(() => {
      forceTimeUpdate(prev => prev + 1);
    }, 60000); // Update every minute

    return () => clearInterval(timeInterval);
  }, []);

  // Pagination component
  const PaginationControls = () => {
    const getPageNumbers = () => {
      const pages = [];
      const maxVisible = 5;
      
      if (totalPages <= maxVisible) {
        for (let i = 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        const start = Math.max(1, currentPage - 2);
        const end = Math.min(totalPages, start + maxVisible - 1);
        
        for (let i = start; i <= end; i++) {
          pages.push(i);
        }
      }
      
      return pages;
    };

    return (
      <div className="flex items-center justify-center space-x-2 mt-6">
        <button
          onClick={() => setCurrentPage(1)}
          disabled={currentPage === 1}
          className="p-2 rounded-md bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white"
        >
          <ChevronsLeft className="h-4 w-4" />
        </button>
        
        <button
          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="p-2 rounded-md bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        
        {getPageNumbers().map(page => (
          <button
            key={page}
            onClick={() => setCurrentPage(page)}
            className={`px-3 py-2 rounded-md ${
              currentPage === page 
                ? 'bg-orange-600 text-white' 
                : 'bg-gray-700 hover:bg-gray-600 text-white'
            }`}
          >
            {page}
          </button>
        ))}
        
        <button
          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="p-2 rounded-md bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
        
        <button
          onClick={() => setCurrentPage(totalPages)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-md bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white"
        >
          <ChevronsRight className="h-4 w-4" />
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center">
                <History className="h-8 w-8 text-orange-500 mr-3" />
                SHIB Burn History
              </h1>
              <p className="text-gray-400 mt-2">
                Complete 5+ year history of ALL Shiba Inu token burn transactions (2020-present)
              </p>
            </div>

          </div>
          
          <div className="mt-4 flex items-center text-sm text-gray-400">
            <span>{filteredTransactions.length} transactions</span>
            <span className="mx-2">•</span>
            <span>
              {formatNumber(filteredTransactions.reduce((sum, tx) => 
                sum + (parseInt(tx.value) / Math.pow(10, 18)), 0
              ))} SHIB total burned
            </span>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8 border border-gray-700">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Filter className="h-4 w-4 inline mr-2" />
                Filter by Destination
              </label>
                              <select
                  value={selectedDestination}
                  onChange={(e) => setSelectedDestination(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="all">All Destinations</option>
                  <option value="0xdead000000000000000042069420694206942069">Vitalik Burn (BA-1)</option>
                  <option value="0x000000000000000000000000000000000000dead">Dead Address (BA-2)</option>
                  <option value="0x0000000000000000000000000000000000000000">Genesis/Black Hole (BA-3)</option>
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
        <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-700 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-white">Burn Transactions</h2>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-400">
                Page {currentPage} of {totalPages}
              </span>
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
                      From
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      $SHIB BURNED
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      To
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
                  {/* 🚨 DEBUG: Log table rendering state */}
                  {console.log(`🔍 TABLE RENDER: Attempting to render ${currentTransactions.length} transactions, loading=${loading}`)}
                  {currentTransactions.map((tx) => (
                    <tr key={tx.hash} className="hover:bg-gray-750 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-300 font-mono">
                          {truncateAddress(tx.from)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-white">
                          {formatShibAmount(tx.value)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-orange-400 font-medium">
                          {getBurnDestinationName(tx.to)}
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
                          className="text-blue-400 hover:text-blue-300 transition-colors"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </td>
                    </tr>  
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {!loading && filteredTransactions.length > 0 && <PaginationControls />}
        </div>

        {/* Summary Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <History className="h-8 w-8 text-orange-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Total Transactions</p>
                <p className="text-2xl font-semibold text-white">
                  {filteredTransactions.length.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ExternalLink className="h-8 w-8 text-orange-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Total SHIB Burned</p>
                <p className="text-2xl font-semibold text-white">
                  {formatNumber(filteredTransactions.reduce((sum, tx) => 
                    sum + (parseInt(tx.value) / Math.pow(10, 18)), 0
                  ))}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Filter className="h-8 w-8 text-orange-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Current Filter</p>
                <p className="text-2xl font-semibold text-white">
                  {selectedDestination === 'all' ? 'All' : getBurnDestinationName(selectedDestination)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 