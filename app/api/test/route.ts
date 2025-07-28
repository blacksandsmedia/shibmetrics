import { NextResponse } from 'next/server';

export async function GET() {
  try {
    return NextResponse.json({
      status: 'success',
      message: 'API routes are working!',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'unknown'
    });
  } catch (error) {
    console.error('Test API error:', error);
    return NextResponse.json({
      status: 'error',
      message: 'API route failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 