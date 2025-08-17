'use client';

import { useState, useEffect } from 'react';
import { Flame, Filter, Calendar, Search, TrendingUp } from 'lucide-react';
import BurnTransactionTable from '../../components/BurnTransactionTable';
import RefreshButton from '../../components/RefreshButton';

interface BurnTransaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  timeStamp: string;
  blockNumber: string;
  tokenName?: string;
  tokenSymbol?: string;
  tokenDecimal?: string;
}

interface HistoricalBurnsResponse {
  transactions: BurnTransaction[];
  pagination: {
    page: number;
    limit: number;
    totalTransactions: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  filters: {
    address?: string;
    startDate?: string;
    endDate?: string;
  };
  metadata: {
    dataSource: string;
    lastSync?: string;
    addressCounts?: Record<string, number>;
  };
  timestamp: string;
  cached: boolean;
  source: string;
}

const BURN_ADDRESSES = [
  { value: 'all', label: 'All Addresses', color: 'text-white' },
  { value: '0xdead000000000000000042069420694206942069', label: 'BA-1 (Vitalik Burn)', color: 'text-orange-400' },
  { value: '0x000000000000000000000000000000000000dead', label: 'BA-2 (Dead Address)', color: 'text-red-400' },
  { value: '0x0000000000000000000000000000000000000000', label: 'BA-3 (Genesis/Black Hole)', color: 'text-purple-400' },
  { value: '0x95ad61b0a150d79219dcf64e1e6cc01f0b64c4ce', label: 'CA (Community Address)', color: 'text-blue-400' }
];

export default function BurnHistoryClient() {
  const [data, setData] = useState<HistoricalBurnsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [selectedAddress, setSelectedAddress] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Fetch historical burn data
  const fetchBurnHistory = async (page = 1, limit = 50, address = 'all', start = '', end = '') => {
    try {
      setLoading(true);
      setError(null);
      
      // Build query parameters
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      
      if (address !== 'all') {
        params.append('address', address);
      }
      
      if (start) {
        params.append('startDate', start);
      }
      
      if (end) {
        params.append('endDate', end);
      }

      console.log('🔍 Fetching burn history:', params.toString());
      
      // For recent data (first page, no filters), use the same API as homepage for consistency
      const isRecentDataRequest = page === 1 && address === 'all' && !start && !end;
      
      let response;
      if (isRecentDataRequest) {
        console.log('📊 Fetching recent data using homepage API for consistency...');
        response = await fetch('/api/burns');
      } else {
        // For historical/filtered data, try comprehensive APIs
        console.log('📚 Fetching historical/filtered data...');
        response = await fetch(`/api/historical/dataset?${params}`);
        
        // Fallback to burns-history API if dataset not available
        if (!response.ok) {
          console.log('📚 Historical dataset not available, trying burns-history API...');
          response = await fetch(`/api/burns-history?${params}`);
        }
        
        // Final fallback to main burns API
        if (!response.ok) {
          console.log('📊 Falling back to main burns API...');
          response = await fetch('/api/burns');
        }
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch burn history: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      
      // Normalize response format between different APIs
      const normalizedData: HistoricalBurnsResponse = {
        transactions: result.transactions || [],
        pagination: result.pagination || {
          page: 1,
          limit: result.transactions?.length || 0,
          totalTransactions: result.transactions?.length || 0,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false
        },
        filters: result.filters || { address },
        metadata: result.metadata || {
          dataSource: result.source || 'unknown',
          lastSync: result.lastUpdated || result.timestamp,
          addressCounts: result.addressCounts
        },
        timestamp: result.timestamp || new Date().toISOString(),
        cached: result.cached || false,
        source: result.source || 'historical-api'
      };

      setData(normalizedData);
      console.log('✅ Burn history loaded:', normalizedData.transactions.length, 'transactions');
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('❌ Failed to fetch burn history:', errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchBurnHistory(currentPage, pageSize, selectedAddress, startDate, endDate);
  }, []);

  // Handle filter changes
  const handleFilterChange = () => {
    setCurrentPage(1); // Reset to first page when filters change
    fetchBurnHistory(1, pageSize, selectedAddress, startDate, endDate);
  };

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    fetchBurnHistory(newPage, pageSize, selectedAddress, startDate, endDate);
  };

  // Filter transactions by search term (client-side)
  const filteredTransactions = data?.transactions.filter(tx => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      tx.hash.toLowerCase().includes(search) ||
      tx.from.toLowerCase().includes(search) ||
      tx.to.toLowerCase().includes(search) ||
      tx.blockNumber.includes(search)
    );
  }) || [];

  // Calculate total burned amount for current view
  const totalBurnedInView = filteredTransactions.reduce((sum, tx) => {
    const amount = parseFloat(tx.value) / Math.pow(10, 18);
    return sum + amount;
  }, 0);

