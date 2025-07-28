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

    // Sequential fetch with staggered delays to avoid rate limits
    for (const burnAddr of burnAddresses) {
      try {
        const requestUrl = `https://api.etherscan.io/api?module=account&action=tokentx&contractaddress=${SHIB_CONTRACT_ADDRESS}&address=${burnAddr.address}&page=1&offset=25&sort=desc&apikey=${apiKey}`;
        
        console.log(`🔥 Background refresh: Fetching from ${burnAddr.name}...`);
        
        const response = await fetch(requestUrl, {
          method: 'GET',
          headers: { 'Accept': 'application/json' },
        });

        if (!response.ok) {
          console.log(`⚠️ HTTP ${response.status} for ${burnAddr.name} - continuing anyway`);
          // Don't skip entirely, try to get data anyway
        }

        const data = await response.json();
        console.log(`📊 ${burnAddr.name}: status=${data.status}, results=${data.result?.length || 0}, message="${data.message || 'none'}"`);
        
        // Include results even if status is '0' but we have valid transaction data
        if (data.result && Array.isArray(data.result) && data.result.length > 0) {
          const transactions = data.result
            .filter((tx: EtherscanTx) => tx.to?.toLowerCase() === burnAddr.address.toLowerCase())
            .slice(0, 25)
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
          console.log(`✅ Found ${transactions.length} burns to ${burnAddr.name} (filtered from ${data.result.length} total) - Status: ${data.status}`);
        } else {
          console.log(`⚠️ ${burnAddr.name}: status=${data.status}, message=${data.message || 'No message'}, results=${data.result?.length || 0}`);
        }
        
        // Rate limiting delay between requests - increased to avoid timeouts
        await new Promise(resolve => setTimeout(resolve, 1200));
        
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.log(`❌ Background refresh error for ${burnAddr.name}: ${errorMessage}`);
        // Continue to next address instead of breaking the whole process
      }
    }

    // Sort all transactions by timestamp (most recent first) and remove duplicates
    const uniqueTransactions = Array.from(
      new Map(allTransactions.map(tx => [tx.hash, tx])).values()
    ).sort((a, b) => parseInt(b.timeStamp) - parseInt(a.timeStamp))
     .slice(0, 50); // Increase from previous limit to show more history

    console.log(`✅ Background refresh complete: ${uniqueTransactions.length} unique transactions from ${successCount}/${burnAddresses.length} addresses`);
    
    // Save to cache
    saveBurnCache({
      transactions: uniqueTransactions,
      lastUpdated: Date.now(),
      source: 'etherscan-background',
      totalAddressesSuccess: successCount,
      totalAddressesAttempted: burnAddresses.length
    });
    
  } catch (error) {
    console.error('❌ Background refresh failed:', error);
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