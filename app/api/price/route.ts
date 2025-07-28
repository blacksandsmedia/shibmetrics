export async function GET() {
  // For now, return fallback data while we debug the external API issue
  console.log('💰 Returning fallback SHIB price data...');
  
  return new Response(JSON.stringify({
    price: 0.00001408, // Static fallback price
    priceChange24h: -0.15,
    fallback: true,
    message: 'Using fallback data - external API temporarily unavailable'
  }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=60'
    },
  });
} 