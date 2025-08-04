'use client';

import { useState, useEffect } from 'react';
import { BurnTransaction, formatBurnAmount, formatTimeAgo } from '@/lib/api';
import { ExternalLink } from 'lucide-react';

interface BurnTransactionTableProps {
  transactions: BurnTransaction[];
  loading?: boolean;
}

export default function BurnTransactionTable({ transactions, loading = false }: BurnTransactionTableProps) {
  // Force re-render every minute to update "time ago" values dynamically
  const [, forceUpdate] = useState(0);

  // Update component every minute to refresh "time ago" calculations without animation
  useEffect(() => {
    const interval = setInterval(() => {
      forceUpdate(prev => prev + 1);
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);
  // Deduplicate transactions by hash to avoid React key conflicts
  const uniqueTransactions = transactions.reduce((acc, current) => {
    const existingIndex = acc.findIndex(tx => tx.hash === current.hash);
    if (existingIndex === -1) {
      acc.push(current);
    }
    return acc;
  }, [] as BurnTransaction[]);

  const getBurnAddressName = (address: string) => {
    // Import BURN_ADDRESSES and use proper names matching shibburn.com
    const burnAddresses = {
      '0x95ad61b0a150d79219dcf64e1e6cc01f0b64c4ce': 'CA', // Community Address - matches shibburn.com
      '0xdead000000000000000042069420694206942069': 'BA-1', // Burn Address 1 - matches shibburn.com
      '0x000000000000000000000000000000000000dead': 'BA-2', // Burn Address 2 - matches shibburn.com  
      '0x0000000000000000000000000000000000000000': 'BA-3', // Burn Address 3 (Black Hole) - matches shibburn.com
      '0xd7b7df10cb1dc2d1d15e7d00bcb244a7cfac61cc': 'Vitalik Original' // Original Vitalik address
    };
    
    const lowerAddress = address.toLowerCase();
    return burnAddresses[lowerAddress as keyof typeof burnAddresses] || 'Unknown';
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (loading) {
    return (
      <div className="p-6">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center space-x-4 py-3">
            <div className="h-4 bg-gray-700 rounded w-20 animate-pulse"></div>
            <div className="h-4 bg-gray-700 rounded w-32 animate-pulse"></div>
            <div className="h-4 bg-gray-700 rounded w-16 animate-pulse"></div>
            <div className="h-4 bg-gray-700 rounded w-24 animate-pulse"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-750">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                $SHIB BURNED
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                From
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
            {uniqueTransactions.map((tx, index) => (
              <tr key={`${tx.hash}-${index}`} className="hover:bg-gray-750 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm font-medium text-white">
                    🔥 {formatBurnAmount(
                      (tx.value && !isNaN(parseInt(tx.value))) 
                        ? parseInt(tx.value) / Math.pow(10, 18) 
                        : 0
                    )}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-300">
                    {formatAddress(tx.from)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-orange-400 font-medium">
                    {getBurnAddressName(tx.to)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-300">
                    {/* formatTimeAgo will use current Date.now() - currentTime state triggers re-renders */}
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
        {uniqueTransactions.length === 0 && !loading && (
          <div className="px-6 py-8 text-center">
            <p className="text-gray-400">No burn transactions found</p>
          </div>
        )}
      </div>
    );
} 