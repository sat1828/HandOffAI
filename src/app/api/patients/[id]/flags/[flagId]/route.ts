import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string; flagId: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id, flagId } = await params;
    const flag = await prisma.flag.update({
      where: { id: flagId },
      data: { resolved: true, resolvedAt: new Date() },
    });

    return NextResponse.json(flag);
  } catch (error) {
    console.error('Flag resolve error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
