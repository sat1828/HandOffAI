import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { computeQualityTrend } from '@/lib/analytics';

export async function GET(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { searchParams } = new URL(request.url);
  const wardId = searchParams.get('wardId') || 'ICU';
  const days = parseInt(searchParams.get('days') || '7');

  try {
    const trend = await computeQualityTrend(wardId, days);
    return NextResponse.json(trend);
  } catch (error) {
    console.error('Analytics quality error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
