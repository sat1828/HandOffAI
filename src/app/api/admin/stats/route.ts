import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const user = await getSessionUser();
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }
  const [totalUsers, totalHandoffs, totalPatients, totalFlags, totalAuditLogs] = await Promise.all([
    prisma.user.count(),
    prisma.handoff.count(),
    prisma.patient.count(),
    prisma.flag.count(),
    prisma.auditLog.count(),
  ]);
  const recentLogs = await prisma.auditLog.findMany({
    take: 20,
    orderBy: { createdAt: 'desc' },
    select: { id: true, action: true, metadata: true, createdAt: true, user: { select: { name: true, email: true } } },
  });
  return NextResponse.json({ totalUsers, totalHandoffs, totalPatients, totalFlags, totalAuditLogs, recentLogs });
}
