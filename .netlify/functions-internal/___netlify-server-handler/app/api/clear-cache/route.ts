// API route to completely clear all caches
import { NextResponse } from 'next/server';
import fs from 'fs';

export async function POST() {
  try {
    console.log('🧹 Clearing all caches...');
    
    // List of potential cache files to clear
    const cacheFiles = [
      '/tmp/burn-cache.json',
      '/tmp/price-cache.json', 
      '/tmp/total-burned-cache.json',
      '/tmp/burns-cache.json',
      '/tmp/historical-burns.json'
    ];
    
    let clearedCount = 0;
    const results = [];
    
    for (const file of cacheFiles) {
      try {
        if (fs.existsSync(file)) {
          fs.unlinkSync(file);
          clearedCount++;
          results.push({ file, status: 'deleted' });
          console.log(`🗑️ Deleted cache file: ${file}`);
        } else {
          results.push({ file, status: 'not_found' });
        }
      } catch (error) {
        results.push({ 
          file, 
          status: 'error', 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
      }
    }
    
    console.log(`✅ Cache clearing complete: ${clearedCount} files cleared`);
    
    return NextResponse.json({
      success: true,
      message: `Cache cleared successfully`,
      filesCleared: clearedCount,
      totalChecked: cacheFiles.length,
      details: results,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Cache clearing failed:', error);
    return NextResponse.json({
      success: false,
      error: 'Cache clearing failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 