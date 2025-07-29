import { Context } from "@netlify/functions";
import { addBurnsToHistory, loadHistoricalCache, HistoricalBurn } from '../../lib/historical-cache';

const SHIB_CONTRACT_ADDRESS = '0x95ad61b0a150d79219dcf64e1e6cc01f0b64c4ce';

// Burn addresses for historical sync
const BURN_ADDRESSES = [
  { name: 'BA-1 (Vitalik Burn Alt)', address: '0xdead000000000000000042069420694206942069' },
  { name: 'BA-2 (Dead Address 1)', address: '0x000000000000000000000000000000000000dead' },
  { name: 'BA-3 (Null Address)', address: '0x0000000000000000000000000000000000000000' },
  { name: 'CA (Community Address)', address: '0x95ad61b0a150d79219dcf64e1e6cc01f0b64c4ce' }
];

// Deep historical sync - fetches 100 transactions at a time, working backwards
async function fetchHistoricalBurns(): Promise<void> {
  const apiKey = process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY;
  if (!apiKey || apiKey === 'YourEtherscanApiKeyHere') {
    console.log('⚠️ No API key for historical sync');
    return;
  }

  try {
    console.log('📚 Starting deep historical burn sync...');
    
    const cache = loadHistoricalCache();
    const newBurns: HistoricalBurn[] = [];
    
    for (const burnAddr of BURN_ADDRESSES) {
      try {
        // Fetch more historical data - 100 transactions per request
        const requestUrl = `https://api.etherscan.io/api?module=account&action=tokentx&contractaddress=${SHIB_CONTRACT_ADDRESS}&address=${burnAddr.address}&page=1&offset=100&sort=desc&apikey=${apiKey}`;
        
        console.log(`📚 Historical sync: Fetching 100 transactions from ${burnAddr.name}...`);
        
        const response = await fetch(requestUrl, {
          method: 'GET',
          headers: { 'Accept': 'application/json' },
        });

        if (!response.ok) {
          console.log(`⚠️ HTTP ${response.status} for ${burnAddr.name} - continuing anyway`);
        }

        const data = await response.json();
        console.log(`📊 ${burnAddr.name}: status=${data.status}, results=${data.result?.length || 0}`);
        
        if (data.result && Array.isArray(data.result) && data.result.length > 0) {
          const transactions = data.result
            .filter((tx: any) => {
              try {
                const value = BigInt(tx.value || '0');
                return value > BigInt(0); // Only include positive value transactions
              } catch {
                return false;
              }
            })
            .map((tx: any) => ({
              hash: tx.hash,
              from: tx.from,
              to: tx.to,
              value: tx.value,
              timeStamp: tx.timeStamp,
              blockNumber: tx.blockNumber,
              tokenName: tx.tokenName,
              tokenSymbol: tx.tokenSymbol,
              tokenDecimal: tx.tokenDecimal
            }));

          newBurns.push(...transactions);
          console.log(`✅ ${burnAddr.name}: Found ${transactions.length} valid historical burns`);
        }
        
        // Longer delay for historical sync to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 2000));
        
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.log(`❌ Historical sync error for ${burnAddr.name}: ${errorMessage}`);
      }
    }

    // Add to historical cache
    if (newBurns.length > 0) {
      addBurnsToHistory(newBurns);
      console.log(`✅ Historical sync complete: processed ${newBurns.length} transactions`);
    } else {
      console.log('ℹ️ Historical sync complete: no new transactions found');
    }
    
  } catch (error) {
    console.error('❌ Historical sync failed:', error);
  }
}

// Netlify scheduled function for deep historical sync (runs every 10 minutes)
export default async (request: Request, context: Context) => {
  console.log('📚 Scheduled historical sync starting...');
  
  try {
    await fetchHistoricalBurns();
    
    return new Response(JSON.stringify({
      message: 'Historical sync completed',
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('❌ Scheduled historical sync error:', error);
    return new Response(JSON.stringify({
      error: 'Historical sync failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const config = {
  schedule: "*/10 * * * *"  // Every 10 minutes
}; 