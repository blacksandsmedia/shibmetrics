export async function GET() {
  try {
    console.log('💰 Fetching SHIB price from CoinGecko...');
    
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
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data && data['shiba-inu']) {
      const shibData = data['shiba-inu'];
      console.log(`✅ SHIB price: $${shibData.usd}, 24h change: ${shibData.usd_24h_change?.toFixed(2)}%`);
      
      return new Response(JSON.stringify({
        price: shibData.usd,
        priceChange24h: shibData.usd_24h_change || 0
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } else {
      throw new Error('Invalid response format from CoinGecko');
    }
  } catch (error) {
    console.error('❌ Error fetching SHIB price:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Return fallback data instead of error status
    return new Response(JSON.stringify({
      price: 0.00001408, // Fallback price
      priceChange24h: 0,
      error: `API temporarily unavailable: ${errorMessage}`,
      fallback: true
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
} 