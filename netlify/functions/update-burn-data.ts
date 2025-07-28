import { Handler, schedule } from "@netlify/functions";
import { saveBurnCache, EtherscanTx, BurnDataCache } from "../../lib/burn-cache";

const SHIB_CONTRACT_ADDRESS = '0x95ad61b0a150d79219dcf64e1e6cc01f0b64c4ce';

// This will run every 3 minutes
const scheduledHandler: Handler = async (event: any, context: any) => {
  console.log('🔥 Starting scheduled burn data update...');
  
  const apiKey = process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY;
  if (!apiKey || apiKey === 'YourEtherscanApiKeyHere') {
    console.error('❌ No valid Etherscan API key configured');
    return { statusCode: 500, body: 'No API key' };
  }

  const burnAddresses = [
    { name: 'BA-1 (Vitalik Burn Alt)', address: '0xdead000000000000000042069420694206942069' },
    { name: 'BA-2 (Dead Address 1)', address: '0x000000000000000000000000000000000000dead' },
    { name: 'BA-3 (Null Address)', address: '0x0000000000000000000000000000000000000000' },
    { name: 'CA (Community Address)', address: '0x95ad61b0a150d79219dcf64e1e6cc01f0b64c4ce' }
  ];

  const allTransactions: EtherscanTx[] = [];
  let successCount = 0;

  // Fetch from each address with retries
  for (const burnAddr of burnAddresses) {
    let success = false;
    
    // Try up to 3 times for each address
    for (let attempt = 1; attempt <= 3 && !success; attempt++) {
      try {
        const requestUrl = `https://api.etherscan.io/api?module=account&action=tokentx&contractaddress=${SHIB_CONTRACT_ADDRESS}&address=${burnAddr.address}&page=1&offset=8&sort=desc&apikey=${apiKey}`;
        
        console.log(`🔥 Fetching from ${burnAddr.name} (attempt ${attempt})...`);
        
        const response = await fetch(requestUrl, {
          method: 'GET',
          headers: { 'Accept': 'application/json' },
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        
        if (data.status === '1' && data.result && Array.isArray(data.result)) {
          const transactions = data.result
            .filter((tx: EtherscanTx) => tx.to?.toLowerCase() === burnAddr.address.toLowerCase())
            .slice(0, 6)
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
          success = true;
          console.log(`✅ ${burnAddr.name}: Found ${transactions.length} transactions`);
        } else {
          throw new Error(`Etherscan API returned status: ${data.status}, message: ${data.message || 'Unknown'}`);
        }
        
        // Small delay between requests to avoid rate limiting
        if (attempt === 1) await new Promise(resolve => setTimeout(resolve, 300));
        
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.warn(`⚠️ ${burnAddr.name} attempt ${attempt} failed: ${errorMessage}`);
        
        if (attempt < 3) {
          // Wait longer between retries
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
      }
    }
    
    if (!success) {
      console.error(`❌ ${burnAddr.name}: All attempts failed`);
    }
  }

  // Sort transactions by timestamp (most recent first)
  allTransactions.sort((a, b) => parseInt(b.timeStamp) - parseInt(a.timeStamp));
  
  // Take top 20 most recent across all addresses
  const topTransactions = allTransactions.slice(0, 20);

  // Store the cached data
  const cacheData: BurnDataCache = {
    transactions: topTransactions,
    lastUpdated: Date.now(),
    source: 'scheduled-etherscan',
    totalAddressesSuccess: successCount,
    totalAddressesAttempted: burnAddresses.length
  };

  // Save to cache file
  saveBurnCache(cacheData);

  console.log(`✅ Scheduled update complete: ${topTransactions.length} transactions from ${successCount}/${burnAddresses.length} addresses`);

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Burn data updated successfully',
      transactions: topTransactions.length,
      addressesSuccess: successCount,
      addressesAttempted: burnAddresses.length,
      timestamp: new Date().toISOString()
    })
  };
};

// Export the scheduled function
export const handler = schedule("*/3 * * * *", scheduledHandler); 