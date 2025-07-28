// API route for SHIB burn transactions - SMART BACKGROUND REFRESH SYSTEM

import { loadBurnCache, saveBurnCache, EtherscanTx } from '../../../lib/burn-cache';

const SHIB_CONTRACT_ADDRESS = '0x95ad61b0a150d79219dcf64e1e6cc01f0b64c4ce';

// Background refresh function - runs async and doesn't block user requests
async function refreshBurnDataInBackground(): Promise<void> {
  const apiKey = process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY;
  if (!apiKey || apiKey === 'YourEtherscanApiKeyHere') {
    console.log('⚠️ No API key for background refresh');
    return;
  }

  try {
    console.log('🔄 Starting background burn data refresh...');
    
    const burnAddresses = [
      { name: 'BA-1 (Vitalik Burn Alt)', address: '0xdead000000000000000042069420694206942069' },
      { name: 'BA-2 (Dead Address 1)', address: '0x000000000000000000000000000000000000dead' },
      { name: 'BA-3 (Null Address)', address: '0x0000000000000000000000000000000000000000' },
      { name: 'CA (Community Address)', address: '0x95ad61b0a150d79219dcf64e1e6cc01f0b64c4ce' }
    ];

    const allTransactions: EtherscanTx[] = [];
    let successCount = 0;

    // Quick parallel fetch from all addresses
    const fetchPromises = burnAddresses.map(async (burnAddr) => {
      try {
        const requestUrl = `https://api.etherscan.io/api?module=account&action=tokentx&contractaddress=${SHIB_CONTRACT_ADDRESS}&address=${burnAddr.address}&page=1&offset=5&sort=desc&apikey=${apiKey}`;
        
        const response = await fetch(requestUrl, {
          method: 'GET',
          headers: { 'Accept': 'application/json' },
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const data = await response.json();
        
        if (data.status === '1' && data.result && Array.isArray(data.result)) {
          const transactions = data.result
            .filter((tx: EtherscanTx) => tx.to?.toLowerCase() === burnAddr.address.toLowerCase())
            .slice(0, 5)
            .map((tx: EtherscanTx) => ({
              hash: tx.hash,
              from: tx.from,
              to: tx.to,
              value: tx.value,
              timeStamp: tx.timeStamp,
              blockNumber: tx.blockNumber,
              tokenName: tx.tokenName || 'SHIBA INU',
              tokenSymbol: tx.tokenSymbol || 'SHIB',
              tokenDecimal: tx.tokenDecimal || '18'
            }));
          
          allTransactions.push(...transactions);
          successCount++;
          return transactions;
        }
        return [];
      } catch (error) {
        console.log(`⚠️ Background refresh failed for ${burnAddr.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        return [];
      }
    });

    await Promise.all(fetchPromises);

    if (allTransactions.length > 0) {
      // Sort and take top transactions
      allTransactions.sort((a, b) => parseInt(b.timeStamp) - parseInt(a.timeStamp));
      const topTransactions = allTransactions.slice(0, 20);

      // Save to cache
      saveBurnCache({
        transactions: topTransactions,
        lastUpdated: Date.now(),
        source: 'background-refresh',
        totalAddressesSuccess: successCount,
        totalAddressesAttempted: burnAddresses.length
      });

      console.log(`✅ Background refresh completed: ${topTransactions.length} transactions from ${successCount}/${burnAddresses.length} addresses`);
    }
  } catch (error) {
    console.error('❌ Background refresh error:', error instanceof Error ? error.message : 'Unknown error');
  }
}

export async function GET() {
  console.log('🚀 Smart burn API - serving with background refresh...');
  
  try {
    // Load existing cache
    const burnCache = loadBurnCache();
    
    // Check if cache needs refresh (older than 3 minutes)
    const needsRefresh = !burnCache || (Date.now() - burnCache.lastUpdated) > (3 * 60 * 1000);
    
    if (needsRefresh) {
      console.log('🔄 Cache stale, triggering background refresh...');
      // Start background refresh (async - doesn't block response)
      refreshBurnDataInBackground().catch(console.error);
    }
    
    if (burnCache) {
      console.log(`✅ Serving ${burnCache.transactions.length} transactions from cache (age: ${Math.round((Date.now() - burnCache.lastUpdated) / 1000)}s)`);
      
      return new Response(JSON.stringify({
        transactions: burnCache.transactions,
        cached: true,
        timestamp: new Date().toISOString(),
        source: burnCache.source,
        lastUpdated: new Date(burnCache.lastUpdated).toISOString(),
        addressesSuccess: burnCache.totalAddressesSuccess,
        addressesAttempted: burnCache.totalAddressesAttempted,
        refreshing: needsRefresh
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=30'
        },
      });
    } else {
      // No cache available - do initial load
      console.log('🔥 No cache found, doing initial data load...');
      await refreshBurnDataInBackground();
      
      // Try to load cache again after initial fetch
      const newCache = loadBurnCache();
      if (newCache) {
        return new Response(JSON.stringify({
          transactions: newCache.transactions,
          cached: false,
          timestamp: new Date().toISOString(),
          source: 'initial-load',
          lastUpdated: new Date(newCache.lastUpdated).toISOString(),
          addressesSuccess: newCache.totalAddressesSuccess,
          addressesAttempted: newCache.totalAddressesAttempted
        }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'public, max-age=30'
          },
        });
      }
      
      // Still no data
      return new Response(JSON.stringify({
        error: 'Burn data temporarily unavailable',
        message: 'Unable to fetch burn data. Please try again in a moment.',
        timestamp: new Date().toISOString(),
        retryAfter: 30
      }), {
        status: 503,
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
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store'
      },
    });
  }
} 