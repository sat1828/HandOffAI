import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser, requireRole } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const user = await requireRole('CLINICIAN', 'ADMIN')();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { patientId, wardId, transcript, extractedData, qualityScore, durationSeconds } = await request.json();

    if (!patientId || !wardId) {
      return NextResponse.json({ error: 'Patient and ward required' }, { status: 400 });
    }

    const handoff = await prisma.handoff.create({
      data: {
        patientId,
        wardId,
        clinicianId: user.id,
        transcript,
        extractedData: JSON.stringify(extractedData || {}),
        sbarNote: JSON.stringify({
          situation: extractedData?.sbar_situation || '',
          background: extractedData?.sbar_background || '',
          assessment: extractedData?.sbar_assessment || '',
          recommendation: extractedData?.sbar_recommendation || '',
        }),
        qualityScore: qualityScore || 0,
        durationSeconds: durationSeconds || 0,
        fhirWriteStatus: 'success',
      },
      include: {
        flags: true,
        patient: { select: { name: true, bedId: true } },
        clinician: { select: { id: true, name: true } },
      },
    });

    // Create flags from extracted data
    if (extractedData?.flags) {
      for (const flag of extractedData.flags) {
        await prisma.flag.create({
          data: {
            handoffId: handoff.id,
            patientId,
            severity: flag.severity || 'INFO',
            title: flag.title || 'Clinical flag',
            description: flag.description || '',
          },
        });
      }
    }

    // Audit log
    await prisma.auditLog.create({
      data: {
        handoffId: handoff.id,
        userId: user.id,
        action: 'SAVE',
        metadata: JSON.stringify({ qualityScore, durationSeconds }),
      },
    });

    const saved = await prisma.handoff.findUnique({
      where: { id: handoff.id },
      include: { flags: true, patient: { select: { name: true, bedId: true } }, clinician: { select: { id: true, name: true } } },
    });

    return NextResponse.json(saved);
  } catch (error) {
    console.error('Save handoff error:', error);
    return NextResponse.json({ error: 'Failed to save handoff' }, { status: 500 });
  }
}
