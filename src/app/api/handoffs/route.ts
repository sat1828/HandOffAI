import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { searchParams } = new URL(request.url);
  const wardId = searchParams.get('wardId') || 'ICU';
  const limit = parseInt(searchParams.get('limit') || '20');
  const page = parseInt(searchParams.get('page') || '1');

  try {
    const [handoffs, total] = await Promise.all([
      prisma.handoff.findMany({
        where: { wardId },
        include: {
          flags: true,
          patient: { select: { name: true, bedId: true } },
          clinician: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: (page - 1) * limit,
      }),
      prisma.handoff.count({ where: { wardId } }),
    ]);

    return NextResponse.json({ handoffs, total, page, limit });
  } catch (error) {
    console.error('Handoffs GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
