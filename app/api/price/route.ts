export async function GET() {
  try {
    console.log('💰 Fetching SHIB price from CoinGecko...');
    
    // Add timestamp and no-cache headers for fresh data
    const timestamp = Date.now();
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=shiba-inu&vs_currencies=usd&include_24hr_change=true&t=${timestamp}`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data && data['shiba-inu']) {
      const shibData = data['shiba-inu'];
      const price = shibData.usd;
      const change = shibData.usd_24h_change || 0;
      
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
          'Cache-Control': 'public, max-age=30' // Shorter cache for fresher data
        },
      });
    } else {
      throw new Error('Invalid response format from CoinGecko');
    }
  } catch (error) {
    console.error('❌ Error fetching SHIB price:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Return fallback with current market estimate from search
    return new Response(JSON.stringify({
      price: 0.00001411, // Updated to match current market price
      priceChange24h: 1.0, // Positive change based on search results
      fallback: true,
      error: `API temporarily unavailable: ${errorMessage}`,
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=120' // 2 minute cache for fallback
      },
    });
  }
} 