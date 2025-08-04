// High-performance in-memory cache for API responses
// Eliminates slow disk I/O on every request

import { EtherscanTx } from './burn-cache';

// Define specific cache data types
export interface BurnCacheData {
  transactions: EtherscanTx[];
  totalAddressesSuccess: number;
  totalAddressesAttempted: number;
}

export interface PriceCacheData {
  price: number;
  priceChange24h: number;
  marketCap: number;
  circulatingSupply: number;
  totalSupply: number;
  volume24h: number;
}

export interface TotalBurnedCacheData {
  totalBurned: number;
}

// Union type for all possible cache data
export type CacheData = BurnCacheData | PriceCacheData | TotalBurnedCacheData;

interface CacheEntry<T> {
  data: T;
  lastUpdated: number;
  source: string;
}

class MemoryCache {
  private cache: Map<string, CacheEntry<CacheData>> = new Map();
  private maxAge: number = 5 * 60 * 1000; // 5 minutes default

  // Get data from memory cache (instant)
  get<T>(key: string): CacheEntry<T> | null {
    const entry = this.cache.get(key);
    if (!entry) {
      return null;
    }

    // Check if cache is too old (but still return it - let caller decide)
    const age = Date.now() - entry.lastUpdated;
    console.log(`🏎️ Memory cache HIT for ${key}: ${Math.round(age/1000)}s old`);
    
    return entry as CacheEntry<T>;
  }

  // Set data in memory cache (instant)
  set<T>(key: string, data: T, source: string = 'memory'): void {
    this.cache.set(key, {
      data,
      lastUpdated: Date.now(),
      source
    });
    console.log(`💾 Memory cache SET for ${key}`);
  }

  // Check if cache exists and is fresh
  isFresh(key: string, maxAgeMs: number = this.maxAge): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    
    const age = Date.now() - entry.lastUpdated;
    return age < maxAgeMs;
  }

  // Clear specific cache entry
  clear(key: string): void {
    this.cache.delete(key);
    console.log(`🗑️ Memory cache CLEARED for ${key}`);
  }

  // Clear all cache
  clearAll(): void {
    this.cache.clear();
    console.log('🗑️ Memory cache CLEARED ALL');
  }

  // Get cache stats
  getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// Global singleton cache instance
const globalCache = new MemoryCache();

export default globalCache;

// Helper functions for common cache operations
export const cacheKeys = {
  BURN_DATA: 'burn_data',
  PRICE_DATA: 'price_data', 
  TOTAL_BURNED: 'total_burned'
} as const;

export type CacheKey = typeof cacheKeys[keyof typeof cacheKeys];

// Type-safe cache getters
export function getBurnData() {
  return globalCache.get<BurnCacheData>(cacheKeys.BURN_DATA);
}

export function getPriceData() {
  return globalCache.get<PriceCacheData>(cacheKeys.PRICE_DATA);
}

export function getTotalBurnedData() {
  return globalCache.get<TotalBurnedCacheData>(cacheKeys.TOTAL_BURNED);
}