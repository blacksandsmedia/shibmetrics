export async function GET() {
  return new Response(JSON.stringify({
    status: 'success',
    message: 'API routes are working!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'unknown'
  }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  });
} 