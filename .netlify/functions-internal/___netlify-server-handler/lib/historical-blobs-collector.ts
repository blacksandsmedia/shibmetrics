// Complete 5-Year Historical SHIB Burn Collection System with Netlify Blobs
// This system collects ALL burn transactions from SHIB launch to present

import { getStore } from '@netlify/blobs';

// SHIB Contract Address
const SHIB_CONTRACT_ADDRESS = '0x95ad61b0a150d79219dcf64e1e6cc01f0b64c4ce';

// Major burn addresses
const BURN_ADDRESSES = [
  { 
    address: '0xdead000000000000000042069420694206942069', 
    name: 'BA-1 (Main Burn Address)',
    startBlock: 10569013 // First SHIB transaction block
  },
  { 
    address: '0x000000000000000000000000000000000000dead', 
    name: 'BA-2 (Alternate Dead Address)',
    startBlock: 10569013
  },
  { 
    address: '0x0000000000000000000000000000000000000000', 
    name: 'BA-3 (Null Address)',
    startBlock: 10569013
  },
  { 
    address: '0x95ad61b0a150d79219dcf64e1e6cc01f0b64c4ce', 
    name: 'Community Address (Vitalik donations)',
    startBlock: 10569013
  }
];

// SHIB Launch Information
const SHIB_LAUNCH_BLOCK = 10569013; // Approximate block when SHIB started

// Data structures
export interface HistoricalBurnTransaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  timeStamp: string;
  blockNumber: string;
  tokenName: string;
  tokenSymbol: string;
  tokenDecimal: string;
  gasUsed?: string;
  gasPrice?: string;
}

export interface CollectionProgress {
  currentBlock: number;
  targetBlock: number;
  addressProgress: { [key: string]: number };
  totalTransactions: number;
  lastCollection: string;
  isComplete: boolean;
}

export interface HistoricalDataset {
  metadata: {
    version: string;
    startBlock: number;
    endBlock: number;
    totalTransactions: number;
    lastFullSync: string;
    addressCounts: { [key: string]: number };
    collectionProgress: CollectionProgress;
  };
  transactions: HistoricalBurnTransaction[];
}

// Netlify Blobs storage utilities
class HistoricalBlobsStorage {
  private store: ReturnType<typeof getStore>;
  
  constructor() {
    // Initialize Netlify Blobs store for historical data
    this.store = getStore('shibmetrics-historical');
  }

  async saveDataset(dataset: HistoricalDataset): Promise<void> {
    console.log(`💾 Saving ${dataset.transactions.length} transactions to Netlify Blobs...`);
    
    try {
      await this.store.setJSON('complete-dataset', dataset, {
        metadata: {
          version: dataset.metadata.version,
          totalTransactions: dataset.metadata.totalTransactions,
          lastSync: dataset.metadata.lastFullSync,
          dataIntegrityHash: this.calculateDataHash(dataset.transactions)
        }
      });
      
      console.log('✅ Historical dataset saved to Netlify Blobs');
    } catch (error) {
      console.error('❌ Failed to save dataset to Netlify Blobs:', error);
      throw error;
    }
  }

  async loadDataset(): Promise<HistoricalDataset | null> {
    try {
      const dataset = await this.store.get('complete-dataset', { type: 'json' });
      
      if (!dataset) {
        console.log('📚 No historical dataset found in Netlify Blobs');
        return null;
      }
      
      console.log(`📚 Loaded ${dataset.transactions?.length || 0} transactions from Netlify Blobs`);
      return dataset;
    } catch (error) {
      console.error('❌ Failed to load dataset from Netlify Blobs:', error);
      return null;
    }
  }

  async saveProgress(progress: CollectionProgress): Promise<void> {
    try {
      await this.store.setJSON('collection-progress', progress);
      console.log(`📊 Progress saved: Block ${progress.currentBlock}/${progress.targetBlock}`);
    } catch (error) {
      console.error('❌ Failed to save progress:', error);
    }
  }

  async loadProgress(): Promise<CollectionProgress | null> {
    try {
      const progress = await this.store.get('collection-progress', { type: 'json' });
      return progress || null;
    } catch (error) {
      console.error('❌ Failed to load progress:', error);
      return null;
    }
  }

  private calculateDataHash(transactions: HistoricalBurnTransaction[]): string {
    // Simple hash for data integrity
    const dataString = transactions.map(tx => `${tx.hash}-${tx.value}`).join('');
    let hash = 0;
    for (let i = 0; i < dataString.length; i++) {
      const char = dataString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(16);
  }
}

// Historical collection system
export class ComprehensiveHistoricalCollector {
  private storage: HistoricalBlobsStorage;
  private apiKey: string;

