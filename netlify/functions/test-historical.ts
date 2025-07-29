import { Context } from "@netlify/functions";

export default async (request: Request, context: Context) => {
  console.log('🧪 Test historical function starting...');
  
  try {
    // Test environment variable access
    const apiKey = process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY || process.env.ETHERSCAN_API_KEY;
    console.log('🔑 API Key available:', !!apiKey);
    console.log('🔑 API Key prefix:', apiKey ? apiKey.substring(0, 10) + '...' : 'None');
    
    // Test basic functionality
    const testUrl = `https://api.etherscan.io/api?module=account&action=tokentx&contractaddress=0x95ad61b0a150d79219dcf64e1e6cc01f0b64c4ce&address=0xdead000000000000000042069420694206942069&page=1&offset=5&sort=desc&apikey=${apiKey}`;
    
    console.log('🧪 Testing Etherscan API call...');
    const response = await fetch(testUrl);
    const data = await response.json();
    
    console.log('📊 API Response:', { 
      status: response.status, 
      etherscanStatus: data.status,
      resultCount: data.result?.length || 0
    });
    
    return new Response(JSON.stringify({
      message: 'Test completed successfully',
      apiKeyAvailable: !!apiKey,
      apiKeyPrefix: apiKey ? apiKey.substring(0, 10) + '...' : 'None',
      etherscanStatus: data.status,
      resultCount: data.result?.length || 0,
      sampleTransaction: data.result?.[0] || null,
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('❌ Test function error:', error);
    return new Response(JSON.stringify({
      error: 'Test failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}; 