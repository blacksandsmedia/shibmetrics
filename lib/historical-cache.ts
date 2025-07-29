// Historical burn data accumulation system
import fs from 'fs';
import path from 'path';

export interface HistoricalBurn {
  hash: string;
  from: string;
  to: string;
  value: string;
  timeStamp: string;
  blockNumber: string;
  tokenName?: string;
  tokenSymbol?: string;
  tokenDecimal?: string;
  firstSeen: number; // When we first recorded this transaction
}

export interface HistoricalCache {
  burns: Map<string, HistoricalBurn>; // Use hash as key to prevent duplicates
  lastFullSync: number;
  oldestBlock: string; // Track how far back we've synced
  totalBurns: number;
  addresses: {
    [address: string]: {
      lastBlock: string;
      totalBurns: number;
    };
  };
}

const HISTORICAL_CACHE_FILE = path.join('/tmp', 'historical-burns.json');

// Ensure cache directory exists
function ensureCacheDir() {
  const cacheDir = path.dirname(HISTORICAL_CACHE_FILE);
  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true });
  }
}

// Load historical cache with Map deserialization
export function loadHistoricalCache(): HistoricalCache | null {
  try {
    if (!fs.existsSync(HISTORICAL_CACHE_FILE)) {
      console.log('ℹ️ No historical cache found, starting fresh');
      return {
        burns: new Map(),
        lastFullSync: 0,
        oldestBlock: '0',
        totalBurns: 0,
        addresses: {}
      };
    }
    
    const data = fs.readFileSync(HISTORICAL_CACHE_FILE, 'utf8');
    const parsed = JSON.parse(data);
    
    // Deserialize Map from array of [key, value] pairs
    const burns = new Map<string, HistoricalBurn>(parsed.burns || []);
    
    return {
      burns,
      lastFullSync: parsed.lastFullSync || 0,
      oldestBlock: parsed.oldestBlock || '0',
      totalBurns: parsed.totalBurns || 0,
      addresses: parsed.addresses || {}
    };
    
  } catch (error) {
    console.error('❌ Failed to load historical cache:', error);
    return null;
  }
}

// Save historical cache with Map serialization
export function saveHistoricalCache(cache: HistoricalCache): void {
  try {
    ensureCacheDir();
    
    // Serialize Map to array of [key, value] pairs
    const serializable = {
      ...cache,
      burns: Array.from(cache.burns.entries())
    };
    
    fs.writeFileSync(HISTORICAL_CACHE_FILE, JSON.stringify(serializable, null, 2));
    console.log(`✅ Saved historical cache: ${cache.totalBurns} total burns`);
    
  } catch (error) {
    console.error('❌ Failed to save historical cache:', error);
  }
}

// Add new burns to historical cache
export function addBurnsToHistory(newBurns: HistoricalBurn[]): HistoricalCache {
  const cache = loadHistoricalCache() || {
    burns: new Map<string, HistoricalBurn>(),
    lastFullSync: 0,
    oldestBlock: '0',
    totalBurns: 0,
    addresses: {} as { [address: string]: { lastBlock: string; totalBurns: number } }
  };
  
  let addedCount = 0;
  const now = Date.now();
  
  for (const burn of newBurns) {
    if (!cache.burns.has(burn.hash)) {
      cache.burns.set(burn.hash, { ...burn, firstSeen: now });
      addedCount++;
      
      // Update address tracking with explicit typing
      const addressKey = burn.to;
      if (!cache.addresses[addressKey]) {
        cache.addresses[addressKey] = { lastBlock: '0', totalBurns: 0 };
      }
      cache.addresses[addressKey].totalBurns++;
      
      // Update oldest block tracking
      if (cache.oldestBlock === '0' || parseInt(burn.blockNumber) < parseInt(cache.oldestBlock)) {
        cache.oldestBlock = burn.blockNumber;
      }
    }
  }
  
  cache.totalBurns = cache.burns.size;
  cache.lastFullSync = now;
  
  if (addedCount > 0) {
    saveHistoricalCache(cache);
    console.log(`📈 Added ${addedCount} new historical burns (total: ${cache.totalBurns})`);
  }
  
  return cache;
}

// Get paginated historical burns
export function getHistoricalBurns(page: number = 1, limit: number = 50, address?: string): {
  burns: HistoricalBurn[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
} {
  const cache = loadHistoricalCache();
  if (!cache) {
    return { burns: [], totalCount: 0, totalPages: 0, currentPage: 1 };
  }
  
  // Convert Map to array and filter if needed
  let allBurns = Array.from(cache.burns.values());
  
  if (address && address !== 'all') {
    allBurns = allBurns.filter(burn => burn.to.toLowerCase() === address.toLowerCase());
  }
  
  // Sort by timestamp (newest first)
  allBurns.sort((a, b) => parseInt(b.timeStamp) - parseInt(a.timeStamp));
  
  const totalCount = allBurns.length;
  const totalPages = Math.ceil(totalCount / limit);
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const burns = allBurns.slice(startIndex, endIndex);
  
  return {
    burns,
    totalCount,
    totalPages,
    currentPage: page
  };
}

// Get cache statistics
export function getHistoricalStats(): {
  totalBurns: number;
  oldestBlock: string;
  newestBlock: string;
  lastSync: Date | null;
  addressStats: { [address: string]: number };
} {
  const cache = loadHistoricalCache();
  if (!cache) {
    return {
      totalBurns: 0,
      oldestBlock: '0',
      newestBlock: '0',
      lastSync: null,
      addressStats: {}
    };
  }
  
  const burns = Array.from(cache.burns.values());
  const newestBlock = burns.length > 0 
    ? Math.max(...burns.map(b => parseInt(b.blockNumber))).toString()
    : '0';
  
  const addressStats: { [address: string]: number } = {};
  for (const [address, data] of Object.entries(cache.addresses)) {
    addressStats[address] = data.totalBurns;
  }
  
  return {
    totalBurns: cache.totalBurns,
    oldestBlock: cache.oldestBlock,
    newestBlock,
    lastSync: cache.lastFullSync ? new Date(cache.lastFullSync) : null,
    addressStats
  };
} 