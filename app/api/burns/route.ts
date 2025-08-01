// API route for SHIB burn transactions - SMART BACKGROUND REFRESH SYSTEM

import { loadBurnCache, saveBurnCache, EtherscanTx } from '../../../lib/burn-cache';
import { saveBurnsCache } from '../../../lib/shared-cache';

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
      let addressSuccess = false;
      const maxRetries = 3;
      
      for (let attempt = 1; attempt <= maxRetries && !addressSuccess; attempt++) {
        try {
          const requestUrl = `https://api.etherscan.io/api?module=account&action=tokentx&contractaddress=${SHIB_CONTRACT_ADDRESS}&address=${burnAddr.address}&page=1&offset=100&sort=desc&apikey=${apiKey}`;
          
          console.log(`🔥 Background refresh: Fetching from ${burnAddr.name} (attempt ${attempt}/${maxRetries})...`);
          
          const response = await fetch(requestUrl, {
            method: 'GET',
            headers: { 'Accept': 'application/json' },
            signal: AbortSignal.timeout(15000) // 15 second timeout
          });

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }

          const data = await response.json();
          console.log(`📊 ${burnAddr.name}: status=${data.status}, results=${data.result?.length || 0}, message="${data.message || 'none'}"`);
          
          // Check for Etherscan API errors
          if (data.status === '0' && data.message && data.message.includes('rate limit')) {
            console.log(`⚠️ Rate limit hit for ${burnAddr.name}, waiting longer...`);
            await new Promise(resolve => setTimeout(resolve, 5000));
            continue; // Retry
          }
          
          // Include results even if status is '0' but we have valid transaction data
          if (data.result && Array.isArray(data.result) && data.result.length > 0) {
            const transactions = data.result
              .filter((tx: EtherscanTx) => {
                const matches = tx.to?.toLowerCase() === burnAddr.address.toLowerCase();
                if (!matches) {
                  console.log(`🔍 Filtering out non-matching tx: ${tx.hash} (to: ${tx.to})`);
                }
                return matches;
              })
              .slice(0, 100)
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
            addressSuccess = true;
            console.log(`✅ Found ${transactions.length} burns to ${burnAddr.name} (filtered from ${data.result.length} total) - Status: ${data.status}`);
          } else if (data.status === '1' && (!data.result || data.result.length === 0)) {
            // No transactions for this address, but API call was successful
            console.log(`ℹ️ ${burnAddr.name}: No transactions found (but API call successful)`);
            successCount++;
            addressSuccess = true;
          } else {
            console.log(`⚠️ ${burnAddr.name}: status=${data.status}, message=${data.message || 'No message'}, results=${data.result?.length || 0}`);
            if (attempt === maxRetries) {
              console.log(`❌ ${burnAddr.name}: Max retries reached, marking as failed`);
            }
          }
          
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          console.log(`❌ Background refresh error for ${burnAddr.name} (attempt ${attempt}/${maxRetries}): ${errorMessage}`);
          
          if (attempt < maxRetries) {
            const backoffDelay = attempt * 2000; // Exponential backoff: 2s, 4s, 6s
            console.log(`⏳ Waiting ${backoffDelay}ms before retry...`);
            await new Promise(resolve => setTimeout(resolve, backoffDelay));
          }
        }
      }
      
      // Rate limiting delay between addresses (even after failure)
      if (burnAddresses.indexOf(burnAddr) < burnAddresses.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    // Sort all transactions by timestamp (most recent first) and remove duplicates
    const uniqueTransactions = Array.from(
      new Map(allTransactions.map(tx => [tx.hash, tx])).values()
    ).sort((a, b) => parseInt(b.timeStamp) - parseInt(a.timeStamp))
     .slice(0, 400); // Increase from previous limit to show more history

    console.log(`✅ Background refresh complete: ${uniqueTransactions.length} unique transactions from ${successCount}/${burnAddresses.length} addresses`);
    
    // Log address breakdown for debugging
    const addressBreakdown = burnAddresses.map(addr => ({
      name: addr.name,
      txCount: uniqueTransactions.filter(tx => tx.to?.toLowerCase() === addr.address.toLowerCase()).length
    }));
    console.log('📊 Address breakdown:', addressBreakdown);
    
    // Save to both cache systems for compatibility
    const cacheData = {
      transactions: uniqueTransactions,
      lastUpdated: Date.now(),
      source: 'etherscan-background',
      totalAddressesSuccess: successCount,
      totalAddressesAttempted: burnAddresses.length
    };
    
    saveBurnCache(cacheData);
    saveBurnsCache(cacheData);
    
  } catch (error) {
    console.error('❌ Background refresh failed:', error);
  }
}

export async function GET(request: Request) {
  console.log('🚀 Smart burn API - serving with background refresh...');
  
  try {
    const url = new URL(request.url);
    const forceRefresh = url.searchParams.get('force') === 'true';
    
    // Load existing cache (prioritize old system for compatibility, unless force refresh)
    const burnCache = forceRefresh ? null : loadBurnCache();
    
    // Check if cache needs refresh (older than 3 minutes or force requested)
    const needsRefresh = forceRefresh || !burnCache || (Date.now() - burnCache.lastUpdated) > (3 * 60 * 1000);
    
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