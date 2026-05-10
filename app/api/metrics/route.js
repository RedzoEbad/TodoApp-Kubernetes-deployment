import { NextResponse } from 'next/server';
import client from 'prom-client';

// Production Level: Ensure metrics are only initialized once to prevent registration errors
if (!global._prometheus_initialized) {
  client.collectDefaultMetrics({ register: client.register });
  global._prometheus_initialized = true;
}

export async function GET(req) {
  // Security Check: Optional API Key protection
  // If you set METRICS_TOKEN in your environment variables, this endpoint will require it
  const authHeader = req.headers.get('authorization');
  const token = process.env.METRICS_TOKEN;

  if (token && authHeader !== `Bearer ${token}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const metrics = await client.register.metrics();
    return new NextResponse(metrics, {
      headers: {
        'Content-Type': client.register.contentType,
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (err) {
    console.error('Failed to collect metrics:', err);
    return new NextResponse('Error collecting metrics', { status: 500 });
  }
}
