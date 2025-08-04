import type { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";

// Netlify scheduled function to refresh all data every 2 minutes
export const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  console.log('🕐 Scheduled refresh starting...');
  
  try {
    const baseUrl = process.env.NETLIFY_DEV 
      ? 'http://localhost:8888' 
      : 'https://shibmetrics.com';
    
    // Refresh all endpoints in parallel
    const refreshPromises = [
      fetch(`${baseUrl}/api/price`, { 
        method: 'GET',
        headers: { 'User-Agent': 'Netlify-Scheduled-Refresh' }
      }),
      fetch(`${baseUrl}/api/total-burned`, { 
        method: 'GET',
        headers: { 'User-Agent': 'Netlify-Scheduled-Refresh' }
      }),
      fetch(`${baseUrl}/api/burns`, { 
        method: 'GET',
        headers: { 'User-Agent': 'Netlify-Scheduled-Refresh' }
      })
    ];
    
    const results = await Promise.allSettled(refreshPromises);
    
    let successCount = 0;
    let failCount = 0;
    
    results.forEach((result, index) => {
      const endpoints = ['price', 'total-burned', 'burns'];
      if (result.status === 'fulfilled') {
        console.log(`✅ ${endpoints[index]}: HTTP ${result.value.status}`);
        successCount++;
      } else {
        console.error(`❌ ${endpoints[index]}: ${result.reason}`);
        failCount++;
      }
    });
    
    console.log(`🏁 Scheduled refresh complete: ${successCount} success, ${failCount} failed`);
    
    return new Response(JSON.stringify({
      message: 'Scheduled refresh completed',
      success: successCount,
      failed: failCount,
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('❌ Scheduled refresh error:', error);
    return new Response(JSON.stringify({
      error: 'Scheduled refresh failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const config = {
  schedule: "*/2 * * * *"  // Every 2 minutes
}; 