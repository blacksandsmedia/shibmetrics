// Historical SHIB Burn Data Collection System
// Collects, validates, and maintains complete 5-year historical dataset

import fs from 'fs';
import path from 'path';

export interface BurnTransaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  timeStamp: string;
  blockNumber: string;
  tokenName: string;
  tokenSymbol: string;
  tokenDecimal: string;
  firstSeen: number;
  validated: boolean;
  locked: boolean; // Once locked, never re-fetch
}

export interface HistoricalDataset {
  transactions: Map<string, BurnTransaction>;
  metadata: {
    oldestBlock: string;
    newestBlock: string;
    totalTransactions: number;
    lastFullSync: number;
    lastValidation: number;
    dataIntegrityHash: string;
  };
  addressStats: {
    [address: string]: {
      totalBurns: number;
      oldestTimestamp: string;
      newestTimestamp: string;
      totalValue: string;
    };
  };
}

const SHIB_CONTRACT_ADDRESS = '0x95ad61b0a150d79219dcf64e1e6cc01f0b64c4ce';
const HISTORICAL_DATA_FILE = '/tmp/shibmetrics-historical-complete.json';
// const VALIDATION_LOG_FILE = '/tmp/shibmetrics-validation-log.json';

// Burn addresses to track
const BURN_ADDRESSES = [
  { name: 'BA-1', address: '0xdead000000000000000042069420694206942069' },
  { name: 'BA-2', address: '0x000000000000000000000000000000000000dead' },
  { name: 'BA-3', address: '0x0000000000000000000000000000000000000000' },
  { name: 'CA', address: '0x95ad61b0a150d79219dcf64e1e6cc01f0b64c4ce' }
];

// SHIB launch date - start of historical collection
const SHIB_LAUNCH_DATE = new Date('2020-08-01');
const SHIB_LAUNCH_TIMESTAMP = Math.floor(SHIB_LAUNCH_DATE.getTime() / 1000);

/**
 * Load complete historical dataset
 */
export function loadHistoricalDataset(): HistoricalDataset | null {
  try {
    if (!fs.existsSync(HISTORICAL_DATA_FILE)) {
      console.log('📚 No historical dataset found, will create new one');
      return null;
    }
    
    const data = JSON.parse(fs.readFileSync(HISTORICAL_DATA_FILE, 'utf8'));
    
    // Reconstruct Map from serialized data
    const transactions = new Map<string, BurnTransaction>();
    if (data.transactions && Array.isArray(data.transactions)) {
      for (const [hash, tx] of data.transactions) {
        transactions.set(hash, tx);
      }
    }
    
    const dataset: HistoricalDataset = {
      transactions,
      metadata: data.metadata || {
        oldestBlock: '0',
        newestBlock: '0',
        totalTransactions: 0,
        lastFullSync: 0,
        lastValidation: 0,
        dataIntegrityHash: ''
      },
      addressStats: data.addressStats || {}
    };
    
    console.log(`📚 Loaded historical dataset: ${dataset.transactions.size} transactions`);
    return dataset;
    
  } catch (error) {
    console.error('❌ Failed to load historical dataset:', error);
    return null;
  }
}

/**
 * Save complete historical dataset
 */
