import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { transcribeAudio } from '@/lib/whisper';

const MAX_FILE_SIZE = 10 * 1024 * 1024;

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const contentType = request.headers.get('content-type') || '';

    let audioBuffer: Buffer;
    let mimeType: string;

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('audio') as File | null;
      if (!file) {
        return NextResponse.json({ error: 'Audio file is required' }, { status: 400 });
      }
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json({ error: 'File exceeds 10MB limit' }, { status: 413 });
      }
      audioBuffer = Buffer.from(await file.arrayBuffer());
      mimeType = file.type;
    } else {
      const body = await request.json();
      if (!body.audio) {
        return NextResponse.json({ error: 'Audio data is required' }, { status: 400 });
      }
      const raw = body.audio.replace(/^data:audio\/\w+;base64,/, '');
      audioBuffer = Buffer.from(raw, 'base64');
      if (audioBuffer.length > MAX_FILE_SIZE) {
        return NextResponse.json({ error: 'File exceeds 10MB limit' }, { status: 413 });
      }
      mimeType = body.mimeType || 'audio/wav';
    }

    const result = await transcribeAudio(audioBuffer, mimeType);
    return NextResponse.json({ text: result.text, segments: result.segments });
  } catch (error: unknown) {
    console.error('Transcribe error:', error);
    const message = error instanceof Error ? error.message : 'Transcription failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