  constructor(apiKey: string) {
    this.storage = new HistoricalBlobsStorage();
    this.apiKey = apiKey;
  }

  async getCurrentBlock(): Promise<number> {
    try {
      const response = await fetch(`https://api.etherscan.io/api?module=proxy&action=eth_blockNumber&apikey=${this.apiKey}`);
      const data = await response.json();
      return parseInt(data.result, 16);
    } catch (error) {
      console.error('❌ Failed to get current block:', error);
      // Fallback to approximate current block (estimated)
      return 21500000;
    }
  }

  async collectHistoricalTransactions(batchSize: number = 1000): Promise<HistoricalDataset> {
    console.log('🚀 Starting comprehensive 5-year historical collection...');
    
    // Load existing dataset or create new one
    const dataset = await this.storage.loadDataset() || this.createEmptyDataset();
    const progress = await this.storage.loadProgress() || this.createInitialProgress();
    
    const currentBlock = await this.getCurrentBlock();
    progress.targetBlock = currentBlock;

    console.log(`📊 Collection scope: Block ${SHIB_LAUNCH_BLOCK} to ${currentBlock} (${currentBlock - SHIB_LAUNCH_BLOCK} blocks)`);

    try {
      // Collect from each burn address
      for (const burnAddress of BURN_ADDRESSES) {
        console.log(`\n🔍 Collecting from ${burnAddress.name}...`);
        
        const addressTransactions = await this.collectFromAddress(
          burnAddress.address,
          burnAddress.startBlock,
          currentBlock,
          progress,
          batchSize
        );

        // Merge transactions into dataset
        const existingHashes = new Set(dataset.transactions.map(tx => tx.hash));
        const newTransactions = addressTransactions.filter(tx => !existingHashes.has(tx.hash));
        
        dataset.transactions.push(...newTransactions);
        
        console.log(`✅ ${burnAddress.name}: Added ${newTransactions.length} new transactions (${addressTransactions.length} total found)`);
        
        // Update progress
        progress.addressProgress[burnAddress.address] = addressTransactions.length;
        progress.totalTransactions = dataset.transactions.length;
        await this.storage.saveProgress(progress);
      }

      // Sort transactions chronologically
      dataset.transactions.sort((a, b) => parseInt(a.timeStamp) - parseInt(b.timeStamp));

      // Update metadata
      dataset.metadata = {
        version: '2.0.0',
        startBlock: SHIB_LAUNCH_BLOCK,
        endBlock: currentBlock,
        totalTransactions: dataset.transactions.length,
        lastFullSync: new Date().toISOString(),
        addressCounts: this.calculateAddressCounts(dataset.transactions),
        collectionProgress: progress
      };

      // Save complete dataset
      await this.storage.saveDataset(dataset);

      console.log(`\n🎉 Historical collection complete!`);
      console.log(`📊 Total transactions: ${dataset.transactions.length}`);
      console.log(`📅 Date range: ${new Date(parseInt(dataset.transactions[0]?.timeStamp) * 1000).toISOString().split('T')[0]} to ${new Date(parseInt(dataset.transactions[dataset.transactions.length - 1]?.timeStamp) * 1000).toISOString().split('T')[0]}`);
      
      return dataset;

    } catch (error) {
      console.error('❌ Historical collection failed:', error);
      
      // Save progress even if failed
      await this.storage.saveProgress(progress);
      throw error;
    }
  }

