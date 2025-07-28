// API route for SHIB burn transactions - SIMPLIFIED VERSION THAT WORKS

const SHIB_CONTRACT_ADDRESS = '0x95ad61b0a150d79219dcf64e1e6cc01f0b64c4ce';

interface EtherscanTx {
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

// In-memory cache for 2-minute caching
let cache: {
  data: EtherscanTx[] | null;
  timestamp: number;
} = {
  data: null,
  timestamp: 0
};

const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes

async function fetchRealBurnTransactions(): Promise<EtherscanTx[]> {
  const apiKey = process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY;
  
  if (!apiKey || apiKey === 'YourEtherscanApiKeyHere') {
    throw new Error('No valid Etherscan API key configured');
  }

  console.log('🔥 Fetching REAL burn transactions from ALL burn addresses...');
  
  // All burn addresses to check
  const burnAddresses = [
    { name: 'BA-1 (Vitalik Burn Alt)', address: '0xdead000000000000000042069420694206942069' },
    { name: 'BA-2 (Dead Address 1)', address: '0x000000000000000000000000000000000000dead' },
    { name: 'BA-3 (Null Address)', address: '0x0000000000000000000000000000000000000000' },
    { name: 'CA (Community Address)', address: '0x95ad61b0a150d79219dcf64e1e6cc01f0b64c4ce' }
  ];
  
  console.log('🔥 Making PARALLEL API calls to all burn addresses...');
  
  // Make all API calls in parallel for better performance
  const fetchPromises = burnAddresses.map(async (burnAddr) => {
    try {
      const requestUrl = `https://api.etherscan.io/api?module=account&action=tokentx&contractaddress=${SHIB_CONTRACT_ADDRESS}&address=${burnAddr.address}&page=1&offset=6&sort=desc&apikey=${apiKey}`;
      
      console.log(`🔥 Fetching from ${burnAddr.name}...`);
      
      const response = await fetch(requestUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        console.log(`⚠️ HTTP ${response.status} for ${burnAddr.name}`);
        return { burnAddr, transactions: [] };
      }

      const data = await response.json();
      console.log(`📊 ${burnAddr.name}: status=${data.status}, results=${data.result?.length || 0}`);
      
      if (data.status === '1' && data.result && Array.isArray(data.result)) {
        // Take transactions TO this burn address
        const transactions = data.result
          .filter((tx: EtherscanTx) => tx.to?.toLowerCase() === burnAddr.address.toLowerCase())
          .slice(0, 6)
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
        
        console.log(`✅ Found ${transactions.length} burns to ${burnAddr.name} (filtered from ${data.result.length} total)`);
        return { burnAddr, transactions };
      } else {
        console.log(`⚠️ ${burnAddr.name}: status=${data.status}, message=${data.message || 'No message'}, results=${data.result?.length || 0}`);
        return { burnAddr, transactions: [] };
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`❌ Error fetching from ${burnAddr.name}: ${errorMessage}`);
      return { burnAddr, transactions: [] };
    }
  });

  // Wait for all API calls to complete
  const results = await Promise.all(fetchPromises);
  
  // Combine all transactions
  const allTransactions: EtherscanTx[] = [];
  results.forEach(result => {
    allTransactions.push(...result.transactions);
  });
  
  if (allTransactions.length === 0) {
    throw new Error('No burn transactions found from any burn address');
  }
  
  // Sort all transactions by timestamp (most recent first) and take top 15
  allTransactions.sort((a, b) => parseInt(b.timeStamp) - parseInt(a.timeStamp));
  const finalTransactions = allTransactions.slice(0, 15);
  
  console.log(`✅ Combined ${finalTransactions.length} REAL burn transactions from all addresses`);
  
  return finalTransactions;
}

export async function GET() {
  try {
    const now = Date.now();
    
    // Check cache first (2-minute cache)
    if (cache.data && (now - cache.timestamp) < CACHE_DURATION) {
      console.log('🚀 Returning cached burn transactions');
      return new Response(JSON.stringify({
        transactions: cache.data,
        cached: true,
        timestamp: new Date().toISOString(),
        source: 'etherscan-cached'
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=60'
        },
      });
    }

    // Fetch fresh data
    const transactions = await fetchRealBurnTransactions();
    
    // Update cache
    cache = {
      data: transactions,
      timestamp: now
    };

    console.log(`✅ Successfully returned ${transactions.length} REAL burn transactions`);
    
    return new Response(JSON.stringify({
      transactions: transactions,
      cached: false,
      timestamp: new Date().toISOString(),
      source: 'etherscan-live'
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=60'
      },
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Burns API error:', errorMessage);
    
    const now = Date.now();
    
    // Only use cached data if it's within 2 minutes
    if (cache.data && (now - cache.timestamp) < CACHE_DURATION) {
      console.log('⚠️ Using recent cached data due to API error');
      return new Response(JSON.stringify({
        transactions: cache.data,
        cached: true,
        timestamp: new Date().toISOString(),
        source: 'etherscan-cached-fallback'
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=30'
        },
      });
    }
    
    // No valid cached data - return error
    return new Response(JSON.stringify({
      error: 'Unable to fetch burn transactions',
      message: errorMessage,
      timestamp: new Date().toISOString()
    }), {
      status: 503, // Service Unavailable
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store'
      },
    });
  }
} 