export function saveHistoricalDataset(dataset: HistoricalDataset): void {
  try {
    // Convert Map to Array for serialization
    const dataToSave = {
      transactions: Array.from(dataset.transactions.entries()),
      metadata: dataset.metadata,
      addressStats: dataset.addressStats
    };
    
    // Ensure directory exists
    const dir = path.dirname(HISTORICAL_DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(HISTORICAL_DATA_FILE, JSON.stringify(dataToSave, null, 2));
    console.log(`📚 Saved historical dataset: ${dataset.transactions.size} transactions`);
    
  } catch (error) {
    console.error('❌ Failed to save historical dataset:', error);
    throw error;
  }
}

/**
 * Calculate data integrity hash for validation
 */
export function calculateDataIntegrityHash(transactions: Map<string, BurnTransaction>): string {
  const sortedHashes = Array.from(transactions.keys()).sort();
  const hashString = sortedHashes.join('|');
  
  // Simple hash function for integrity checking
  let hash = 0;
  for (let i = 0; i < hashString.length; i++) {
    const char = hashString.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  return hash.toString(16);
}

/**
 * Fetch historical transactions for a specific address with pagination
 */
export async function fetchHistoricalTransactionsForAddress(
  address: string,
  addressName: string,
  apiKey: string,
  startBlock = 1,
  endBlock = 99999999
): Promise<BurnTransaction[]> {
  
  const allTransactions: BurnTransaction[] = [];
  const maxOffset = 10000; // Etherscan limit
  let page = 1;
  
  console.log(`📚 Collecting historical data for ${addressName} (${address})`);
  
  while (true) {
    try {
      const offset = Math.min(maxOffset, 10000); // Always use max for efficiency
      const url = `https://api.etherscan.io/api?module=account&action=tokentx&contractaddress=${SHIB_CONTRACT_ADDRESS}&address=${address}&page=${page}&offset=${offset}&startblock=${startBlock}&endblock=${endBlock}&sort=desc&apikey=${apiKey}`;
      
      console.log(`📚 Page ${page}: Fetching up to ${offset} transactions...`);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(30000) // 30 second timeout
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.status === '0') {
        if (data.message && data.message.includes('No transactions found')) {
          console.log(`📚 ${addressName}: No more transactions found`);
          break;
        } else if (data.message && data.message.includes('rate limit')) {
          console.log(`⚠️ Rate limit hit for ${addressName}, waiting 10 seconds...`);
          await new Promise(resolve => setTimeout(resolve, 10000));
          continue; // Retry same page
        } else {
          console.log(`⚠️ ${addressName}: API returned status 0: ${data.message}`);
          break;
        }
      }
      
      if (!data.result || !Array.isArray(data.result) || data.result.length === 0) {
        console.log(`📚 ${addressName}: No more transactions on page ${page}`);
        break;
      }
      
      // Process transactions
      for (const tx of data.result) {
        try {
          const burnTx: BurnTransaction = {
            hash: tx.hash,
            from: tx.from,
            to: tx.to,
            value: tx.value,
            timeStamp: tx.timeStamp,
            blockNumber: tx.blockNumber,
            tokenName: tx.tokenName || 'SHIBA INU',
            tokenSymbol: tx.tokenSymbol || 'SHIB',
            tokenDecimal: tx.tokenDecimal || '18',
            firstSeen: Date.now(),
            validated: false,
            locked: false
          };
          
          // Only include transactions with positive value
          const value = BigInt(burnTx.value || '0');
          if (value > BigInt(0)) {
            allTransactions.push(burnTx);
          }
          
        } catch (error) {
          console.log(`⚠️ Skipping invalid transaction: ${error}`);
        }
      }
      
      console.log(`📚 ${addressName} Page ${page}: Collected ${data.result.length} transactions (${allTransactions.length} total)`);
      
      // If we got less than requested, we've reached the end
      if (data.result.length < offset) {
        console.log(`📚 ${addressName}: Reached end of data (got ${data.result.length} < ${offset})`);
        break;
      }
      
      page++;
      
      // Rate limiting: wait between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error(`❌ Error fetching page ${page} for ${addressName}:`, error);
      
      // Retry with exponential backoff
      await new Promise(resolve => setTimeout(resolve, Math.min(5000 * page, 30000)));
      
      // Skip to next page if we keep failing
      if (page > 3) {
        console.log(`⚠️ Too many failures for ${addressName}, stopping collection`);
        break;
      }
    }
  }
  
  console.log(`✅ ${addressName}: Collected ${allTransactions.length} total transactions`);
  return allTransactions;
}

/**
 * Collect complete historical dataset for all burn addresses
 */
export async function collectCompleteHistoricalDataset(apiKey: string): Promise<HistoricalDataset> {
  console.log('🚀 Starting complete historical data collection...');
  
  // Load existing dataset or create new one
  let dataset = loadHistoricalDataset();
  if (!dataset) {
    dataset = {
      transactions: new Map(),
      metadata: {
        oldestBlock: '99999999999',
        newestBlock: '0',
        totalTransactions: 0,
        lastFullSync: 0,
        lastValidation: 0,
        dataIntegrityHash: ''
      },
      addressStats: {}
    };
  }
  
  const allNewTransactions: BurnTransaction[] = [];
  
  // Collect from each burn address
  for (const burnAddr of BURN_ADDRESSES) {
    try {
      const transactions = await fetchHistoricalTransactionsForAddress(
        burnAddr.address,
        burnAddr.name,
        apiKey
      );
      
      allNewTransactions.push(...transactions);
      
      // Update address stats
      if (transactions.length > 0) {
        const timestamps = transactions.map(tx => parseInt(tx.timeStamp)).sort((a, b) => a - b);
        const values = transactions.map(tx => BigInt(tx.value || '0'));
        const totalValue = values.reduce((sum, val) => sum + val, BigInt(0));
        
        dataset.addressStats[burnAddr.address] = {
          totalBurns: transactions.length,
          oldestTimestamp: timestamps[0].toString(),
          newestTimestamp: timestamps[timestamps.length - 1].toString(),
          totalValue: totalValue.toString()
        };
      }
      
    } catch (error) {
      console.error(`❌ Failed to collect data for ${burnAddr.name}:`, error);
    }
  }
  
  // Merge new transactions with existing dataset
  let addedCount = 0;
  for (const tx of allNewTransactions) {
    if (!dataset.transactions.has(tx.hash)) {
      dataset.transactions.set(tx.hash, tx);
      addedCount++;
      
      // Update metadata
      const blockNum = parseInt(tx.blockNumber);
      if (blockNum < parseInt(dataset.metadata.oldestBlock)) {
        dataset.metadata.oldestBlock = tx.blockNumber;
      }
      if (blockNum > parseInt(dataset.metadata.newestBlock)) {
        dataset.metadata.newestBlock = tx.blockNumber;
      }
    }
  }
  
  // Update metadata
  dataset.metadata.totalTransactions = dataset.transactions.size;
  dataset.metadata.lastFullSync = Date.now();
  dataset.metadata.dataIntegrityHash = calculateDataIntegrityHash(dataset.transactions);
  
  console.log(`✅ Historical collection complete: Added ${addedCount} new transactions (${dataset.transactions.size} total)`);
  
  // Save the dataset
  saveHistoricalDataset(dataset);
  
  return dataset;
}

/**
 * Validate data integrity and completeness
 */
export function validateDatasetIntegrity(dataset: HistoricalDataset): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  stats: Record<string, unknown>;
} {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Check data integrity hash
  const currentHash = calculateDataIntegrityHash(dataset.transactions);
  if (currentHash !== dataset.metadata.dataIntegrityHash) {
    errors.push(`Data integrity hash mismatch: expected ${dataset.metadata.dataIntegrityHash}, got ${currentHash}`);
  }
  
  // Check for duplicate transactions
  const hashes = new Set<string>();
  const duplicates: string[] = [];
  for (const [hash, _tx] of dataset.transactions) {
    if (hashes.has(hash)) {
      duplicates.push(hash);
    }
    hashes.add(hash);
  }
  
  if (duplicates.length > 0) {
    errors.push(`Found ${duplicates.length} duplicate transactions`);
  }
  
  // Check timestamp ordering and validity
  let invalidTimestamps = 0;
  let futureTimestamps = 0;
  const now = Math.floor(Date.now() / 1000);
  
  for (const [_hash, tx] of dataset.transactions) {
    const timestamp = parseInt(tx.timeStamp);
    
    if (isNaN(timestamp) || timestamp < SHIB_LAUNCH_TIMESTAMP) {
      invalidTimestamps++;
    }
    
    if (timestamp > now + 3600) { // Allow 1 hour in future for clock differences
      futureTimestamps++;
    }
  }
  
  if (invalidTimestamps > 0) {
    warnings.push(`Found ${invalidTimestamps} transactions with invalid timestamps`);
  }
  
  if (futureTimestamps > 0) {
    warnings.push(`Found ${futureTimestamps} transactions with future timestamps`);
  }
  
  // Generate stats
  const stats = {
    totalTransactions: dataset.transactions.size,
    duplicates: duplicates.length,
    invalidTimestamps,
    futureTimestamps,
    addressBreakdown: Object.keys(dataset.addressStats).reduce((acc, addr) => {
      acc[addr] = dataset.addressStats[addr].totalBurns;
      return acc;
    }, {} as Record<string, number>)
  };
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    stats
  };
}