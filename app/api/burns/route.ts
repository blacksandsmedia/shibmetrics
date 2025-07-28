import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const SHIB_CONTRACT_ADDRESS = '0x95ad61b0a150d79219dcf64e1e6cc01f0b64c4ce';

// Burn addresses to track
const BURN_ADDRESSES = {
  'Community Address': '0x95ad61b0a150d79219dcf64e1e6cc01f0b64c4ce', // SHIB Contract - Community burns (CA)
  'Vitalik Burn Alt': '0xdead000000000000000042069420694206942069', // Alternative Vitalik burn address (BA-1)
  'Dead Address 1': '0x000000000000000000000000000000000000dead', // Standard dead address (BA-2)
  'Null Address': '0x0000000000000000000000000000000000000000', // Genesis/null address (Black Hole - BA-3)
  'Vitalik Burn Original': '0xD7B7df10Cb1Dc2d1d15e7D00bcb244a7cfAc61cC', // Original Vitalik burn address
};

interface EtherscanTx {
  blockNumber: string;
  timeStamp: string;
  hash: string;
  from: string;
  to: string;
  value: string;
  tokenName: string;
  tokenSymbol: string;
  tokenDecimal: string;
}

interface EtherscanResponse {
  status: string;
  message: string;
  result: EtherscanTx[];
}

// Helper function to fetch transactions for a single address with retries
async function fetchAddressTransactions(address: string, apiKey: string, offset: number = 10, retries: number = 2): Promise<EtherscanTx[]> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      console.log(`🔥 Fetching burns for address: ${address} (attempt ${attempt + 1}/${retries + 1})`);
      
      const response = await axios.get<EtherscanResponse>(
        'https://api.etherscan.io/api',
        {
          params: {
            module: 'account',
            action: 'tokentx',
            contractaddress: SHIB_CONTRACT_ADDRESS,
            address: address,
            page: 1,
            offset: offset,
            sort: 'desc',
            apikey: apiKey,
          },
          timeout: 8000, // Reduced for serverless
        }
      );

      if (response.data.status === '1' && response.data.result) {
        const transactions = response.data.result.map(tx => ({
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

        console.log(`✅ Fetched ${transactions.length} burn transactions for ${address}`);
        return transactions;
      } else {
        console.log(`⚠️  Etherscan returned: ${response.data.message} for ${address}`);
        if (attempt === retries) {
          return [];
        }
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.log(`⚠️  Error on attempt ${attempt + 1} for ${address}:`, errorMessage);
      if (attempt === retries) {
        return [];
      }
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
    }
  }
  return [];
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');
    const offset = parseInt(searchParams.get('offset') || '10');
    const all = searchParams.get('all') === 'true'; // New parameter to fetch from all addresses

    const apiKey = process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY;
    
    if (!apiKey || apiKey === 'YourEtherscanApiKeyHere') {
      console.log('⚠️  No valid Etherscan API key found - returning empty transactions');
      return NextResponse.json({ transactions: [] });
    }

    let allTransactions: EtherscanTx[] = [];

    if (address && !all) {
      // Fetch from specific address
      allTransactions = await fetchAddressTransactions(address, apiKey, offset);
    } else {
      // Fetch from all burn addresses
      console.log('🔥 Fetching burns from all burn addresses...');
      
      for (const [name, burnAddress] of Object.entries(BURN_ADDRESSES)) {
        // Fetch more transactions from high-activity burn addresses (increased limits for historical data)
        const transactionLimit = (name === 'Community Address' || name === 'Vitalik Burn Alt') ? Math.min(offset, 100) : Math.min(offset, 50);
        const transactions = await fetchAddressTransactions(burnAddress, apiKey, transactionLimit);
        if (transactions.length > 0) {
          console.log(`✅ ${name}: Got ${transactions.length} transactions`);
          allTransactions.push(...transactions);
        } else {
          console.log(`⚠️  ${name}: No transactions found`);
        }
        
        // Reduced delay for faster data retrieval
        await new Promise(resolve => setTimeout(resolve, 150));
      }

      // Sort by timestamp (most recent first) and limit
      allTransactions = allTransactions
        .sort((a, b) => parseInt(b.timeStamp) - parseInt(a.timeStamp))
        .slice(0, offset);
      
      console.log(`🔥 Total transactions from all addresses: ${allTransactions.length}`);
    }

    return NextResponse.json({ transactions: allTransactions });
  } catch (error) {
    console.error('❌ Error in burns API:', error);
    return NextResponse.json({ transactions: [] });
  }
} 