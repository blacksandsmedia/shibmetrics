// Use shared cache system for persistent data + high-performance memory cache
import { loadPriceCache, savePriceCache } from '../../../lib/shared-cache';
import memoryCache, { cacheKeys } from '../../../lib/memory-cache';

export async function GET(request: Request) {
  try {
    // Check if this is from the scheduled function (server-side)
    const userAgent = request.headers.get('User-Agent') || '';
    const isScheduledRefresh = userAgent.includes('Netlify-Scheduled-Refresh');
    
    // STEP 1: Check memory cache first (INSTANT - no disk I/O)
    const memoryCacheEntry = memoryCache.get(cacheKeys.PRICE_DATA);
    if (memoryCacheEntry && !isScheduledRefresh) {
      const age = Math.round((Date.now() - memoryCacheEntry.lastUpdated) / 1000);
      console.log(`🏎️ INSTANT: Serving price data from MEMORY (age: ${age}s)`);
      
      const data = memoryCacheEntry.data as {
        price: number;
        priceChange24h: number;
        marketCap: number;
        circulatingSupply: number;
        totalSupply: number;
        volume24h: number;
      };
      return new Response(JSON.stringify({
        price: data.price,
        priceChange24h: data.priceChange24h,
        marketCap: data.marketCap,
        circulatingSupply: data.circulatingSupply,
        totalSupply: data.totalSupply,
        volume24h: data.volume24h || 0,
        timestamp: new Date().toISOString(),
        source: memoryCacheEntry.source + '-memory',
        cached: true,
        lastUpdated: new Date(memoryCacheEntry.lastUpdated).toISOString()
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=30'
        },
      });
    }
    
    // STEP 2: Memory cache miss - load from disk (but populate memory for next time)
    console.log('💾 Memory cache miss - loading from disk...');
    const cachedData = loadPriceCache();
    
    if (cachedData && !isScheduledRefresh) {
      console.log('💾 Returning cached SHIB price data from DISK (populated by scheduled function)');
      
      // Populate memory cache for next request (INSTANT responses)
      memoryCache.set(cacheKeys.PRICE_DATA, cachedData, 'coingecko-cached');
      console.log('🏎️ Populated memory cache - next requests will be INSTANT');
      
      return new Response(JSON.stringify({
        price: cachedData.price,
        priceChange24h: cachedData.priceChange24h,
        marketCap: cachedData.marketCap,
        circulatingSupply: cachedData.circulatingSupply,
        totalSupply: cachedData.totalSupply,
        volume24h: cachedData.volume24h || 0,
        timestamp: new Date().toISOString(),
        source: 'coingecko-cached-disk',
        cached: true,
        lastUpdated: new Date(cachedData.lastUpdated).toISOString()
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=30'
        },
      });
    }
    
    // TEMPORARY: Allow user requests to call external APIs until scheduled function is fixed
    if (!isScheduledRefresh) {
      console.log('⚠️ No cached data available - fetching fresh data for user request (TEMPORARY)');
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
    const volume24h = marketData.total_volume?.usd || 0;
    
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
    const freshData = {
      price,
      priceChange24h: change,
      marketCap,
      circulatingSupply,
      totalSupply,
      volume24h,
      lastUpdated: Date.now()
    };
    savePriceCache(freshData);
    
    // Update memory cache for instant future responses
    memoryCache.set(cacheKeys.PRICE_DATA, freshData, 'coingecko-live');
    console.log('🏎️ Updated memory cache with fresh price data - future requests will be INSTANT');

    console.log(`✅ SHIB price: $${price}, 24h change: ${change.toFixed(2)}%, market cap: $${(marketCap / 1e9).toFixed(2)}B, circulating: ${(circulatingSupply / 1e12).toFixed(0)}T, total: ${(totalSupply / 1e12).toFixed(0)}T`);
    
    return new Response(JSON.stringify({
      price: price,
      priceChange24h: change,
      marketCap: marketCap,
      circulatingSupply: circulatingSupply,
      totalSupply: totalSupply,
      volume24h: volume24h,
      timestamp: new Date().toISOString(),
      source: 'coingecko-live',
      cached: false
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=30'
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