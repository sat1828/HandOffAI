import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { extractHandoffData, mockExtractHandoffData } from '@/lib/claude';

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { transcript, patientId, wardId } = await request.json();

    if (!transcript) {
      return NextResponse.json({ error: 'Transcript is required' }, { status: 400 });
    }

    // Try Claude API first, fall back to mock
    let data = await extractHandoffData(transcript);
    if (!data) {
      data = mockExtractHandoffData(transcript);
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Extract error:', error);
    return NextResponse.json({ error: 'Extraction failed' }, { status: 500 });
  }
}
