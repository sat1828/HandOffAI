import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateHandoffPDF } from '@/lib/pdf';

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { handoffId } = await request.json();
    if (!handoffId) {
      return NextResponse.json({ error: 'handoffId is required' }, { status: 400 });
    }

    const handoff = await prisma.handoff.findUnique({
      where: { id: handoffId },
      include: {
        flags: true,
        patient: { select: { name: true, bedId: true } },
        clinician: { select: { name: true } },
      },
    });

    if (!handoff) {
      return NextResponse.json({ error: 'Handoff not found' }, { status: 404 });
    }

    let extractedData: Record<string, unknown> = {};
    let sbarNote: Record<string, unknown> = {};
    try {
      extractedData = JSON.parse(handoff.extractedData);
    } catch {}
    try {
      sbarNote = JSON.parse(handoff.sbarNote);
    } catch {}

    const pdfBytes = await generateHandoffPDF({
      patientName: handoff.patient?.name || 'Unknown',
      clinicianName: handoff.clinician?.name || 'Unknown',
      date: handoff.createdAt.toISOString(),
      transcript: handoff.transcript,
      extractedData,
      sbarNote,
      flags: handoff.flags,
      qualityScore: handoff.qualityScore,
    });

    return new Response(pdfBytes as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="handoff-${handoff.id}.pdf"`,
      },
    });
  } catch (error) {
    console.error('PDF export error:', error);
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
  }
}
