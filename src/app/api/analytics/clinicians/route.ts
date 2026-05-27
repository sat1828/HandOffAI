import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { computeClinicianPerformance } from '@/lib/analytics';

export async function GET(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { searchParams } = new URL(request.url);
  const wardId = searchParams.get('wardId') || 'ICU';

  try {
    const clinicians = await computeClinicianPerformance(wardId);
    return NextResponse.json(clinicians);
  } catch (error) {
    console.error('Analytics clinicians error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
