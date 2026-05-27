'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import AppShell from '@/components/layout/AppShell';
import { mockExtractHandoffData } from '@/lib/claude';
import { useAppStore } from '@/store/appStore';
import toast from 'react-hot-toast';
import type { Patient } from '@/types';

const DEMO_SCENARIOS = [
  {
    name: 'ICU',
    label: 'ICU — Septic Shock',
    transcript: `Handoff for Robert Chen, ICU-01, 72-year-old male admitted three days ago for septic shock secondary to community-acquired pneumonia. Blood cultures grew E. coli, now on piperacillin-tazobactam and vancomycin. Over the past six hours, his blood pressure has been dropping — currently 98/62 on norepinephrine at 0.05 micrograms per kilogram per minute. Heart rate 108, respiratory rate 26, temperature 38.9, SpO2 89 percent on 4 liters nasal cannula. Lactate came back at 3.2, up from 1.8 this morning. Pending labs include repeat blood cultures and procalcitonin. He has a CT chest with contrast ordered for tomorrow. Allergies to penicillin and contrast dye. Code status is Full Resuscitation. Open actions: repeat lactate in two hours, notify if MAP drops below 65, and ID consult is pending. He needs closer monitoring through the night — I'm concerned he's progressing to multi-organ dysfunction.`,
  },
  {
    name: 'Cardiology',
    label: 'Cardiology — STEMI',
    transcript: `Handoff for James Mitchell, ICU-03, 58-year-old male presenting with acute substernal chest pain for two hours. ECG shows anterior ST-elevation MI. He's hemodynamically unstable with blood pressure 86/52, heart rate 118, respiratory rate 22. He's on dobutamine at 5 micrograms per kilogram per minute and a heparin drip. Aspirin and ticagrelor loading given in ED. Troponin is 14.2, trending up. Pending labs include BNP and comprehensive metabolic panel. He needs emergent cardiac catheterization — cath lab is being activated. Allergies to sulfa drugs. Code status is Limited Resuscitation, no compressions per patient preference. Key concerns: he's at high risk for cardiogenic shock, monitor urine output closely, and cardiothoracic surgery is consulting.`,
  },
  {
    name: 'Neurology',
    label: 'Neurology — Stroke',
    transcript: `Handoff for Patricia Kowalski, ICU-04, 65-year-old female with acute onset right-sided weakness and expressive aphasia. Last known well was three hours ago. CT head is negative for hemorrhage. She received alteplase at 14:30, 0.9 milligrams per kilogram. Current NIHSS is 8, down from 14 on arrival. Blood pressure is 178 over 96 — we're running nicardipine at 5 milligrams per hour with a goal of less than 180 over 105. Heart rate 76, respiratory rate 16, saturations 98 percent on room air. Pending labs include INR and basic metabolic panel. CT head is scheduled for repeat in 24 hours. Allergies to latex. Code status is Full Resuscitation. Open actions: NIHSS reassessment every four hours, swallow evaluation before any oral intake, and hold anticoagulation for 24 hours post-thrombolytics.`,
  },
];

