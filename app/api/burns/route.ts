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

// Fallback sample data for when Etherscan API is unavailable
const SAMPLE_TRANSACTIONS: EtherscanTx[] = [
  {
    hash: "0x4d25b1474a0072ccd0f52ef9c9f78625b3089afefd579850e9d8cfb12b8dcb52",
    from: "0x0181518cd7867efc60b0af623e2d56e1c386f990",
    to: "0x95ad61b0a150d79219dcf64e1e6cc01f0b64c4ce",
    value: "5348000000000000000000000",
    timeStamp: "1753361015",
    blockNumber: "22989088",
    tokenName: "SHIBA INU",
    tokenSymbol: "SHIB",
    tokenDecimal: "18"
  },
  {
    hash: "0x71749431589bdb699ec21b2a435949247f1b68b49fdb31de775944a4a4c91639",
    from: "0x944dfdf1862b3097daac41e66c3d31769692b53d",
    to: "0x95ad61b0a150d79219dcf64e1e6cc01f0b64c4ce",
    value: "149463609898107700000000",
    timeStamp: "1753332131",
    blockNumber: "22986699",
    tokenName: "SHIBA INU",
    tokenSymbol: "SHIB",
    tokenDecimal: "18"
  },
  {
    hash: "0x3baa077f512960c843285a9edf0f5bd30ba904968e9b408d74062d7ea86e78b9",
    from: "0x1ef3bdcad5ddafc20c1503ab0ec37398e5dbff6e",
    to: "0x95ad61b0a150d79219dcf64e1e6cc01f0b64c4ce",
    value: "2319549012200418849010012",
    timeStamp: "1753228175",
    blockNumber: "22978097",
    tokenName: "SHIBA INU",
    tokenSymbol: "SHIB",
    tokenDecimal: "18"
  }
];

async function fetchRealBurnTransactions(): Promise<EtherscanTx[]> {
  const apiKey = process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY;
  
  if (!apiKey || apiKey === 'YourEtherscanApiKeyHere') {
    console.log('⚠️ No Etherscan API key - using sample data');
    return SAMPLE_TRANSACTIONS;
  }

  console.log('🔥 Fetching real SHIB transactions from Etherscan...');
  
  const communityAddress = '0x95ad61b0a150d79219dcf64e1e6cc01f0b64c4ce';
  
  try {
    const requestUrl = `https://api.etherscan.io/api?module=account&action=tokentx&contractaddress=${SHIB_CONTRACT_ADDRESS}&address=${communityAddress}&page=1&offset=10&sort=desc&apikey=${apiKey}`;
    
    // Get all SHIB transactions involving the community address
    const response = await fetch(requestUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      console.log(`⚠️ HTTP error ${response.status} - falling back to sample data`);
      return SAMPLE_TRANSACTIONS;
    }

    const data = await response.json();
    
    if (data.status === '1' && data.result && Array.isArray(data.result)) {
      // Process all transactions and return the most recent ones
      const transactions = data.result
        .slice(0, 10) // Take top 10 most recent transactions
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
      
      console.log(`✅ Successfully processed ${transactions.length} real SHIB transactions`);
      return transactions;
      
    } else {
      console.log(`⚠️ Etherscan API returned: ${data.status} - ${data.message || 'Unknown error'} - falling back to sample data`);
      return SAMPLE_TRANSACTIONS;
    }
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`❌ Error fetching SHIB transactions: ${errorMessage} - falling back to sample data`);
    return SAMPLE_TRANSACTIONS;
  }
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
        timestamp: new Date().toISOString()
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=60'
        },
      });
    }

    // Fetch fresh data (now with built-in fallback)
    const transactions = await fetchRealBurnTransactions();

    // Update cache
    cache = {
      data: transactions,
      timestamp: now
    };

    const isRealData = transactions.length > 3; // If we got more than 3, likely real data
    const source = isRealData ? 'etherscan-live' : 'fallback-sample';
    
    console.log(`✅ Successfully returned ${transactions.length} burn transactions (${source})`);
    
    return new Response(JSON.stringify({
      transactions: transactions,
      cached: false,
      timestamp: new Date().toISOString(),
      source: source
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=60'
      },
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Burns API unexpected error:', errorMessage);
    
    // This should rarely happen now since fetchRealBurnTransactions has fallback
    return new Response(JSON.stringify({
      transactions: SAMPLE_TRANSACTIONS,
      timestamp: new Date().toISOString(),
      source: 'emergency-fallback'
    }), {
      status: 200, // Return 200 with fallback data instead of 503 error
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=30'
      },
    });
  }
} 