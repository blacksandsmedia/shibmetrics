#!/usr/bin/env node

// 5-Year Historical SHIB Burn Collection Script
// Usage: node scripts/collect-5year-history.js

console.log('🚀 SHIBMETRICS 5-Year Historical Collection');
console.log('==========================================');

async function main() {
  try {
    const baseUrl = process.env.SHIBMETRICS_URL || 'https://shibmetrics.com';
    const endpoint = `${baseUrl}/api/historical/complete-collection`;
    
    console.log(`📡 Triggering complete historical collection...`);
    console.log(`🔗 Endpoint: ${endpoint}`);
    
    const startTime = Date.now();
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'SHIBMETRICS-Historical-Collector/1.0'
      }
    });
    
    const result = await response.json();
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    
    if (response.ok && result.success) {
      console.log('\n✅ Collection completed successfully!');
      console.log(`⏱️  Duration: ${duration} seconds`);
      console.log(`📊 Total transactions: ${result.totalTransactions.toLocaleString()}`);
      console.log(`🧱 Block range: ${result.startBlock} → ${result.endBlock}`);
      console.log(`📅 Time range: ${result.timeRange.start.split('T')[0]} → ${result.timeRange.end.split('T')[0]}`);
      
      console.log('\n📍 Address breakdown:');
      Object.entries(result.addressCounts).forEach(([address, count]) => {
        const shortAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;
        console.log(`   ${shortAddress}: ${count.toLocaleString()} burns`);
      });
      
      console.log('\n🎉 Your SHIBMETRICS site now has complete 5-year burn history!');
      console.log(`🌐 Visit: ${baseUrl}/history to see all historical data`);
      
    } else {
      console.error('\n❌ Collection failed:');
      console.error(`   Status: ${response.status}`);
      console.error(`   Error: ${result.error || 'Unknown error'}`);
      console.error(`   Message: ${result.message || 'No details available'}`);
      
      if (result.endpoint) {
        console.log(`\n💡 Try: curl -X POST ${baseUrl}${result.endpoint}`);
      }
      
      process.exit(1);
    }
    
  } catch (error) {
    console.error('\n💥 Script failed:', error.message);
    console.error('\n🔧 Troubleshooting:');
    console.error('   1. Check that SHIBMETRICS_URL is set correctly');
    console.error('   2. Ensure the site is deployed and accessible');
    console.error('   3. Verify NEXT_PUBLIC_ETHERSCAN_API_KEY is configured');
    process.exit(1);
  }
}

// Check for help flag
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log('\nUsage: node scripts/collect-5year-history.js');
  console.log('\nEnvironment variables:');
  console.log('  SHIBMETRICS_URL    Your deployed site URL (default: https://shibmetrics.com)');
  console.log('\nThis script triggers collection of ALL SHIB burn transactions since August 2020.');
  console.log('The collection is stored persistently using Netlify Blobs and will be available');
  console.log('on your /history page with full pagination and filtering capabilities.');
  process.exit(0);
}

main();