  const formatBurnAmount = (amount: number): string => {
    if (amount >= 1_000_000_000) {
      return `${(amount / 1_000_000_000).toFixed(2)}B`;
    } else if (amount >= 1_000_000) {
      return `${(amount / 1_000_000).toFixed(2)}M`;
    } else if (amount >= 1_000) {
      return `${(amount / 1_000).toFixed(2)}K`;
    }
    return amount.toFixed(2);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Flame className="h-12 w-12 text-orange-500" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
              SHIB Burn History
            </h1>
          </div>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Complete historical record of all SHIB token burns. Explore transactions across all burn addresses with advanced filtering and search capabilities.
          </p>
        </div>

        {/* Summary Stats */}
        {data && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
              <div className="flex items-center gap-3 mb-2">
                <Flame className="h-6 w-6 text-orange-500" />
                <h3 className="text-lg font-semibold text-white">Total Transactions</h3>
              </div>
              <p className="text-3xl font-bold text-orange-400">
                {data.pagination.totalTransactions.toLocaleString()}
              </p>
            </div>
            
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="h-6 w-6 text-green-500" />
                <h3 className="text-lg font-semibold text-white">Current View</h3>
              </div>
              <p className="text-3xl font-bold text-green-400">
                {filteredTransactions.length.toLocaleString()}
              </p>
            </div>
            
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
              <div className="flex items-center gap-3 mb-2">
                <Flame className="h-6 w-6 text-red-500" />
                <h3 className="text-lg font-semibold text-white">Burned (View)</h3>
              </div>
              <p className="text-3xl font-bold text-red-400">
                {formatBurnAmount(totalBurnedInView)} SHIB
              </p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 mb-8 border border-gray-700/50">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="h-5 w-5 text-blue-400" />
            <h2 className="text-xl font-semibold text-white">Filters & Search</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* Address Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Burn Address</label>
              <select
                value={selectedAddress}
                onChange={(e) => setSelectedAddress(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                {BURN_ADDRESSES.map(addr => (
                  <option key={addr.value} value={addr.value}>
                    {addr.label}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Start Date */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            
            {/* End Date */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            
            {/* Page Size */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Per Page</label>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={200}>200</option>
              </select>
            </div>
          </div>
          
          {/* Search */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">Search Transactions</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by hash, address, or block number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>
          
          {/* Filter Actions */}
          <div className="flex gap-4">
            <button
              onClick={handleFilterChange}
              disabled={loading}
              className="px-6 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 text-white font-medium rounded-lg transition-colors"
            >
              Apply Filters
            </button>
            
            <button
              onClick={() => {
                setSelectedAddress('all');
                setStartDate('');
                setEndDate('');
                setSearchTerm('');
                setCurrentPage(1);
                fetchBurnHistory(1, pageSize, 'all', '', '');
              }}
              disabled={loading}
              className="px-6 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-500 text-white font-medium rounded-lg transition-colors"
            >
              Clear All
            </button>
            
            <RefreshButton
              onRefresh={() => fetchBurnHistory(currentPage, pageSize, selectedAddress, startDate, endDate)}
              loading={loading}
            />
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-900/50 backdrop-blur-sm rounded-xl p-6 mb-8 border border-red-700/50">
            <div className="flex items-center gap-2 text-red-400">
              <Flame className="h-5 w-5" />
              <h3 className="text-lg font-semibold">Error Loading Burn History</h3>
            </div>
            <p className="text-red-300 mt-2">{error}</p>
            <button
              onClick={() => fetchBurnHistory(currentPage, pageSize, selectedAddress, startDate, endDate)}
              className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* Data Source Info */}
        {data && (
          <div className="bg-blue-900/20 backdrop-blur-sm rounded-xl p-4 mb-6 border border-blue-700/30">
            <div className="flex items-center justify-between text-sm text-blue-300">
              <span>Data Source: {data.metadata.dataSource}</span>
              <span>Last Updated: {new Date(data.timestamp).toLocaleString()}</span>
              {data.cached && <span className="text-green-400">✓ Cached</span>}
              {currentPage === 1 && selectedAddress === 'all' && !startDate && !endDate && (
                <span className="text-orange-400">🏠 Same as Homepage</span>
              )}
            </div>
          </div>
        )}

        {/* Transactions Table */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Flame className="h-6 w-6 text-orange-500" />
              Burn Transactions
            </h2>
            
            {data && (
              <div className="text-sm text-gray-400">
                Showing {((currentPage - 1) * pageSize) + 1}-{Math.min(currentPage * pageSize, filteredTransactions.length)} of {data.pagination.totalTransactions} transactions
              </div>
            )}
          </div>

          <BurnTransactionTable 
            transactions={filteredTransactions} 
            loading={loading}
          />
        </div>

        {/* Pagination */}
        {data && data.pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 mb-8">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={!data.pagination.hasPreviousPage || loading}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-500 text-white font-medium rounded-lg transition-colors"
            >
              Previous
            </button>
            
            <span className="text-white">
              Page {currentPage} of {data.pagination.totalPages}
            </span>
            
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={!data.pagination.hasNextPage || loading}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-500 text-white font-medium rounded-lg transition-colors"
            >
              Next
            </button>
          </div>
        )}

        {/* Back to Homepage */}
        <div className="text-center">
          <a
            href="/"
            className="inline-flex items-center px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-colors shadow-lg"
          >
            <Flame className="h-5 w-5 mr-2" />
            Back to SHIB Metrics
          </a>
        </div>
      </div>
    </div>
  );
}
