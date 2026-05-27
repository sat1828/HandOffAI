const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || '';

export async function extractHandoffData(transcript: string): Promise<any> {
  const systemPrompt = `You are a specialized clinical NLP system embedded in HandOffAI, a HIPAA-compliant hospital handoff intelligence platform.

Extract structured clinical data from the following shift-change handoff transcript.

EXTRACTION RULES:
1. Follow I-PASS + SBAR ontologies strictly
2. Extract only what is explicitly stated — do not infer or fabricate
3. For medications: include drug name, dose, route, frequency
4. For vitals: include values AND direction (↑↓→)
5. Flag ONLY genuine clinical risks — do not flag routine items
6. Quality score: 60 = minimal info, 100 = all fields complete with specifics
7. Generate SBAR note in clinical language appropriate for attending physician review
8. All flags must be actionable — state what to do, not just what's wrong

Respond ONLY with a valid JSON object matching this exact schema. No preamble, no markdown, no explanation.

{
  "patient_name": "string",
  "age_sex": "string",
  "diagnosis": "string",
  "vitals_trend": "string",
  "medications": ["string"],
  "pending_labs": ["string"],
  "open_actions": ["string"],
  "code_status": "string",
  "allergies": ["string"],
  "flags": [{"severity": "CRITICAL|WARNING|INFO", "title": "string", "description": "string"}],
  "quality_score": 85,
  "sbar_situation": "string",
  "sbar_background": "string",
  "sbar_assessment": "string",
  "sbar_recommendation": "string"
}`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2048,
        system: systemPrompt,
        messages: [{ role: 'user', content: transcript }],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Claude API error:', error);
      return null;
    }

    const data = await response.json();
    const content = data.content?.[0]?.text;
    if (!content) return null;

    return JSON.parse(content);
  } catch (error) {
    console.error('Claude API error:', error);
    return null;
  }
}

