import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { emitToUser } from '@/lib/socket';

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { userId: targetUserId, type, title, message, link } = await request.json();

    if (!targetUserId || !title) {
      return NextResponse.json({ error: 'userId and title are required' }, { status: 400 });
    }

    const notification = await prisma.notification.create({
      data: {
        userId: targetUserId,
        type: type || 'handoff_assigned',
        title,
        message: message || '',
        link: link || null,
      },
    });

    emitToUser(targetUserId, 'notification', notification);

    return NextResponse.json(notification, { status: 201 });
  } catch (error) {
    console.error('Notification POST error:', error);
    return NextResponse.json({ error: 'Failed to create notification' }, { status: 500 });
  }
}

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json(notifications);
  } catch (error) {
    console.error('Notification GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
}
