import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')));
  const search = searchParams.get('search') || '';
  const days = parseInt(searchParams.get('days') || '7');

  const where: any = {};
  if (days > 0) {
    const since = new Date();
    since.setDate(since.getDate() - days);
    where.createdAt = { gte: since };
  }
  if (search) {
    where.OR = [
      { action: { contains: search } },
      { user: { email: { contains: search } } },
      { user: { name: { contains: search } } },
    ];
  }

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      select: { id: true, action: true, metadata: true, createdAt: true, user: { select: { name: true, email: true } }, handoff: { select: { id: true } } },
    }),
    prisma.auditLog.count({ where }),
  ]);

  return NextResponse.json({ logs, total, totalPages: Math.ceil(total / limit), page });
}
