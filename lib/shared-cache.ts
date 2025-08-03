// Shared cache system for persistent data across function invocations
import fs from 'fs';
import path from 'path';

// Cache interfaces
export interface PriceCache {
  price: number;
  priceChange24h: number;
  marketCap: number;
  circulatingSupply: number;
  totalSupply: number;
  lastUpdated: number;
}

export interface TotalBurnedCache {
  totalBurned: number;
  lastUpdated: number;
}

export interface BurnsCache {
  transactions: EtherscanTx[];
  lastUpdated: number;
  source: string;
  totalAddressesSuccess: number;
  totalAddressesAttempted: number;
}

interface EtherscanTx {
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

// Use /tmp for serverless persistence (survives for ~15 minutes)
const CACHE_DIR = '/tmp/shibmetrics-cache';
const PRICE_CACHE_FILE = path.join(CACHE_DIR, 'price.json');
const TOTAL_BURNED_CACHE_FILE = path.join(CACHE_DIR, 'total-burned.json');
const BURNS_CACHE_FILE = path.join(CACHE_DIR, 'burns.json');

// Ensure cache directory exists
function ensureCacheDir() {
  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
  }
}

// Generic cache functions
function saveCache<T>(filePath: string, data: T): void {
  try {
    ensureCacheDir();
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error(`❌ Failed to save cache ${filePath}:`, error);
  }
}

function loadCache<T>(filePath: string, maxAgeMs: number = 5 * 60 * 1000): T | null {
  try {
    if (!fs.existsSync(filePath)) {
      return null;
    }
    
    const stats = fs.statSync(filePath);
    const now = Date.now();
    const fileAge = now - stats.mtime.getTime();
    
    if (fileAge > maxAgeMs) {
      console.log(`⚠️ Cache ${filePath} is stale (${Math.round(fileAge / 1000)}s old)`);
      return null;
    }
    
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data) as T;
    
  } catch (error) {
    console.error(`❌ Failed to load cache ${filePath}:`, error);
    return null;
  }
}

// Price cache functions
export function savePriceCache(data: PriceCache): void {
  saveCache(PRICE_CACHE_FILE, data);
  console.log(`✅ Saved price cache: $${data.price}`);
}

export function loadPriceCache(): PriceCache | null {
  return loadCache<PriceCache>(PRICE_CACHE_FILE, 60 * 1000); // 60 seconds max age (shorter than 45s update cycle)
}

// Total burned cache functions
export function saveTotalBurnedCache(data: TotalBurnedCache): void {
  saveCache(TOTAL_BURNED_CACHE_FILE, data);
  console.log(`✅ Saved total burned cache: ${data.totalBurned.toLocaleString()}`);
}

export function loadTotalBurnedCache(): TotalBurnedCache | null {
  return loadCache<TotalBurnedCache>(TOTAL_BURNED_CACHE_FILE, 90 * 1000); // 90 seconds max age
}

// Burns cache functions
export function saveBurnsCache(data: BurnsCache): void {
  saveCache(BURNS_CACHE_FILE, data);
  console.log(`✅ Saved burns cache: ${data.transactions.length} transactions`);
}

export function loadBurnsCache(): BurnsCache | null {
  return loadCache<BurnsCache>(BURNS_CACHE_FILE, 60 * 1000); // 60 seconds max age
}

// Cache status check
export function getCacheStatus() {
  return {
    price: loadPriceCache() !== null,
    totalBurned: loadTotalBurnedCache() !== null,
    burns: loadBurnsCache() !== null,
    timestamp: new Date().toISOString()
  };
} 