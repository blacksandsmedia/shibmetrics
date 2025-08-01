// Complete 5-Year Historical Collection API
// Triggers full historical data collection using Netlify Blobs storage

import { NextResponse } from 'next/server';
import { ComprehensiveHistoricalCollector } from '../../../../lib/historical-blobs-collector';

export async function POST() {
  try {
    console.log('🚀 Starting complete 5-year historical collection...');
    
    const apiKey = process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY;
    if (!apiKey || apiKey === 'YourEtherscanApiKeyHere') {
      return NextResponse.json({
        error: 'Missing Etherscan API key',
        message: 'Please configure NEXT_PUBLIC_ETHERSCAN_API_KEY environment variable'
      }, { status: 500 });
    }

    const collector = new ComprehensiveHistoricalCollector(apiKey);
    const dataset = await collector.collectHistoricalTransactions(1000);

    return NextResponse.json({
      success: true,
      message: '5-year historical collection completed successfully',
      totalTransactions: dataset.metadata.totalTransactions,
      startBlock: dataset.metadata.startBlock,
      endBlock: dataset.metadata.endBlock,
      timeRange: {
        start: dataset.transactions[0]?.timeStamp ? new Date(parseInt(dataset.transactions[0].timeStamp) * 1000).toISOString() : 'N/A',
        end: dataset.transactions[dataset.transactions.length - 1]?.timeStamp ? new Date(parseInt(dataset.transactions[dataset.transactions.length - 1].timeStamp) * 1000).toISOString() : 'N/A'
      },
      addressCounts: dataset.metadata.addressCounts,
      collectionProgress: dataset.metadata.collectionProgress
    });

  } catch (error) {
    console.error('❌ Complete historical collection failed:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json({
      error: 'Complete historical collection failed',
      message: errorMessage,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    const apiKey = process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        error: 'Missing Etherscan API key',
        message: 'Please configure NEXT_PUBLIC_ETHERSCAN_API_KEY environment variable'
      }, { status: 500 });
    }

    const collector = new ComprehensiveHistoricalCollector(apiKey);
    
    // Try to update existing dataset
    const updatedDataset = await collector.updateWithNewTransactions();
    
    if (!updatedDataset) {
      return NextResponse.json({
        error: 'No existing dataset found',
        message: 'Run POST /api/historical/complete-collection first to collect the full 5-year dataset',
        action: 'Use POST method to start full collection'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Dataset updated with new transactions',
      totalTransactions: updatedDataset.metadata.totalTransactions,
      lastSync: updatedDataset.metadata.lastFullSync,
      addressCounts: updatedDataset.metadata.addressCounts
    });

  } catch (error) {
    console.error('❌ Historical update failed:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json({
      error: 'Historical update failed',
      message: errorMessage,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}