import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const flags = await prisma.flag.findMany({
      include: { patient: { select: { name: true, bedId: true } } },
      orderBy: [{ severity: 'asc' }, { createdAt: 'desc' }],
    });

    return NextResponse.json(flags);
  } catch (error) {
    console.error('Flags GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
