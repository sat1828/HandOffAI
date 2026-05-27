import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { auth } from '@/lib/auth.config';

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(user: { id: string; email: string; role: string }): string {
  const secret = process.env.JWT_SECRET!;
  return jwt.sign({ id: user.id, email: user.email, role: user.role }, secret, { expiresIn: '15m' });
}

export async function getSessionUser() {
  const session = await auth();
  const u = session?.user as any;
  if (!u?.id) return null;
  return {
    id: u.id,
    email: u.email || '',
    role: u.role || 'CLINICIAN',
    name: u.name || '',
  };
}

export function requireRole(...roles: string[]) {
  return async () => {
    const user = await getSessionUser();
    if (!user) return null;
    if (roles.length > 0 && !roles.includes(user.role)) return null;
    return user;
  };
}
