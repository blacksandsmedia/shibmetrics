// Use shared cache system for persistent data
import { loadPriceCache, savePriceCache } from '../../../lib/shared-cache';

export async function GET() {
  try {
    // Always try to serve from persistent cache first
    const cachedData = loadPriceCache();
    
    if (cachedData) {
      console.log('🚀 Returning cached SHIB price and market cap from persistent cache');
      return new Response(JSON.stringify({
        price: cachedData.price,
        priceChange24h: cachedData.priceChange24h,
        marketCap: cachedData.marketCap,
        timestamp: new Date().toISOString(),
        source: 'coingecko-cached',
        cached: true,
        lastUpdated: new Date(cachedData.lastUpdated).toISOString()
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=60'
        },
      });
    }

    console.log('💰 Fetching fresh SHIB price and market cap from CoinGecko...');
    
    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=shiba-inu&vs_currencies=usd&include_24hr_change=true&include_market_cap=true',
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
    const marketCap = shibData.usd_market_cap || 0;
    
    if (typeof price !== 'number' || price <= 0) {
      throw new Error('Invalid price data from CoinGecko API');
    }
    
    if (typeof marketCap !== 'number' || marketCap < 0) {
      throw new Error('Invalid market cap data from CoinGecko API');
    }
    
    // Update persistent cache
    savePriceCache({
      price,
      priceChange24h: change,
      marketCap,
      lastUpdated: Date.now()
    });

    console.log(`✅ SHIB price: $${price}, 24h change: ${change.toFixed(2)}%, market cap: $${(marketCap / 1e9).toFixed(2)}B`);
    
    return new Response(JSON.stringify({
      price: price,
      priceChange24h: change,
      marketCap: marketCap,
      timestamp: new Date().toISOString(),
      source: 'coingecko-live',
      cached: false
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