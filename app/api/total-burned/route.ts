// API route for total burned calculation

const SHIB_CONTRACT_ADDRESS = '0x95ad61b0a150d79219dcf64e1e6cc01f0b64c4ce';

// Burn addresses mapped by name (only valid Etherscan-queryable addresses)
const BURN_ADDRESSES = {
  'Community Address': '0x95ad61b0a150d79219dcf64e1e6cc01f0b64c4ce', // SHIB Contract - Community burns (CA)
  'Vitalik Burn Alt': '0xdead000000000000000042069420694206942069', // Alternative Vitalik burn address (BA-1)
  'Dead Address 1': '0x000000000000000000000000000000000000dead', // Standard dead address (BA-2)
  'Null Address': '0x0000000000000000000000000000000000000000', // Genesis/null address (Black Hole - BA-3)
  'Vitalik Burn Original': '0xD7B7df10Cb1Dc2d1d15e7D00bcb244a7cfAc61cC', // Original Vitalik burn address
};

// In-memory cache for 2-minute caching
let totalBurnedCache: {
  data: number | null;
  timestamp: number;
} = {
  data: null,
  timestamp: 0
};

const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes

async function fetchRealTotalBurned(): Promise<number> {
  const apiKey = process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY;
  
  if (!apiKey || apiKey === 'YourEtherscanApiKeyHere') {
    throw new Error('No valid Etherscan API key configured');
  }

  console.log('🔥 Calculating real total burned from Etherscan...');
  
  let totalBurned = 0;
  let successfulQueries = 0;

  for (const [name, address] of Object.entries(BURN_ADDRESSES)) {
    const retries = 2;
    let success = false;
    
    for (let attempt = 0; attempt <= retries && !success; attempt++) {
      try {
        console.log(`🔥 Fetching balance for ${name} (attempt ${attempt + 1}/${retries + 1})`);
        
        const response = await fetch(
          `https://api.etherscan.io/api?module=account&action=tokenbalance&contractaddress=${SHIB_CONTRACT_ADDRESS}&address=${address}&tag=latest&apikey=${apiKey}`,
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

        if (data.status === '1' && data.result) {
          const balance = parseInt(data.result) / 1e18; // Convert from wei to SHIB
          totalBurned += balance;
          successfulQueries++;
          success = true;
          console.log(`✅ ${name}: ${balance.toLocaleString()} SHIB burned`);
        } else {
          throw new Error(`Etherscan API error for ${name}: ${data.message || 'Unknown error'}`);
        }
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.log(`⚠️ Error on attempt ${attempt + 1} for ${name}: ${errorMessage}`);
        if (attempt < retries) {
          await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
        }
      }
    }
    
    if (!success) {
      console.error(`❌ Failed to get balance for ${name} after ${retries + 1} attempts`);
    }
    
    // Rate limiting delay
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  console.log(`📊 API Summary: ${successfulQueries}/${Object.keys(BURN_ADDRESSES).length} addresses queried successfully, total: ${totalBurned.toLocaleString()} SHIB`);

  if (totalBurned <= 0 || successfulQueries === 0) {
    throw new Error(`Insufficient data: only ${successfulQueries} successful queries, total: ${totalBurned}`);
  }

  return totalBurned;
}

export async function GET() {
  try {
    const now = Date.now();
    
    // Check cache first (2-minute cache)
    if (totalBurnedCache.data && (now - totalBurnedCache.timestamp) < CACHE_DURATION) {
      console.log('🚀 Returning cached total burned');
      return new Response(JSON.stringify({
        totalBurned: totalBurnedCache.data,
        cached: true,
        timestamp: new Date().toISOString(),
        source: 'etherscan-cached'
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=120'
        },
      });
    }

    // Fetch fresh data
    const totalBurned = await fetchRealTotalBurned();
    
    // Update cache
    totalBurnedCache = {
      data: totalBurned,
      timestamp: now
    };

    console.log(`✅ Total burned from live API: ${totalBurned.toLocaleString()} SHIB`);
    
    return new Response(JSON.stringify({
      totalBurned: totalBurned,
      cached: false,
      timestamp: new Date().toISOString(),
      source: 'etherscan-live'
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=120'
      },
    });

  } catch (error) {
    console.error('❌ Total burned API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Return error - no fallback data
    return new Response(JSON.stringify({
      error: 'Unable to calculate total burned',
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