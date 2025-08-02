// API route for paginated historical burn data
import { getHistoricalBurns, getHistoricalStats } from '../../../lib/historical-cache';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const address = searchParams.get('address') || 'all';
    const statsOnly = searchParams.get('stats') === 'true';
    
    // If requesting stats only
    if (statsOnly) {
      const stats = getHistoricalStats();
      return new Response(JSON.stringify({
        ...stats,
        timestamp: new Date().toISOString()
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=60'
        },
      });
    }
    
    // Get paginated historical data
    const result = getHistoricalBurns(page, limit, address);
    
    console.log(`📊 Historical burns request: page ${page}, showing ${result.burns.length}/${result.totalCount} burns`);
    
    return new Response(JSON.stringify({
      ...result,
      timestamp: new Date().toISOString(),
      cached: true,
      source: 'historical-cache'
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=30'
      },
    });
    
  } catch (error) {
    console.error('❌ Historical burns API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return new Response(JSON.stringify({
      error: 'Unable to load historical burns',
      message: errorMessage,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store'
      },
    });
  }
} 