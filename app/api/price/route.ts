// Use shared cache system for persistent data
import { loadPriceCache, savePriceCache } from '../../../lib/shared-cache';

export async function GET(request: Request) {
  try {
    // Check for cache-busting parameter
    const url = new URL(request.url);
    const forceFresh = url.searchParams.has('_t');
    
    // Try to serve from persistent cache first (unless force refresh is requested)
    if (!forceFresh) {
      const cachedData = loadPriceCache();
      
      if (cachedData) {
        console.log('🚀 Returning cached SHIB price, market cap, and supply data from persistent cache');
        return new Response(JSON.stringify({
          price: cachedData.price,
          priceChange24h: cachedData.priceChange24h,
          marketCap: cachedData.marketCap,
          circulatingSupply: cachedData.circulatingSupply,
          totalSupply: cachedData.totalSupply,
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
    } else {
      console.log('🔄 Cache-busting parameter detected - forcing fresh data from CoinGecko');
    }

    console.log('💰 Fetching fresh SHIB price and market cap from CoinGecko...');
    
    // Use the detailed coins endpoint to get supply data
    const response = await fetch(
      'https://api.coingecko.com/api/v3/coins/shiba-inu?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false',
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

    if (!data || !data.market_data) {
      throw new Error('Invalid response format from CoinGecko API');
    }

    const marketData = data.market_data;
    const price = marketData.current_price?.usd;
    const change = marketData.price_change_percentage_24h || 0;
    const marketCap = marketData.market_cap?.usd || 0;
    const circulatingSupply = marketData.circulating_supply || 0;
    const totalSupply = marketData.total_supply || 0;
    
    if (typeof price !== 'number' || price <= 0) {
      throw new Error('Invalid price data from CoinGecko API');
    }
    
    if (typeof marketCap !== 'number' || marketCap < 0) {
      throw new Error('Invalid market cap data from CoinGecko API');
    }
    
    if (typeof circulatingSupply !== 'number' || circulatingSupply < 0) {
      throw new Error('Invalid circulating supply data from CoinGecko API');
    }
    
    if (typeof totalSupply !== 'number' || totalSupply < 0) {
      throw new Error('Invalid total supply data from CoinGecko API');
    }
    
    // Update persistent cache
    savePriceCache({
      price,
      priceChange24h: change,
      marketCap,
      circulatingSupply,
      totalSupply,
      lastUpdated: Date.now()
    });

    console.log(`✅ SHIB price: $${price}, 24h change: ${change.toFixed(2)}%, market cap: $${(marketCap / 1e9).toFixed(2)}B, circulating: ${(circulatingSupply / 1e12).toFixed(0)}T, total: ${(totalSupply / 1e12).toFixed(0)}T`);
    
    return new Response(JSON.stringify({
      price: price,
      priceChange24h: change,
      marketCap: marketCap,
      circulatingSupply: circulatingSupply,
      totalSupply: totalSupply,
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