import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { searchParams } = new URL(request.url);
  const wardId = searchParams.get('wardId') || 'ICU';

  try {
    const patients = await prisma.patient.findMany({
      where: { wardId },
      include: {
        flags: { where: { resolved: false } },
        handoffs: { orderBy: { createdAt: 'desc' }, take: 3 },
      },
      orderBy: { acuity: 'asc' },
    });

    const formatted = patients.map(p => ({
      ...p,
      age_sex: `${new Date().getFullYear() - new Date(p.dob).getFullYear()}${p.sex}`,
      dob: p.dob.toISOString(),
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
      vitals: JSON.parse(p.vitals || '{}'),
      medications: JSON.parse(p.medications || '[]'),
      pendingLabs: JSON.parse(p.pendingLabs || '[]'),
      allergies: JSON.parse(p.allergies || '[]'),
      openActions: JSON.parse(p.openActions || '[]'),
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error('Patients GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