export default function NewHandoffPage() {
  const router = useRouter();
  const { patients, addHandoff, currentWard } = useAppStore();
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [patientId, setPatientId] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'fields' | 'flags' | 'sbar'>('fields');
  const [recordingTime, setRecordingTime] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const recognitionRef = useRef<any>(null);

  const startRecording = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      recognition.onresult = (event: any) => {
        let final = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          final += event.results[i][0].transcript;
        }
        setTranscript(prev => prev + ' ' + final);
      };
      recognition.onerror = () => {
        toast.error('Microphone error. Switch to demo mode.');
        setIsRecording(false);
      };
      recognition.start();
      recognitionRef.current = recognition;
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => setRecordingTime(t => t + 1), 1000);
    } else {
      toast.error('Speech recognition not supported. Use Demo Mode.');
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsRecording(false);
  }, []);

  const runDemo = async (scenario: typeof DEMO_SCENARIOS[0]) => {
    setTranscript('');
    setExtractedData(null);
    setIsProcessing(true);
    setActiveTab('fields');

    const scenarioPatient = patients.find(p =>
      scenario.name === 'ICU' ? p.diagnosis.toLowerCase().includes('septic') :
      scenario.name === 'Cardiology' ? p.diagnosis.toLowerCase().includes('stemi') :
      p.diagnosis.toLowerCase().includes('stroke')
    ) || patients[0];
    setSelectedPatient(scenarioPatient);
    setPatientId(scenarioPatient.id);

    let idx = 0;
    const chars = scenario.transcript.split('');
    const interval = setInterval(() => {
      if (idx < chars.length) {
        setTranscript(prev => prev + chars[idx]);
        idx++;
      } else {
        clearInterval(interval);
        setTimeout(() => processTranscript(scenario.transcript, scenarioPatient.id), 500);
      }
    }, 28);
  };

  const processTranscript = async (text: string, pid: string) => {
    setIsProcessing(true);
    try {
      const res = await fetch('/api/handoff/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: text, patientId: pid, wardId: currentWard }),
      });

      if (res.ok) {
        const data = await res.json();
        setExtractedData(data);
      } else {
        const mock = mockExtractHandoffData(text);
        setExtractedData(mock);
      }
    } catch {
      const mock = mockExtractHandoffData(text);
      setExtractedData(mock);
    }
    setIsProcessing(false);
  };

  const saveHandoff = async () => {
    if (!extractedData || !selectedPatient) return;
    try {
      const res = await fetch('/api/handoff/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: selectedPatient.id,
          wardId: currentWard,
          transcript,
          extractedData,
          qualityScore: extractedData.quality_score || 85,
          durationSeconds: recordingTime,
        }),
      });

      if (res.ok) {
        const handoff = await res.json();
        addHandoff(handoff);
        toast.success('Handoff saved successfully');

        // Notify other clinicians in the ward
        try {
          const listRes = await fetch(`/api/handoffs?wardId=${currentWard}&limit=50`);
          if (listRes.ok) {
            const { handoffs: wardHandoffs } = await listRes.json();
            const notified = new Set<string>();
            for (const h of wardHandoffs) {
              const cid = h.clinician?.id;
              if (cid && cid !== handoff.clinicianId && !notified.has(cid)) {
                notified.add(cid);
                fetch('/api/notifications', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    userId: cid,
                    type: 'handoff_assigned',
                    title: `New handoff: ${selectedPatient!.name}`,
                    message: `A new handoff record was created for ${selectedPatient!.name} in ${currentWard}.`,
                    link: '/handoffs',
                  }),
                });
              }
            }
          }
        } catch {}

        router.push('/dashboard');
      } else {
        toast.error('Failed to save handoff');
      }
    } catch {
      toast.error('Error saving handoff');
    }
  };

  const getActiveFlags = () => {
    if (!extractedData?.flags) return [];
    return extractedData.flags;
  };

  return (
    <AppShell title="New Handoff" subtitle="Create a structured clinical handoff from voice">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, minHeight: 'calc(100vh - 120px)' }}>
        {/* Left Column — Input */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card">
            <h3 style={{ fontSize: 14, fontFamily: "'Instrument Serif', Georgia, serif", color: 'var(--ink)', marginBottom: 12 }}>
              Step 1: Select Patient
            </h3>
            <select
              value={patientId}
              onChange={(e) => {
                setPatientId(e.target.value);
                setSelectedPatient(patients.find(p => p.id === e.target.value) || null);
              }}
              style={{ width: '100%', marginBottom: 8 }}
            >
              <option value="">Select a patient...</option>
              {patients.map(p => (
                <option key={p.id} value={p.id}>{p.bedId} — {p.name} ({p.diagnosis.slice(0, 40)})</option>
              ))}
            </select>
            {selectedPatient && (
              <div style={{ padding: '10px 14px', background: 'var(--parchment-2)', borderRadius: 8, fontSize: 12 }}>
                <strong>{selectedPatient.name}</strong> · {new Date().getFullYear() - new Date(selectedPatient.dob).getFullYear()}/{selectedPatient.sex} · {selectedPatient.bedId}
                <br />
                {selectedPatient.diagnosis}
              </div>
            )}
            <div style={{ marginTop: 8, fontSize: 11, color: 'var(--ink-4)' }}>
              <a href="#" onClick={(e) => { e.preventDefault(); toast('Ad-hoc patient form coming soon'); }} style={{ color: 'var(--emerald)' }}>
                + Not in list? Add ad-hoc patient
              </a>
            </div>
          </div>

          <div className="card">
            <h3 style={{ fontSize: 14, fontFamily: "'Instrument Serif', Georgia, serif", color: 'var(--ink)', marginBottom: 12 }}>
              Step 2: Voice Handoff
            </h3>

            {/* Recording controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
              {!isRecording ? (
                <button
                  onClick={startRecording}
                  className="recording-pulse"
                  style={{
                    width: 56, height: 56, borderRadius: '50%',
                    background: 'var(--critical)', color: '#fff',
                    border: 'none', fontSize: 24, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  🎤
                </button>
              ) : (
                <button
                  onClick={stopRecording}
                  style={{
                    width: 56, height: 56, borderRadius: '50%',
                    background: 'var(--ink)', color: '#fff',
                    border: 'none', fontSize: 24, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  ■
                </button>
              )}
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>
                  {isRecording ? 'Recording...' : 'Click to record'}
                </div>
                <div className="mono" style={{ fontSize: 16, color: isRecording ? 'var(--critical)' : 'var(--ink-3)' }}>
                  {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}
                </div>
              </div>
              {isRecording && (
                <div className="waveform">
                  {Array.from({ length: 11 }).map((_, i) => (
                    <div key={i} className="waveform-bar" style={{ animationDelay: `${i * 0.05}s`, height: `${8 + Math.random() * 20}px` }} />
                  ))}
                </div>
              )}
            </div>

            {/* Demo Mode */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, color: 'var(--ink-4)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Or try demo mode:
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {DEMO_SCENARIOS.map(s => (
                  <button
                    key={s.name}
                    onClick={() => runDemo(s)}
                    disabled={isProcessing}
                    style={{
                      flex: 1, padding: '8px 12px', fontSize: 11, fontWeight: 600,
                      background: 'var(--parchment-2)', border: '1px solid var(--parchment-3)',
                      borderRadius: 8, cursor: isProcessing ? 'not-allowed' : 'pointer',
                      color: 'var(--ink-2)',
                    }}
                  >
                    ▶ {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Transcript */}
            <div
              style={{
                minHeight: 120, maxHeight: 200, overflow: 'auto',
                padding: 12, borderRadius: 8,
                background: 'var(--parchment-2)',
                fontSize: 12, lineHeight: 1.6, color: 'var(--ink-2)',
                whiteSpace: 'pre-wrap',
              }}
            >
              {transcript || <span style={{ color: 'var(--ink-4)' }}>Transcript will appear here...</span>}
              {isProcessing && (
                <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div className="skeleton" style={{ width: 16, height: 16, borderRadius: '50%' }} />
                  <span style={{ fontSize: 11, color: 'var(--ink-3)' }}>Processing with Claude AI...</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column — Output */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', gap: 16, borderBottom: '1px solid var(--parchment-3)', marginBottom: 16 }}>
            {(['fields', 'flags', 'sbar'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '8px 4px', fontSize: 13, fontWeight: activeTab === tab ? 600 : 400,
                  background: 'none', border: 'none', borderBottom: activeTab === tab ? '2px solid var(--emerald)' : '2px solid transparent',
                  color: activeTab === tab ? 'var(--emerald)' : 'var(--ink-3)',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
                }}
              >
                {tab === 'fields' ? 'Extracted Fields' : tab === 'flags' ? `Flags (${getActiveFlags().length})` : 'SBAR Note'}
              </button>
            ))}
          </div>

          <div style={{ flex: 1, overflow: 'auto' }}>
            {isProcessing ? (
              <div style={{ padding: 20 }}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} style={{ marginBottom: 16 }}>
                    <div className="skeleton" style={{ width: '40%', height: 12, marginBottom: 6 }} />
                    <div className="skeleton" style={{ width: '80%', height: 16 }} />
                  </div>
                ))}
              </div>
            ) : !extractedData ? (
              <div style={{ padding: 40, textAlign: 'center', color: 'var(--ink-4)', fontSize: 13 }}>
                Record a handoff or run a demo scenario to see structured data here.
              </div>
            ) : activeTab === 'fields' ? (
              <div>
                {[
                  { label: 'Patient', value: extractedData.patient_name },
                  { label: 'Age/Sex', value: extractedData.age_sex },
                  { label: 'Diagnosis', value: extractedData.diagnosis },
                  { label: 'Vitals Trend', value: extractedData.vitals_trend },
                  { label: 'Medications', value: Array.isArray(extractedData.medications) ? extractedData.medications.join('\n') : extractedData.medications },
                  { label: 'Pending Labs', value: Array.isArray(extractedData.pending_labs) ? extractedData.pending_labs.join('\n') : extractedData.pending_labs },
                  { label: 'Open Actions', value: Array.isArray(extractedData.open_actions) ? extractedData.open_actions.join('\n') : extractedData.open_actions },
                  { label: 'Code Status', value: extractedData.code_status },
                  { label: 'Allergies', value: Array.isArray(extractedData.allergies) ? extractedData.allergies.join(', ') : extractedData.allergies },
                ].map((field, i) => (
                  <div key={i} style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--ink-4)', marginBottom: 2 }}>
                      {field.label}
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--ink)', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                      {field.value || '—'}
                    </div>
                  </div>
                ))}
                <div style={{ marginTop: 16, padding: '12px 16px', background: 'var(--emerald-light)', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>Quality Score:</span>
                  <span className={`badge ${extractedData.quality_score >= 80 ? 'badge-emerald' : 'badge-warning'}`}>
                    {extractedData.quality_score}%
                  </span>
                </div>
              </div>
            ) : activeTab === 'flags' ? (
              <div>
                {getActiveFlags().length === 0 ? (
                  <div style={{ padding: 20, textAlign: 'center', color: 'var(--ink-4)' }}>No flags detected.</div>
                ) : getActiveFlags().map((flag: any, i: number) => (
                  <div key={i} className={`flag-item flag-${flag.severity?.toLowerCase() || 'info'}`}>
                    <span style={{ fontSize: 16 }}>{flag.severity === 'CRITICAL' ? '🔴' : flag.severity === 'WARNING' ? '🟡' : '🔵'}</span>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>{flag.title}</div>
                      <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>{flag.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div>
                {[
                  { label: 'Situation', value: extractedData.sbar_situation },
                  { label: 'Background', value: extractedData.sbar_background },
                  { label: 'Assessment', value: extractedData.sbar_assessment },
                  { label: 'Recommendation', value: extractedData.sbar_recommendation },
                ].map((s, i) => (
                  <div key={i} style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--info)', marginBottom: 4 }}>
                      {s.label}
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--ink)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                      {s.value || '—'}
                    </div>
                  </div>
                ))}
                <div style={{ marginTop: 12, fontSize: 10, color: 'var(--ink-4)', fontStyle: 'italic' }}>
                  Generated by HandOffAI · Claude claude-sonnet-4-20250514
                </div>
              </div>
            )}
          </div>

          {/* Action Bar */}
          {extractedData && !isProcessing && (
            <div style={{ display: 'flex', gap: 8, paddingTop: 16, borderTop: '1px solid var(--parchment-3)', marginTop: 16 }}>
              <button
                onClick={saveHandoff}
                style={{
                  flex: 1, padding: '10px', background: 'var(--emerald)', color: '#fff',
                  border: 'none', borderRadius: 12, fontWeight: 600, fontSize: 13,
                  cursor: 'pointer',
                }}
              >
                Save Handoff Record
              </button>
              <button
                onClick={() => { setTranscript(''); setExtractedData(null); }}
                style={{
                  padding: '10px 20px', background: 'var(--parchment-2)', color: 'var(--ink)',
                  border: '1px solid var(--parchment-3)', borderRadius: 12, fontSize: 13,
                  cursor: 'pointer',
                }}
              >
                Re-record
              </button>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
