// API route for SHIB burn transactions - SERVES PRE-FETCHED DATA

import { loadBurnCache, EtherscanTx } from '../../../lib/burn-cache';

// This API now serves pre-fetched data from the scheduled function
// No more live API calls on each request - much faster UX!

export async function GET() {
  console.log('🚀 Serving burn transactions from pre-fetched cache...');
  
  try {
    // Load pre-fetched data from cache
    const burnCache = loadBurnCache();
    
    if (burnCache) {
      console.log(`✅ Serving ${burnCache.transactions.length} transactions from cache (${burnCache.source})`);
      
      return new Response(JSON.stringify({
        transactions: burnCache.transactions,
        cached: true,
        timestamp: new Date().toISOString(),
        source: burnCache.source,
        lastUpdated: new Date(burnCache.lastUpdated).toISOString(),
        addressesSuccess: burnCache.totalAddressesSuccess,
        addressesAttempted: burnCache.totalAddressesAttempted
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=60'
        },
      });
    } else {
      // No cached data available
      console.log('⚠️ No cached burn data available');
      
      return new Response(JSON.stringify({
        error: 'Burn data temporarily unavailable',
        message: 'The scheduled data update is in progress. Please try again in a moment.',
        timestamp: new Date().toISOString(),
        retryAfter: 30
      }), {
        status: 503, // Service Unavailable
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store',
          'Retry-After': '30'
        },
      });
    }
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Burns API error:', errorMessage);
    
    return new Response(JSON.stringify({
      error: 'Unable to load burn transactions',
      message: errorMessage,
      timestamp: new Date().toISOString()
    }), {
      status: 500, // Internal Server Error
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store'
      },
    });
  }
} 