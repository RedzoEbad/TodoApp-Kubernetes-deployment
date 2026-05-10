import { NextResponse } from 'next/server';
import client from 'prom-client';

// Initializing default metrics
const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics();

export async function GET() {
  const metrics = await client.register.metrics();
  return new NextResponse(metrics, {
    headers: {
      'Content-Type': client.register.contentType,
    },
  });
}
