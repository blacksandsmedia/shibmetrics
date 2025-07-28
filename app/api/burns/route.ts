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

async function fetchRealBurnTransactions(): Promise<EtherscanTx[]> {
  const apiKey = process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY;
  
  console.log('🔍 Debug - API Key:', apiKey ? `${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length-4)}` : 'NOT SET');
  
  if (!apiKey || apiKey === 'YourEtherscanApiKeyHere') {
    throw new Error('No valid Etherscan API key configured');
  }

  console.log('🔥 Fetching real SHIB transactions from Etherscan...');
  
  const communityAddress = '0x95ad61b0a150d79219dcf64e1e6cc01f0b64c4ce';
  
  try {
    const requestUrl = `https://api.etherscan.io/api?module=account&action=tokentx&contractaddress=${SHIB_CONTRACT_ADDRESS}&address=${communityAddress}&page=1&offset=20&sort=desc&apikey=${apiKey}`;
    console.log(`🔥 Fetching SHIB transactions involving Community Address`);
    console.log(`🌐 Request URL: ${requestUrl.replace(apiKey, 'API_KEY_HIDDEN')}`);
    
    // Get all SHIB transactions involving the community address
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
    console.log(`📊 Etherscan response status: ${data.status}, message: ${data.message}, results: ${data.result ? data.result.length : 0}`);
    
    if (data.status === '1' && data.result && Array.isArray(data.result)) {
      // Process all transactions and return the most recent ones
      const transactions = data.result
        .slice(0, 20) // Take top 20 most recent transactions
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
      
      console.log(`✅ Successfully processed ${transactions.length} SHIB transactions`);
      return transactions;
      
    } else {
      console.log(`⚠️ Etherscan API returned: ${data.status} - ${data.message || 'Unknown error'}`);
      throw new Error(`Etherscan API error: ${data.message || data.status || 'Unknown error'}`);
    }
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`❌ Error fetching SHIB transactions:`, errorMessage);
    throw error;
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

    // Fetch fresh data
    const transactions = await fetchRealBurnTransactions();
    
    if (transactions.length === 0) {
      // No data available, but don't return dummy data
      throw new Error('No burn transactions found from Etherscan API');
    }

    // Update cache
    cache = {
      data: transactions,
      timestamp: now
    };

    console.log(`✅ Successfully fetched ${transactions.length} real burn transactions`);
    
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
    
    // Return error - no dummy data
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