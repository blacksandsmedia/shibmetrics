// Historical Burns API - Serves complete 5-year historical dataset

import { NextResponse } from 'next/server';
import { loadHistoricalDataset } from '../../../../lib/historical-collector';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '100'), 1000);
    const page = Math.max(parseInt(url.searchParams.get('page') || '1'), 1);
    const addressFilter = url.searchParams.get('address');
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');
    
    console.log(`📚 Historical burns API: limit=${limit}, page=${page}, address=${addressFilter}`);
    
    // Load historical dataset
    const dataset = loadHistoricalDataset();
    
    if (!dataset) {
      return NextResponse.json({
        error: 'Historical dataset not available',
        message: 'Please trigger historical data collection first',
        endpoint: '/api/historical/collect',
        timestamp: new Date().toISOString()
      }, { status: 503 });
    }
    
    // Convert Map to Array for processing
    let transactions = Array.from(dataset.transactions.values());
    
    // Apply filters
    if (addressFilter) {
      const filterAddress = addressFilter.toLowerCase();
      transactions = transactions.filter(tx => 
        tx.to.toLowerCase() === filterAddress || 
        tx.from.toLowerCase() === filterAddress
      );
    }
    
    if (startDate) {
      const startTimestamp = Math.floor(new Date(startDate).getTime() / 1000);
      transactions = transactions.filter(tx => parseInt(tx.timeStamp) >= startTimestamp);
    }
    
    if (endDate) {
      const endTimestamp = Math.floor(new Date(endDate).getTime() / 1000);
      transactions = transactions.filter(tx => parseInt(tx.timeStamp) <= endTimestamp);
    }
    
    // Sort by timestamp (newest first)
    transactions.sort((a, b) => parseInt(b.timeStamp) - parseInt(a.timeStamp));
    
    // Calculate pagination
    const totalTransactions = transactions.length;
    const totalPages = Math.ceil(totalTransactions / limit);
    const offset = (page - 1) * limit;
    const paginatedTransactions = transactions.slice(offset, offset + limit);
    
    // Remove internal fields from response
    const cleanTransactions = paginatedTransactions.map(tx => ({
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
    
    return NextResponse.json({
      transactions: cleanTransactions,
      pagination: {
        page,
        limit,
        totalTransactions,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1
      },
      filters: {
        address: addressFilter,
        startDate,
        endDate
      },
      metadata: {
        dataSource: 'historical-dataset',
        oldestBlock: dataset.metadata.oldestBlock,
        newestBlock: dataset.metadata.newestBlock,
        lastSync: new Date(dataset.metadata.lastFullSync).toISOString(),
        lastValidation: new Date(dataset.metadata.lastValidation).toISOString(),
        dataIntegrityHash: dataset.metadata.dataIntegrityHash
      },
      addressStats: dataset.addressStats,
      timestamp: new Date().toISOString()
    }, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300' // 5 minute cache
      }
    });
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Historical burns API error:', errorMessage);
    
    return NextResponse.json({
      error: 'Failed to load historical burns',
      message: errorMessage,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}