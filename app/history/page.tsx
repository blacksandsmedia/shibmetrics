'use client';

import { useState, useEffect } from 'react';
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

// SHIB burn destination addresses
const BURN_DESTINATIONS = {
  '0x95ad61b0a150d79219dcf64e1e6cc01f0b64c4ce': 'CA', // Community Address
  '0xdead000000000000000042069420694206942069': 'BA-1', // Vitalik Burn Alt
  '0x000000000000000000000000000000000000dead': 'BA-2', // Dead Address
  '0x0000000000000000000000000000000000000000': 'BA-3', // Null Address  
  '0xd7b7df10cb1dc2d1d15e7d00bcb244a7cfac61cc': 'VB-Original', // Original Vitalik burn address
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

  // Fetch real burn transaction data (no fake data)
  const fetchBurnHistory = async () => {
    setLoading(true);
    try {
      console.log('🔥 Fetching real burn history...');
      
      const response = await fetch('/api/burns', {
        cache: 'no-cache',
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('📊 Response status:', response.status, response.statusText);
      console.log('📊 Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Response Error:', errorText);
        throw new Error(`API error: ${response.status} ${response.statusText} - ${errorText}`);
      }
      
      const data = await response.json();
      console.log('📊 API Response:', {
        hasTransactions: !!(data.transactions),
        transactionCount: data.transactions?.length || 0,
        sampleData: data.transactions?.slice(0, 2) || [],
        fullKeys: Object.keys(data)
      });
      
      if (data.transactions && Array.isArray(data.transactions)) {
        // Filter out zero-value transactions and transactions with invalid values
        const validTransactions = data.transactions.filter((tx: BurnTransaction) => {
          try {
            const bigIntValue = BigInt(tx.value || '0');
            return bigIntValue > BigInt(0); // Only include transactions with positive values
          } catch {
            console.log('Invalid transaction value:', tx.value);
            return false;
          }
        });
        
        console.log(`✅ Loaded ${validTransactions.length} valid burn transactions (filtered out ${data.transactions.length - validTransactions.length} zero/invalid value transactions)`);
        setAllTransactions(validTransactions);
        
        if (validTransactions.length === 0) {
          console.warn('⚠️ No valid transactions after filtering!');
        }
      } else {
        console.error('⚠️ No transactions in API response, data structure:', data);
        setAllTransactions([]);
      }
      
      setLastUpdated(new Date());
    } catch (error) {
      console.error('❌ Error fetching burn history:', error);
      console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack');
      // Set empty array but don't fail silently
      setAllTransactions([]);
    } finally {
      console.log('🏁 Fetch completed, setting loading to false');
      setLoading(false);
    }
  };



  // Filter and sort transactions
  useEffect(() => {
    let filtered = [...allTransactions];
    
    // Filter by destination
    if (selectedDestination !== 'all') {
      filtered = filtered.filter(tx => tx.to.toLowerCase() === selectedDestination.toLowerCase());
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
  }, []);

  // Auto-refresh every 5 minutes to keep data current
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('🔄 Auto-refreshing history data...');
      fetchBurnHistory();
    }, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
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
                Complete history of all Shiba Inu token burn transactions
              </p>
            </div>
            <button
              onClick={fetchBurnHistory}
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
            <span>{filteredTransactions.length} transactions</span>
            <span className="mx-2">•</span>
            <span>
              {formatNumber(filteredTransactions.reduce((sum, tx) => 
                sum + (parseInt(tx.value) / Math.pow(10, 18)), 0
              ))} SHIB total
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
                  <option value="0x95ad61b0a150d79219dcf64e1e6cc01f0b64c4ce">Community Address (CA)</option>
                  <option value="0xdead000000000000000042069420694206942069">Vitalik Burn Alt (BA-1)</option>
                  <option value="0x000000000000000000000000000000000000dead">Dead Address (BA-2)</option>
                  <option value="0x0000000000000000000000000000000000000000">Null Address (BA-3)</option>
                  <option value="0xd7b7df10cb1dc2d1d15e7d00bcb244a7cfac61cc">Original Vitalik Burn</option>
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
                      $SHIB Burnt
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      To
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
          {!loading && totalPages > 1 && <PaginationControls />}
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