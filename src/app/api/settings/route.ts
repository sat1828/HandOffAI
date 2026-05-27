import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const dbUser = await prisma.user.findUnique({ where: { id: user.id }, select: { settings: true } });
  const settings = dbUser?.settings ? JSON.parse(dbUser.settings) : {};
  return NextResponse.json(settings);
}

export async function PUT(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const body = await req.json();
  await prisma.user.update({
    where: { id: user.id },
    data: { settings: JSON.stringify(body) },
  });
  return NextResponse.json({ ok: true });
}
