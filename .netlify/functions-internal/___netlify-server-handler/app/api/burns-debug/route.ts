// Debug endpoint to test background refresh with new limits
import { EtherscanTx } from '../../../lib/burn-cache';

const SHIB_CONTRACT_ADDRESS = '0x95ad61b0a150d79219dcf64e1e6cc01f0b64c4ce';

export async function GET() {
  const apiKey = process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY;
  
  if (!apiKey || apiKey === 'YourEtherscanApiKeyHere') {
    return new Response(JSON.stringify({
      error: 'No API key configured'
    }), { status: 500 });
  }

  try {
    console.log('🔍 DEBUG: Testing background refresh logic...');
    
    const burnAddresses = [
      { name: 'BA-1 (Vitalik Burn Alt)', address: '0xdead000000000000000042069420694206942069' },
      { name: 'BA-2 (Dead Address 1)', address: '0x000000000000000000000000000000000000dead' },
      { name: 'BA-3 (Null Address)', address: '0x0000000000000000000000000000000000000000' },
      { name: 'CA (Community Address)', address: '0x95ad61b0a150d79219dcf64e1e6cc01f0b64c4ce' }
    ];

    const allTransactions: EtherscanTx[] = [];
    let successCount = 0;
    const debug = [];

    for (const burnAddr of burnAddresses) {
      try {
        const requestUrl = `https://api.etherscan.io/api?module=account&action=tokentx&contractaddress=${SHIB_CONTRACT_ADDRESS}&address=${burnAddr.address}&page=1&offset=100&sort=desc&apikey=${apiKey}`;
        
        console.log(`🔍 DEBUG: Fetching from ${burnAddr.name}...`);
        
        const response = await fetch(requestUrl);
        const data = await response.json();
        
        if (data.result && Array.isArray(data.result) && data.result.length > 0) {
          const transactions = data.result
            .filter((tx: EtherscanTx) => tx.to?.toLowerCase() === burnAddr.address.toLowerCase())
            .slice(0, 100)  // Using new limit
            .map((tx: EtherscanTx) => ({
              hash: tx.hash,
              from: tx.from,
              to: tx.to,
              value: tx.value,
              timeStamp: tx.timeStamp,
              blockNumber: tx.blockNumber,
              tokenName: tx.tokenName || 'SHIBA INU',
              tokenSymbol: tx.tokenSymbol || 'SHIB',
              tokenDecimal: tx.tokenDecimal || '18'
            }));
          
          allTransactions.push(...transactions);
          successCount++;
          
          debug.push({
            address: burnAddr.name,
            success: true,
            rawCount: data.result.length,
            filteredCount: transactions.length,
            sampleHashes: transactions.slice(0, 3).map((tx: Record<string, unknown>) => tx.hash)
          });
          
          console.log(`✅ DEBUG: ${burnAddr.name}: ${transactions.length} transactions`);
        } else {
          debug.push({
            address: burnAddr.name,
            success: false,
            status: data.status,
            message: data.message,
            rawCount: data.result?.length || 0
          });
        }
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        debug.push({
          address: burnAddr.name,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    // Apply the same deduplication and sorting as the main function
    const uniqueTransactions = Array.from(
      new Map(allTransactions.map(tx => [tx.hash, tx])).values()
    ).sort((a, b) => parseInt(b.timeStamp) - parseInt(a.timeStamp))
     .slice(0, 400);  // Using new limit

    return new Response(JSON.stringify({
      debug: true,
      totalCollected: allTransactions.length,
      uniqueAfterDeduplication: uniqueTransactions.length,
      successfulAddresses: successCount,
      totalAddresses: burnAddresses.length,
      addressDetails: debug,
      sampleTransactions: uniqueTransactions.slice(0, 5).map(tx => ({
        hash: tx.hash,
        from: tx.from.substring(0, 10) + '...',
        to: tx.to.substring(0, 10) + '...',
        value: tx.value,
        timeStamp: tx.timeStamp
      })),
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    return new Response(JSON.stringify({
      error: 'Debug failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }), { status: 500 });
  }
} 