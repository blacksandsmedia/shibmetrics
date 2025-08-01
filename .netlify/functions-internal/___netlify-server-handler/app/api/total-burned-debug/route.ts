// Debug version of total burned calculation to identify failing addresses
const SHIB_CONTRACT_ADDRESS = '0x95ad61b0a150d79219dcf64e1e6cc01f0b64c4ce';

const BURN_ADDRESSES = {
  'Community Address': '0x95ad61b0a150d79219dcf64e1e6cc01f0b64c4ce',
  'Vitalik Burn Alt': '0xdead000000000000000042069420694206942069', 
  'Dead Address 1': '0x000000000000000000000000000000000000dead',
  'Null Address': '0x0000000000000000000000000000000000000000',
  'Vitalik Burn Original': '0xD7B7df10Cb1Dc2d1d15e7D00bcb244a7cfAc61cC'
};

export async function GET() {
  const apiKey = process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY;
  
  if (!apiKey || apiKey === 'YourEtherscanApiKeyHere') {
    return new Response(JSON.stringify({
      error: 'No valid Etherscan API key configured'
    }), { status: 500 });
  }

  const results = [];
  let totalBurned = 0;
  let successCount = 0;

  for (const [name, address] of Object.entries(BURN_ADDRESSES)) {
    try {
      console.log(`🔥 DEBUG: Fetching balance for ${name}...`);
      
      const response = await fetch(
        `https://api.etherscan.io/api?module=account&action=tokenbalance&contractaddress=${SHIB_CONTRACT_ADDRESS}&address=${address}&tag=latest&apikey=${apiKey}`,
        {
          method: 'GET',
          headers: { 'Accept': 'application/json' }
        }
      );

      const data = await response.json();
      
      const result = {
        name,
        address,
        httpStatus: response.status,
        etherscanStatus: data.status,
        etherscanMessage: data.message,
        rawResult: data.result,
        success: false,
        balanceShib: 0
      };

      if (data.status === '1' && data.result) {
        const balance = parseInt(data.result) / 1e18;
        result.success = true;
        result.balanceShib = balance;
        totalBurned += balance;
        successCount++;
        console.log(`✅ DEBUG: ${name}: ${balance.toLocaleString()} SHIB`);
      } else {
        console.log(`❌ DEBUG: ${name} failed: ${data.message}`);
      }

      results.push(result);
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 300));
      
    } catch (error) {
      console.error(`❌ DEBUG: Exception for ${name}:`, error);
      results.push({
        name,
        address,
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false
      });
    }
  }

  return new Response(JSON.stringify({
    debug: true,
    totalBurnedShib: totalBurned,
    successfulQueries: successCount,
    totalAddresses: Object.keys(BURN_ADDRESSES).length,
    addressResults: results,
    summary: `${successCount}/${Object.keys(BURN_ADDRESSES).length} addresses successful`,
    timestamp: new Date().toISOString()
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
} 