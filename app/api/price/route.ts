// In-memory cache for 2-minute caching
let priceCache: {
  data: { price: number; priceChange24h: number } | null;
  timestamp: number;
} = {
  data: null,
  timestamp: 0
};

const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes

export async function GET() {
  try {
    const now = Date.now();
    
    // Check cache first (2-minute cache)
    if (priceCache.data && (now - priceCache.timestamp) < CACHE_DURATION) {
      console.log('🚀 Returning cached SHIB price');
      return new Response(JSON.stringify({
        price: priceCache.data.price,
        priceChange24h: priceCache.data.priceChange24h,
        timestamp: new Date().toISOString(),
        source: 'coingecko-cached'
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=60'
        },
      });
    }

    console.log('💰 Fetching fresh SHIB price from CoinGecko...');
    
    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=shiba-inu&vs_currencies=usd&include_24hr_change=true',
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`CoinGecko API HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data || !data['shiba-inu']) {
      throw new Error('Invalid response format from CoinGecko API');
    }

    const shibData = data['shiba-inu'];
    const price = shibData.usd;
    const change = shibData.usd_24h_change || 0;
    
    if (typeof price !== 'number' || price <= 0) {
      throw new Error('Invalid price data from CoinGecko API');
    }
    
    // Update cache
    priceCache = {
      data: { price, priceChange24h: change },
      timestamp: now
    };

    console.log(`✅ SHIB price: $${price}, 24h change: ${change.toFixed(2)}%`);
    
    return new Response(JSON.stringify({
      price: price,
      priceChange24h: change,
      timestamp: new Date().toISOString(),
      source: 'coingecko-live'
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=60'
      },
    });

  } catch (error) {
    console.error('❌ Price API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Return error - no fallback price data
    return new Response(JSON.stringify({
      error: 'Unable to fetch SHIB price',
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