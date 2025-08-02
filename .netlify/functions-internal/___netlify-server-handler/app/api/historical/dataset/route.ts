// Historical Dataset API - Serves complete 5-year dataset from Netlify Blobs
// Supports pagination, filtering, and metadata queries

import { NextResponse } from 'next/server';
import { HistoricalBlobsStorage } from '../../../../lib/historical-blobs-collector';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '100'), 25000);
    const page = Math.max(parseInt(url.searchParams.get('page') || '1'), 1);
    const addressFilter = url.searchParams.get('address');
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');
    const metadataOnly = url.searchParams.get('metadata') === 'true';
    
    console.log(`📚 Historical dataset API: limit=${limit}, page=${page}, address=${addressFilter}, metadata=${metadataOnly}`);
    
    const storage = new HistoricalBlobsStorage();
    const dataset = await storage.loadDataset();
    
    if (!dataset) {
      return NextResponse.json({
        error: 'Historical dataset not available',
        message: 'No 5-year historical dataset found. Please run full collection using POST /api/historical/complete-collection',
        endpoint: '/api/historical/complete-collection',
        timestamp: new Date().toISOString()
      }, { status: 404 });
    }

    // If only metadata requested
    if (metadataOnly) {
      return NextResponse.json({
        metadata: dataset.metadata,
        summary: {
          totalTransactions: dataset.metadata.totalTransactions,
          dateRange: {
            start: dataset.transactions[0]?.timeStamp ? new Date(parseInt(dataset.transactions[0].timeStamp) * 1000).toISOString().split('T')[0] : 'N/A',
            end: dataset.transactions[dataset.transactions.length - 1]?.timeStamp ? new Date(parseInt(dataset.transactions[dataset.transactions.length - 1].timeStamp) * 1000).toISOString().split('T')[0] : 'N/A'
          },
          addressBreakdown: dataset.metadata.addressCounts
        },
        timestamp: new Date().toISOString()
      });
    }

    // Apply filters
    let filteredTransactions = [...dataset.transactions];

    // Filter by address
    if (addressFilter && addressFilter !== 'all') {
      filteredTransactions = filteredTransactions.filter(tx => 
        tx.to.toLowerCase() === addressFilter.toLowerCase()
      );
    }

    // Filter by date range
    if (startDate) {
      const startTimestamp = Math.floor(new Date(startDate).getTime() / 1000);
      filteredTransactions = filteredTransactions.filter(tx => 
        parseInt(tx.timeStamp) >= startTimestamp
      );
    }

    if (endDate) {
      const endTimestamp = Math.floor(new Date(endDate).getTime() / 1000);
      filteredTransactions = filteredTransactions.filter(tx => 
        parseInt(tx.timeStamp) <= endTimestamp
      );
    }

    // Calculate pagination
    const totalTransactions = filteredTransactions.length;
    const totalPages = Math.ceil(totalTransactions / limit);
    const offset = (page - 1) * limit;
    const paginatedTransactions = filteredTransactions.slice(offset, offset + limit);

    // Response with complete dataset information
    return NextResponse.json({
      transactions: paginatedTransactions,
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
        dataSource: 'netlify-blobs-5year-dataset',
        collectionVersion: dataset.metadata.version,
        startBlock: dataset.metadata.startBlock,
        endBlock: dataset.metadata.endBlock,
        lastSync: dataset.metadata.lastFullSync,
        totalDatasizeTransactions: dataset.metadata.totalTransactions,
        addressCounts: dataset.metadata.addressCounts
      },
      summary: {
        years_of_data: dataset.transactions.length > 1 ? Math.round((parseInt(dataset.transactions[dataset.transactions.length - 1]?.timeStamp || '0') - parseInt(dataset.transactions[0]?.timeStamp || '0')) / (365.25 * 24 * 3600) * 10) / 10 : 0,
        earliest_burn: dataset.transactions[0]?.timeStamp ? new Date(parseInt(dataset.transactions[0].timeStamp) * 1000).toISOString().split('T')[0] : 'N/A',
        latest_burn: dataset.transactions[dataset.transactions.length - 1]?.timeStamp ? new Date(parseInt(dataset.transactions[dataset.transactions.length - 1].timeStamp) * 1000).toISOString().split('T')[0] : 'N/A'
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Historical dataset API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json({
      error: 'Failed to load historical dataset',
      message: errorMessage,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}