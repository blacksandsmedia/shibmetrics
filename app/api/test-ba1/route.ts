// Test endpoint specifically for BA-1 transaction collection
import { NextRequest, NextResponse } from 'next/server';

const SHIB_CONTRACT_ADDRESS = '0x95ad61b0a150d79219dcf64e1e6cc01f0b64c4ce';
const BA1_ADDRESS = '0xdead000000000000000042069420694206942069';

export async function GET(request: NextRequest) {
  const apiKey = process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY;
  
  if (!apiKey || apiKey === 'YourEtherscanApiKeyHere') {
    return NextResponse.json({
      error: 'No API key configured'
    }, { status: 500 });
  }

  try {
    console.log('🧪 Testing BA-1 transaction collection...');
    
    // Test the exact same API call our background refresh makes
    const requestUrl = `https://api.etherscan.io/api?module=account&action=tokentx&contractaddress=${SHIB_CONTRACT_ADDRESS}&address=${BA1_ADDRESS}&page=1&offset=20&sort=desc&apikey=${apiKey}`;
    
    console.log('🧪 Making request to:', requestUrl.replace(apiKey, 'HIDDEN'));
    
    const response = await fetch(requestUrl, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });

    if (!response.ok) {
      return NextResponse.json({
        error: `HTTP ${response.status}`,
        message: response.statusText
      }, { status: response.status });
    }

    const data = await response.json();
    
    console.log('🧪 Etherscan response:', { 
      status: data.status, 
      message: data.message,
      resultCount: data.result?.length || 0 
    });
    
    if (!data.result || !Array.isArray(data.result)) {
      return NextResponse.json({
        error: 'No results from Etherscan',
        etherscanStatus: data.status,
        etherscanMessage: data.message,
        rawResponse: data
      });
    }

    // Apply the same filtering logic as our main API
    const transactions = data.result
      .filter((tx: any) => {
        const matches = tx.to?.toLowerCase() === BA1_ADDRESS.toLowerCase();
        console.log(`🧪 Transaction ${tx.hash}: to=${tx.to}, matches=${matches}`);
        return matches;
      })
      .slice(0, 20)
      .map((tx: any) => ({
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

    console.log(`🧪 After filtering: ${transactions.length} BA-1 transactions`);

    return NextResponse.json({
      success: true,
      etherscanStatus: data.status,
      etherscanMessage: data.message,
      rawResultCount: data.result.length,
      filteredCount: transactions.length,
      ba1Address: BA1_ADDRESS,
      sampleTransactions: transactions.slice(0, 5),
      allTransactionHashes: transactions.map(tx => tx.hash),
      filteringTest: {
        expectedAddress: BA1_ADDRESS.toLowerCase(),
        actualAddresses: data.result.slice(0, 5).map((tx: any) => tx.to?.toLowerCase()),
        matchingCount: data.result.filter((tx: any) => tx.to?.toLowerCase() === BA1_ADDRESS.toLowerCase()).length
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('🧪 BA-1 test failed:', error);
    return NextResponse.json({
      error: 'Test failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 