// API endpoint to trigger complete historical data collection

import { NextResponse } from 'next/server';
import { collectCompleteHistoricalDataset } from '../../../../lib/historical-collector';

export async function POST() {
  const apiKey = process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY;
  
  if (!apiKey || apiKey === 'YourEtherscanApiKeyHere') {
    return NextResponse.json({
      success: false,
      error: 'No valid Etherscan API key configured'
    }, { status: 500 });
  }

  try {
    console.log('🚀 Starting complete historical data collection...');
    
    const dataset = await collectCompleteHistoricalDataset(apiKey);
    
    return NextResponse.json({
      success: true,
      message: 'Historical data collection completed',
      totalTransactions: dataset.transactions.size,
      oldestBlock: dataset.metadata.oldestBlock,
      newestBlock: dataset.metadata.newestBlock,
      addressStats: dataset.addressStats,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Historical collection failed:', errorMessage);
    
    return NextResponse.json({
      success: false,
      error: errorMessage,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    endpoint: 'Historical Data Collection',
    description: 'Use POST to trigger complete historical burn data collection',
    usage: 'POST /api/historical/collect',
    note: 'This collects all SHIB burn transactions from August 2020 to present'
  });
}