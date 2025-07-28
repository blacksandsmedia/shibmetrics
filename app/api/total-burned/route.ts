import { NextResponse } from 'next/server';
import axios from 'axios';

const SHIB_CONTRACT_ADDRESS = '0x95ad61b0a150d79219dcf64e1e6cc01f0b64c4ce';

// Burn addresses mapped by name (only valid Etherscan-queryable addresses)
const BURN_ADDRESSES = {
  'Community Address': '0x95ad61b0a150d79219dcf64e1e6cc01f0b64c4ce', // SHIB Contract - Community burns (CA)
  'Vitalik Burn Alt': '0xdead000000000000000042069420694206942069', // Alternative Vitalik burn address (BA-1)
  'Dead Address 1': '0x000000000000000000000000000000000000dead', // Standard dead address (BA-2)
  'Null Address': '0x0000000000000000000000000000000000000000', // Genesis/null address (Black Hole - BA-3)
  'Vitalik Burn Original': '0xD7B7df10Cb1Dc2d1d15e7D00bcb244a7cfAc61cC', // Original Vitalik burn address
};

export async function GET() {
  console.log('🔥 Calculating total burned from APIs...');
  
  // Accurate total from shibburn.com: 410,750,102,615,531 SHIB
  const ACCURATE_TOTAL_BURNED = 410750102615531;
  
  try {
    const apiKey = process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY;
    
    if (!apiKey || apiKey === 'YourEtherscanApiKeyHere') {
      console.log('⚠️  No valid API key found - using verified shibburn.com total');
      return new Response(JSON.stringify({
        totalBurned: ACCURATE_TOTAL_BURNED,
        isFromCache: false,
        source: 'shibburn.com (no API key)'
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=300'
        },
      });
    }

    let totalBurned = 0;
    let successfulQueries = 0;

    for (const [name, address] of Object.entries(BURN_ADDRESSES)) {
      const retries = 2;
      let success = false;
      
      for (let attempt = 0; attempt <= retries && !success; attempt++) {
        try {
          console.log(`🔥 Fetching balance for ${name} (attempt ${attempt + 1}/${retries + 1})`);
          
          const response = await fetch(
            `https://api.etherscan.io/api?module=account&action=tokenbalance&contractaddress=${SHIB_CONTRACT_ADDRESS}&address=${address}&tag=latest&apikey=${apiKey}`,
            {
              method: 'GET',
              headers: {
                'Accept': 'application/json',
              },
            }
          );

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json();

          if (data.status === '1' && data.result) {
            const balance = parseInt(data.result) / 1e18; // Convert from wei to SHIB
            totalBurned += balance;
            successfulQueries++;
            success = true;
            console.log(`✅ ${name}: ${balance.toLocaleString()} SHIB burned`);
          } else {
            console.log(`⚠️  Etherscan returned for ${name}: ${data.message}`);
            if (attempt < retries) {
              await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
            }
          }
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          console.log(`⚠️  Error on attempt ${attempt + 1} for ${name}:`, errorMessage);
          if (attempt < retries) {
            await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
          }
        }
      }
      
      if (!success) {
        console.log(`❌ Failed to get balance for ${name} after ${retries + 1} attempts`);
      }
      
      // Reduced delay between different addresses for faster data retrieval
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    console.log(`📊 API Summary: ${successfulQueries}/${Object.keys(BURN_ADDRESSES).length} addresses queried successfully, total: ${totalBurned.toLocaleString()} SHIB`);

    if (totalBurned > 0 && successfulQueries > 0) {
      // Sanity check - if the API result is vastly different from known data, use fallback
      const percentDifference = Math.abs(totalBurned - ACCURATE_TOTAL_BURNED) / ACCURATE_TOTAL_BURNED * 100;
      
      if (percentDifference > 50) {
        console.log(`⚠️  API result differs significantly (${percentDifference.toFixed(1)}%) from verified data, using fallback`);
        return new Response(JSON.stringify({
          totalBurned: ACCURATE_TOTAL_BURNED,
          isFromCache: false,
          source: 'shibburn.com (fallback due to API discrepancy)'
        }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'public, max-age=300'
          },
        });
      }

      console.log(`✅ Total burned from API: ${totalBurned.toLocaleString()} SHIB`);
      return new Response(JSON.stringify({
        totalBurned: totalBurned,
        isFromCache: false,
        source: `etherscan (${successfulQueries}/${Object.keys(BURN_ADDRESSES).length} addresses)`
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=300'
        },
      });
    } else {
      console.log(`⚠️  Insufficient API data (${successfulQueries} successful queries), using verified total`);
      return new Response(JSON.stringify({
        totalBurned: ACCURATE_TOTAL_BURNED,
        isFromCache: false,
        source: 'shibburn.com (API insufficient)'
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=300'
        },
      });
    }
  } catch (error) {
    console.error('❌ Error calculating total burned:', error);
    return new Response(JSON.stringify({
      totalBurned: ACCURATE_TOTAL_BURNED,
      isFromCache: false,
      source: 'shibburn.com (error fallback)'
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300'
      },
    });
  }
} 