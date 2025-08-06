import HomeClient from './HomeClient';

// Server Component that pre-fetches data to eliminate zeros on first load
export default async function Home() {
  // Fetch initial data on the server - no zeros!
  console.log('🚀 Server: Fetching initial data to prevent zeros...');
  
  let initialPriceData = null;
  let initialTotalBurnedData = null;
  let initialBurnsData = null;
  
  try {
    // Determine the base URL for API calls
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : process.env.NODE_ENV === 'development' 
        ? 'http://localhost:3000'
        : 'https://shibmetrics.com';
    
    // Fetch all data in parallel on the server
    const [priceResponse, totalBurnedResponse, burnsResponse] = await Promise.all([
      fetch(`${baseUrl}/api/price`, { cache: 'no-store' }),
      fetch(`${baseUrl}/api/total-burned`, { cache: 'no-store' }),
      fetch(`${baseUrl}/api/burns`, { cache: 'no-store' })
    ]);
    
    if (priceResponse.ok) {
      initialPriceData = await priceResponse.json();
      console.log('✅ Server: Price data fetched');
    }
    if (totalBurnedResponse.ok) {
      initialTotalBurnedData = await totalBurnedResponse.json();
      console.log('✅ Server: Total burned data fetched');
    }
    if (burnsResponse.ok) {
      initialBurnsData = await burnsResponse.json();
      console.log('✅ Server: Burns data fetched');
    }
    
    console.log('✅ Server: Initial data fetched successfully - no zeros for users!');
  } catch (error) {
    console.warn('⚠️ Server: Failed to fetch initial data:', error);
  }
  
  return (
    <HomeClient 
      initialPriceData={initialPriceData}
      initialTotalBurnedData={initialTotalBurnedData}
      initialBurnsData={initialBurnsData}
    />
  );
}