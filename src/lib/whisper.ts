import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || 'sk-mock' });

const SUPPORTED_MIME_TYPES = ['audio/wav', 'audio/mp3', 'audio/m4a', 'audio/webm'];

function isMockMode(): boolean {
  return !process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'sk-mock';
}

function mockTranscribe(): { text: string; segments: { start: number; end: number; text: string }[] } {
  const text =
    'This is Mr. John Smith, a 68-year-old male in bed 12A, admitted for acute exacerbation of COPD. ' +
    'His vitals this morning: blood pressure 145/90, heart rate 88, respiratory rate 22, temperature 37.2, oxygen saturation 91% on 2L nasal cannula. ' +
    'Current medications: Albuterol nebulizer every 4 hours, Ipratropium every 6 hours, Prednisone 40mg daily, Ceftriaxone 1g daily. ' +
    'Pending lab results include sputum culture and CBC from this morning. ' +
    'Code status is Full Resuscitation. No known allergies. ' +
    'Situation: Mr. Smith is requiring increasing oxygen support. ' +
    'Background: Admitted 3 days ago with COPD exacerbation, history of hypertension and type 2 diabetes. ' +
    'Assessment: Worsening respiratory status, oxygen requirement increased from 2L to 3L nasal cannula this morning. ' +
    'Recommendation: Consider escalation to BiPAP if O2 sat drops below 88%, obtain repeat ABG, and monitor for signs of respiratory fatigue.';

  return {
    text,
    segments: [
      { start: 0, end: 8.5, text: 'This is Mr. John Smith, a 68-year-old male in bed 12A, admitted for acute exacerbation of COPD.' },
      { start: 8.5, end: 18.2, text: 'His vitals this morning: blood pressure 145/90, heart rate 88, respiratory rate 22, temperature 37.2, oxygen saturation 91% on 2L nasal cannula.' },
      { start: 18.2, end: 28.0, text: 'Current medications: Albuterol nebulizer every 4 hours, Ipratropium every 6 hours, Prednisone 40mg daily, Ceftriaxone 1g daily.' },
      { start: 28.0, end: 33.5, text: 'Pending lab results include sputum culture and CBC from this morning.' },
      { start: 33.5, end: 38.0, text: 'Code status is Full Resuscitation. No known allergies.' },
      { start: 38.0, end: 44.0, text: 'Situation: Mr. Smith is requiring increasing oxygen support.' },
      { start: 44.0, end: 52.0, text: 'Background: Admitted 3 days ago with COPD exacerbation, history of hypertension and type 2 diabetes.' },
      { start: 52.0, end: 60.0, text: 'Assessment: Worsening respiratory status, oxygen requirement increased from 2L to 3L nasal cannula this morning.' },
      { start: 60.0, end: 72.0, text: 'Recommendation: Consider escalation to BiPAP if O2 sat drops below 88%, obtain repeat ABG, and monitor for signs of respiratory fatigue.' },
    ],
  };
}

export async function transcribeAudio(
  audioBuffer: Buffer,
  mimeType: string
): Promise<{
  text: string;
  segments?: { start: number; end: number; text: string }[];
}> {
  if (!SUPPORTED_MIME_TYPES.includes(mimeType)) {
    throw new Error(`Unsupported audio format: ${mimeType}. Supported: ${SUPPORTED_MIME_TYPES.join(', ')}`);
  }

  if (isMockMode()) {
    return mockTranscribe();
  }

  const extension = mimeType.split('/')[1];
  const file = new File([audioBuffer as BlobPart], `audio.${extension}`, { type: mimeType });

  const transcription = await openai.audio.transcriptions.create({
    file,
    model: 'whisper-1',
    response_format: 'verbose_json',
    timestamp_granularities: ['segment'],
  });

  return {
    text: transcription.text,
    segments: transcription.segments?.map((s) => ({
      start: s.start,
      end: s.end,
      text: s.text,
    })),
  };
}