  private async collectFromAddress(
    address: string,
    startBlock: number,
    endBlock: number,
    progress: CollectionProgress,
    batchSize: number
  ): Promise<HistoricalBurnTransaction[]> {
    const transactions: HistoricalBurnTransaction[] = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      try {
        // Add delay to respect API rate limits
        await this.delay(200);

        const url = `https://api.etherscan.io/api?module=account&action=tokentx&contractaddress=${SHIB_CONTRACT_ADDRESS}&address=${address}&startblock=${startBlock}&endblock=${endBlock}&page=${page}&offset=${batchSize}&sort=asc&apikey=${this.apiKey}`;
        
        console.log(`📡 Fetching page ${page} for ${address.slice(0, 10)}...`);
        
        const response = await fetch(url);
        const data = await response.json();

        if (data.status !== '1' || !data.result || data.result.length === 0) {
          hasMore = false;
          break;
        }

        // Filter for burn transactions (transfers TO this address)
        const burnTxs = data.result.filter((tx: Record<string, unknown>) => 
          (tx.to as string).toLowerCase() === address.toLowerCase() && 
          tx.tokenSymbol === 'SHIB'
        );

        transactions.push(...burnTxs.map((tx: Record<string, unknown>) => ({
          hash: tx.hash,
          from: tx.from,
          to: tx.to,
          value: tx.value,
          timeStamp: tx.timeStamp,
          blockNumber: tx.blockNumber,
          tokenName: tx.tokenName || 'SHIBA INU',
          tokenSymbol: tx.tokenSymbol || 'SHIB',
          tokenDecimal: tx.tokenDecimal || '18',
          gasUsed: tx.gasUsed,
          gasPrice: tx.gasPrice
        })));

        // Update progress
        progress.currentBlock = Math.max(progress.currentBlock, parseInt(data.result[data.result.length - 1]?.blockNumber || startBlock));
        
        console.log(`📊 Page ${page}: Found ${burnTxs.length} burns (Block ${progress.currentBlock})`);

        // Check if we got less than requested (indicates last page)
        if (data.result.length < batchSize) {
          hasMore = false;
        } else {
          page++;
        }

        // Periodic save during long collections
        if (transactions.length % 5000 === 0) {
          console.log(`💾 Periodic save: ${transactions.length} transactions collected...`);
          await this.storage.saveProgress(progress);
        }

      } catch (error) {
        console.error(`❌ Error fetching page ${page} for ${address}:`, error);
        
        // Wait longer before retrying
        await this.delay(1000);
        
        // Retry the same page once
        if (page === 1) {
          continue;
        } else {
          break;
        }
      }
    }

    return transactions;
  }

  private createEmptyDataset(): HistoricalDataset {
    return {
      metadata: {
        version: '2.0.0',
        startBlock: SHIB_LAUNCH_BLOCK,
        endBlock: SHIB_LAUNCH_BLOCK,
        totalTransactions: 0,
        lastFullSync: new Date().toISOString(),
        addressCounts: {},
        collectionProgress: this.createInitialProgress()
      },
      transactions: []
    };
  }

  private createInitialProgress(): CollectionProgress {
    return {
      currentBlock: SHIB_LAUNCH_BLOCK,
      targetBlock: SHIB_LAUNCH_BLOCK,
      addressProgress: {},
      totalTransactions: 0,
      lastCollection: new Date().toISOString(),
      isComplete: false
    };
  }

  private calculateAddressCounts(transactions: HistoricalBurnTransaction[]): { [key: string]: number } {
    const counts: { [key: string]: number } = {};
    
    transactions.forEach(tx => {
      counts[tx.to] = (counts[tx.to] || 0) + 1;
    });
    
    return counts;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Incremental update method for adding new transactions
  async updateWithNewTransactions(): Promise<HistoricalDataset | null> {
    console.log('🔄 Updating historical dataset with new transactions...');
    
    const dataset = await this.storage.loadDataset();
    if (!dataset) {
      console.log('⚠️ No existing dataset found. Run full collection first.');
      return null;
    }

    const currentBlock = await this.getCurrentBlock();
    const lastBlock = dataset.metadata.endBlock;

    if (currentBlock <= lastBlock) {
      console.log('✅ Dataset is already up to date');
      return dataset;
    }

    console.log(`📊 Updating from block ${lastBlock} to ${currentBlock}`);

    // Collect new transactions since last update
    let newTransactionsCount = 0;
    
    for (const burnAddress of BURN_ADDRESSES) {
      const newTransactions = await this.collectFromAddress(
        burnAddress.address,
        lastBlock + 1,
        currentBlock,
        dataset.metadata.collectionProgress,
        1000
      );

      // Add new transactions to dataset
      const existingHashes = new Set(dataset.transactions.map(tx => tx.hash));
      const uniqueNewTxs = newTransactions.filter(tx => !existingHashes.has(tx.hash));
      
      dataset.transactions.push(...uniqueNewTxs);
      newTransactionsCount += uniqueNewTxs.length;
    }

    // Sort and update metadata
    dataset.transactions.sort((a, b) => parseInt(a.timeStamp) - parseInt(b.timeStamp));
    
    dataset.metadata.endBlock = currentBlock;
    dataset.metadata.totalTransactions = dataset.transactions.length;
    dataset.metadata.lastFullSync = new Date().toISOString();
    dataset.metadata.addressCounts = this.calculateAddressCounts(dataset.transactions);

    // Save updated dataset
    await this.storage.saveDataset(dataset);

    console.log(`✅ Update complete: Added ${newTransactionsCount} new transactions`);
    console.log(`📊 Total transactions: ${dataset.transactions.length}`);
    
    return dataset;
  }
}

// Export the storage class for use in API routes
export { HistoricalBlobsStorage };