export function mockExtractHandoffData(transcript: string): any {
  const lower = transcript.toLowerCase();
  const hasICU = lower.includes('icu') || lower.includes('sepsis') || lower.includes('ventilator');
  const hasCardio = lower.includes('cardiology') || lower.includes('mi') || lower.includes('heart') || lower.includes('chest pain');
  const hasNeuro = lower.includes('neurology') || lower.includes('stroke') || lower.includes('neuro') || lower.includes('gcs');

  let diagnosis = 'Community-acquired pneumonia, acute hypoxemic respiratory failure';
  let vitals = 'BP 98/62 ↓, HR 108 ↑, RR 26 ↑, Temp 38.9°C ↑, SpO₂ 89% on 4L NC ↓';
  let meds = ['Norepinephrine 0.05 mcg/kg/min IV', 'Piperacillin-tazobactam 4.5g IV q6h', 'Vancomycin 1.25g IV q12h', 'Acetaminophen 650mg IV q4h PRN'];
  let labs = ['Blood cultures (pending)', 'CBC with diff (pending)', 'Lactate (pending)', 'Procalcitonin (pending)'];
  let actions = ['Repeat lactate in 2 hours', 'Notify if MAP < 65', 'CT chest with contrast (ordered)', 'ID consult (pending)'];
  let situation = `Patient is a 72-year-old male admitted 3 days ago for ${diagnosis}.`;
  let background = 'History of COPD (GOLD 3), CHF (EF 35%), and CKD stage 3. Baseline O₂ requirement 2L.';
  let assessment = 'Clinical status worsening over past 6 hours. Increasing O₂ requirement, hypotension requiring pressors, rising lactate. Concern for septic shock.';
  let recommendation = '1. Escalate to ICU team. 2. Repeat lactate and blood cultures. 3. Consider adding empiric antifungal. 4. Nephrology consult for AKI.';

  if (hasICU) {
    // ICU/sepsis demo
  } else if (hasCardio) {
    diagnosis = 'ST-elevation myocardial infarction (STEMI), anterior wall';
    vitals = 'BP 142/88 ↑, HR 94 ↑, RR 18 normal, Temp 37.1°C normal, SpO₂ 96% RA';
    meds = ['Aspirin 324mg chewed (given) DAILY', 'Ticagrelor 180mg loading dose', 'Heparin 5000U IV bolus, 12U/kg/hr infusion', 'Atorvastatin 80mg PO', 'Metoprolol 25mg PO'];
    labs = ['Troponin I (pending)', 'CK-MB (pending)', 'BNP (pending)', 'CBC, CMP (pending)'];
    actions = ['Emergent cardiac catheterization (activation pending)', 'Echocardiogram (ordered)', 'Bed rest, continuous telemetry monitoring'];
    situation = 'Patient is a 58-year-old male presenting with acute onset substernal chest pain for 2 hours. ECG shows anterior STEMI.';
    background = 'History of hypertension, hyperlipidemia, type 2 diabetes. Smoker (30 pack-years). No prior MI.';
    assessment = 'High-risk STEMI. Pain controlled with nitroglycerin. Hemodynamically stable. Door-to-balloon time tracking at 45 minutes.';
    recommendation = '1. Activate cath lab. 2. Continue dual antiplatelet therapy. 3. Monitor for arrhythmias. 4. Prepare for possible CABG discussion.';
  } else if (hasNeuro) {
    diagnosis = 'Acute ischemic stroke, left MCA territory';
    vitals = 'BP 178/96 ↑, HR 76 normal, RR 16 normal, Temp 36.8°C normal, SpO₂ 98% RA';
    meds = ['Alteplase 0.9mg/kg IV (given at 14:30)', 'Aspirin 325mg (after 24h)', 'Nicardipine 5mg/hr IV (titrated)'];
    labs = ['INR (pending)', 'CBC (pending)', 'Glucose (pending)', 'CT head non-contrast (completed)'];
    actions = ['NIHSS reassessment q4h', 'BP goal < 180/105 for 24h', 'Repeat CT head at 24h'];
    situation = 'Patient is a 65-year-old female with acute onset right-sided weakness and aphasia for 90 minutes. Last known well: 2 hours ago.';
    background = 'History of atrial fibrillation (not anticoagulated), hypertension, diabetes. CHA₂DS₂-VASc score: 5.';
    assessment = 'Received thrombolytics. Neurological exam improving (NIHSS 14 → 8). Mild hemorrhagic conversion on imaging, but clinically stable.';
    recommendation = '1. Admit to Neuro ICU. 2. q2h neuro checks. 3. Hold anticoagulation for 24h. 4. Swallow evaluation before PO intake.';
  }

  const flags = [];
  flags.push({
    severity: 'CRITICAL',
    title: 'Hypotension requiring pressor support',
    description: 'MAP < 65 despite 1L crystalloid bolus. Norepinephrine initiated. Escalation criteria: MAP < 60 requires second pressor.'
  });
  flags.push({
    severity: 'WARNING',
    title: 'Pending critical labs',
    description: 'Blood cultures and lactate pending. Results expected within 60 minutes. Alert if lactate > 4 or cultures preliminary positive.'
  });
  flags.push({
    severity: 'INFO',
    title: 'Code status not confirmed',
    description: 'No documented code status discussion with family this admission. Confirm Full Resuscitation or establish limitations.'
  });

  return {
    patient_name: hasCardio ? 'James Mitchell' : hasNeuro ? 'Patricia Kowalski' : 'Robert Chen',
    age_sex: hasCardio ? '58M' : hasNeuro ? '65F' : '72M',
    diagnosis,
    vitals_trend: vitals,
    medications: meds,
    pending_labs: labs,
    open_actions: actions,
    code_status: 'Full Resuscitation',
    allergies: hasCardio ? ['Sulfa (rash)', 'Codeine (nausea)'] : hasNeuro ? ['Aspirin (urticaria)', 'Latex'] : ['Penicillin (hives)', 'Contrast dye (anaphylaxis)'],
    flags,
    quality_score: 87,
    sbar_situation: situation,
    sbar_background: background,
    sbar_assessment: assessment,
    sbar_recommendation: recommendation,
  };
}
