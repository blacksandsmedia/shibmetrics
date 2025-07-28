import { NextResponse } from 'next/server';
import axios from 'axios';

export async function GET() {
  try {
    console.log('💰 Fetching SHIB price from CoinGecko...');
    
    const response = await axios.get(
      'https://api.coingecko.com/api/v3/simple/price',
      {
        params: {
          ids: 'shiba-inu',
          vs_currencies: 'usd',
          include_24hr_change: 'true'
        },
        timeout: 10000,
      }
    );

    if (response.data && response.data['shiba-inu']) {
      const data = response.data['shiba-inu'];
      console.log(`✅ SHIB price: $${data.usd}, 24h change: ${data.usd_24h_change?.toFixed(2)}%`);
      
      return NextResponse.json({
        price: data.usd,
        priceChange24h: data.usd_24h_change || 0
      });
    } else {
      throw new Error('Invalid response format from CoinGecko');
    }
  } catch (error) {
    console.error('❌ Error fetching SHIB price:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Return fallback data instead of error status
    return NextResponse.json({
      price: 0.00001408, // Fallback price
      priceChange24h: 0,
      error: `API temporarily unavailable: ${errorMessage}`,
      fallback: true
    });
  }
} 