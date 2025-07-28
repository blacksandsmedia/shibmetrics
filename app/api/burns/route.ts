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
  
  if (!apiKey || apiKey === 'YourEtherscanApiKeyHere') {
    throw new Error('No valid Etherscan API key configured');
  }

  console.log('🔥 Fetching real SHIB transactions from Etherscan...');
  
  const communityAddress = '0x95ad61b0a150d79219dcf64e1e6cc01f0b64c4ce';
  const allTransactions: EtherscanTx[] = [];
  
  try {
    console.log(`🔥 Fetching SHIB transactions involving Community Address`);
    
    // Get all SHIB transactions involving the community address
    const response = await fetch(
      `https://api.etherscan.io/api?module=account&action=tokentx&contractaddress=${SHIB_CONTRACT_ADDRESS}&address=${communityAddress}&page=1&offset=30&sort=desc&apikey=${apiKey}`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.status === '1' && data.result && Array.isArray(data.result)) {
      // Get significant transactions (both inbound and outbound)
      const transactions = data.result
        .filter((tx: EtherscanTx) => {
          const value = parseInt(tx.value);
          // Filter for significant transactions (> 1 billion SHIB)
          return value > 1000000000000000000000;
        })
        .slice(0, 15) // Take top 15 significant transactions
        .map((tx: EtherscanTx) => ({
          hash: tx.hash,
          from: tx.from,
          to: tx.to,
          value: tx.value,
          timeStamp: tx.timeStamp,
          blockNumber: tx.blockNumber,
          tokenName: tx.tokenName || 'SHIB',
          tokenSymbol: tx.tokenSymbol || 'SHIB',
          tokenDecimal: tx.tokenDecimal || '18'
        }));
      
      allTransactions.push(...transactions);
      console.log(`✅ Found ${transactions.length} significant SHIB transactions`);
      
      // If we don't have enough significant transactions, add some regular ones
      if (transactions.length < 10) {
        const regularTransactions = data.result
          .filter((tx: EtherscanTx) => {
            const value = parseInt(tx.value);
            return value > 100000000000000000000; // > 100 million SHIB
          })
          .slice(0, 15)
          .map((tx: EtherscanTx) => ({
            hash: tx.hash,
            from: tx.from,
            to: tx.to,
            value: tx.value,
            timeStamp: tx.timeStamp,
            blockNumber: tx.blockNumber,
            tokenName: tx.tokenName || 'SHIB',
            tokenSymbol: tx.tokenSymbol || 'SHIB',
            tokenDecimal: tx.tokenDecimal || '18'
          }));
        
        // Add unique transactions only
        const existingHashes = new Set(allTransactions.map((tx: EtherscanTx) => tx.hash));
        const newTransactions = regularTransactions.filter((tx: EtherscanTx) => !existingHashes.has(tx.hash));
        
        allTransactions.push(...newTransactions);
        console.log(`✅ Added ${newTransactions.length} additional SHIB transactions`);
      }
    } else {
      console.log(`⚠️ No valid data from Etherscan: ${data.message || 'Unknown error'}`);
      throw new Error(`Etherscan API error: ${data.message || 'Unknown error'}`);
    }
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`❌ Error fetching SHIB transactions:`, errorMessage);
    throw error;
  }

  // Sort by timestamp (most recent first)
  allTransactions.sort((a, b) => parseInt(b.timeStamp) - parseInt(a.timeStamp));
  
  // Return top 50 most recent
  return allTransactions.slice(0, 50);
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