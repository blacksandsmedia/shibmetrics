// Shared cache utility for burn data
import fs from 'fs';
import path from 'path';

export interface EtherscanTx {
  hash: string;
  from: string;
  to: string;
  value: string;
  timeStamp: string;
  blockNumber: string;
  tokenName?: string;
  tokenSymbol?: string;
  tokenDecimal?: string;
}

export interface BurnDataCache {
  transactions: EtherscanTx[];
  lastUpdated: number;
  source: string;
  totalAddressesSuccess: number;
  totalAddressesAttempted: number;
}

// Use /tmp directory in serverless environments (Netlify Functions)
const CACHE_FILE_PATH = path.join('/tmp', 'burn-data.json');

// Ensure cache directory exists
function ensureCacheDir() {
  const cacheDir = path.dirname(CACHE_FILE_PATH);
  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true });
  }
}

// Save burn data to cache
export function saveBurnCache(data: BurnDataCache): void {
  try {
    ensureCacheDir();
    fs.writeFileSync(CACHE_FILE_PATH, JSON.stringify(data, null, 2));
    console.log(`✅ Saved burn cache: ${data.transactions.length} transactions`);
  } catch (error) {
    console.error('❌ Failed to save burn cache:', error);
  }
}

// Load burn data from cache
export function loadBurnCache(): BurnDataCache | null {
  try {
    if (!fs.existsSync(CACHE_FILE_PATH)) {
      console.log('ℹ️ No burn cache file found');
      return null;
    }
    
    const data = fs.readFileSync(CACHE_FILE_PATH, 'utf8');
    const cache = JSON.parse(data) as BurnDataCache;
    
    // Always return cache if it exists - let the API handle staleness
    // Cache is only considered unusable if it's older than 24 hours (extreme case)
    const twentyFourHoursAgo = Date.now() - (24 * 60 * 60 * 1000);
    if (cache.lastUpdated < twentyFourHoursAgo) {
      console.log('⚠️ Cache is extremely stale (older than 24 hours) - discarding');
      return null;
    }
    
    const ageInSeconds = Math.round((Date.now() - cache.lastUpdated) / 1000);
    console.log(`✅ Loaded burn cache: ${cache.transactions.length} transactions from ${cache.source} (age: ${ageInSeconds}s)`);
    return cache;
    
  } catch (error) {
    console.error('❌ Failed to load burn cache:', error);
    return null;
  }
}

// Check if cache exists and is fresh
export function isCacheFresh(): boolean {
  try {
    const cache = loadBurnCache();
    return cache !== null;
  } catch {
    return false;
  }
} 