import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';

export async function GET() {
  const user = await getSessionUser();
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: { id: true, email: true, name: true, role: true, createdAt: true, lastActive: true },
  });
  return NextResponse.json(users);
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }
  const { email, name, role } = await req.json();
  if (!email) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 });
  }
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: 'User already exists' }, { status: 409 });
  }
  const tempPassword = Math.random().toString(36).slice(2, 10) + 'A1!';
  const created = await prisma.user.create({
    data: {
      email,
      name: name || '',
      role: role || 'CLINICIAN',
      password: await hashPassword(tempPassword),
      emailVerified: new Date(),
    },
  });
  return NextResponse.json({ id: created.id, email: created.email, tempPassword });
}
