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

  console.log('🔥 Fetching REAL burn transactions...');
  
  // Fetch transactions TO the main burn address
  const burnAddress = '0xdead000000000000000042069420694206942069';
  const requestUrl = `https://api.etherscan.io/api?module=account&action=tokentx&contractaddress=${SHIB_CONTRACT_ADDRESS}&address=${burnAddress}&page=1&offset=10&sort=desc&apikey=${apiKey}`;
  
  console.log(`🔥 Requesting: ${requestUrl.replace(apiKey, 'API_KEY_HIDDEN')}`);
  
  const response = await fetch(requestUrl, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const data = await response.json();
  console.log(`📊 Etherscan response: status=${data.status}, message=${data.message || 'OK'}, results=${data.result?.length || 0}`);
  
  if (data.status !== '1') {
    throw new Error(`Etherscan API error: ${data.message || data.status}`);
  }

  if (!data.result || !Array.isArray(data.result) || data.result.length === 0) {
    throw new Error('No burn transactions found');
  }

  // Take transactions and ensure they're TO the burn address
  const transactions = data.result
    .filter((tx: EtherscanTx) => tx.to?.toLowerCase() === burnAddress.toLowerCase())
    .slice(0, 10)
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
  
  console.log(`✅ Found ${transactions.length} REAL burn transactions, first value: ${transactions[0]?.value}`);
  
  if (transactions.length === 0) {
    throw new Error('No valid burn transactions found after filtering');
  }
  
  return transactions;
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