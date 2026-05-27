import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const handoff = await prisma.handoff.findUnique({
      where: { id },
      include: {
        flags: true,
        patient: { select: { name: true, bedId: true, diagnosis: true } },
        clinician: { select: { name: true, email: true } },
        auditLogs: true,
      },
    });

    if (!handoff) {
      return NextResponse.json({ error: 'Handoff not found' }, { status: 404 });
    }

    return NextResponse.json(handoff);
  } catch (error) {
    console.error('Handoff detail error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
