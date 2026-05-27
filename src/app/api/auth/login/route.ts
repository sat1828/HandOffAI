import { prisma } from '@/lib/prisma';
import { verifyPassword } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { signIn } from '@/lib/auth.config';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user?.password) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const valid = await verifyPassword(password, user.password);
    if (!valid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    if (!user.emailVerified) {
      return NextResponse.json({ error: 'EMAIL_NOT_VERIFIED', message: 'Please verify your email before signing in.' }, { status: 403 });
    }

    await prisma.user.update({ where: { id: user.id }, data: { lastActive: new Date() } });

    const result = await signIn('credentials', { email, password, redirect: false });
    if (!result?.ok) {
      return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
