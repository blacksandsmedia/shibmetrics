// API route for burn transactions

interface EtherscanTx {
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

// SHIB contract and burn addresses
const SHIB_CONTRACT_ADDRESS = '0x95ad61b0a150d79219dcfc64e1e6cc01f0b64c4ce';
const BURN_ADDRESSES = {
  'Community Address': '0x95ad61b0a150d79219dcf64e1e6cc01f0b64c4ce',
  'Vitalik Burn Alt': '0xdead000000000000000042069420694206942069',
  'Dead Address 1': '0x000000000000000000000000000000000000dead',
  'Null Address': '0x0000000000000000000000000000000000000000',
};

// In-memory cache for 2-minute caching
let cache: {
  data: EtherscanTx[] | null;
  timestamp: number;
} = {
  data: null,
  timestamp: 0
};

const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes

// NO DUMMY DATA - Only use real cached data from last 2 minutes

async function fetchRealBurnTransactions(): Promise<EtherscanTx[]> {
  const apiKey = process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY;
  
  if (!apiKey || apiKey === 'YourEtherscanApiKeyHere') {
    throw new Error('No valid Etherscan API key configured');
  }

  console.log('🔥 Fetching real SHIB burn transactions from Etherscan...');
  
  // Look for burn transactions TO burn addresses, not FROM community address
  const burnAddresses = [
    '0xdead000000000000000042069420694206942069', // Vitalik Burn Alt
    '0x000000000000000000000000000000000000dead', // Dead Address 1  
    '0x0000000000000000000000000000000000000000', // Null Address
  ];
  
  const allTransactions: EtherscanTx[] = [];
  
  // Fetch transactions TO burn addresses (actual burns)
  for (const burnAddress of burnAddresses) {
    try {
      const requestUrl = `https://api.etherscan.io/api?module=account&action=tokentx&contractaddress=${SHIB_CONTRACT_ADDRESS}&address=${burnAddress}&page=1&offset=20&sort=desc&apikey=${apiKey}`;
      
      const response = await fetch(requestUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        console.log(`⚠️ HTTP error ${response.status} for ${burnAddress}`);
        continue; // Try next address
      }

      const data = await response.json();
      
      if (data.status === '1' && data.result && Array.isArray(data.result)) {
        // Filter for actual burn transactions (incoming to burn address)
        const transactions = data.result
          .filter((tx: EtherscanTx) => tx.to && tx.to.toLowerCase() === burnAddress.toLowerCase())
          .slice(0, 10) // Take top 10 most recent
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
        console.log(`✅ Found ${transactions.length} burn transactions to ${burnAddress}`);
      }
      
      // Rate limiting delay
      await new Promise(resolve => setTimeout(resolve, 200));
      
    } catch (error) {
      console.error(`❌ Error fetching burns to ${burnAddress}:`, error);
      continue; // Try next address
    }
  }
  
  if (allTransactions.length === 0) {
    throw new Error('No burn transactions found from Etherscan API');
  }
  
  // Sort by timestamp (most recent first) and return top 20
  allTransactions.sort((a, b) => parseInt(b.timeStamp) - parseInt(a.timeStamp));
  
  console.log(`✅ Successfully processed ${allTransactions.length} real burn transactions`);
  return allTransactions.slice(0, 20);
}

export async function GET() {
  const now = Date.now();
  
  try {
    
    // Check cache first (2-minute cache)
    if (cache.data && (now - cache.timestamp) < CACHE_DURATION) {
      console.log('🚀 Returning cached burn transactions');
      return new Response(JSON.stringify({
        transactions: cache.data,
        cached: true,
        timestamp: new Date().toISOString()
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

    console.log(`✅ Successfully returned ${transactions.length} real burn transactions`);
    
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
    
    // NO DUMMY DATA - Only return cached data if within 2 minutes, otherwise error
    if (cache.data && (now - cache.timestamp) < CACHE_DURATION) {
      console.log('⚠️ Using cached data due to API error');
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
    
    // No recent cached data available - return error
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