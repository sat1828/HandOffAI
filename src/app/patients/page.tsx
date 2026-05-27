'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AppShell from '@/components/layout/AppShell';
import { useAppStore } from '@/store/appStore';
import { getAcuityLabel, getAcuityColor } from '@/lib/utils';
import type { Patient } from '@/types';

function PatientsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { patients, setPatients, flags, currentWard } = useAppStore();
  const [search, setSearch] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showEhrDiff, setShowEhrDiff] = useState(false);

  useEffect(() => {
    fetch('/api/patients')
      .then(r => r.json())
      .then(d => setPatients(d))
      .catch(() => {});
  }, [currentWard, setPatients]);

  useEffect(() => {
    const pid = searchParams.get('id');
    if (pid) {
      const p = patients.find(pt => pt.id === pid);
      if (p) setSelectedPatient(p);
    }
  }, [searchParams, patients]);

  const filtered = patients.filter(p => {
    const q = search.toLowerCase();
    return !q || p.name.toLowerCase().includes(q) || p.diagnosis.toLowerCase().includes(q) || p.bedId.toLowerCase().includes(q);
  }).sort((a, b) => a.acuity - b.acuity);

  const patientFlags = selectedPatient
    ? flags.filter(f => f.patientId === selectedPatient.id && !f.resolved)
    : [];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: selectedPatient ? '400px 1fr' : '1fr', gap: 24 }}>
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--parchment-3)' }}>
          <input placeholder="Search patients..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: '100%' }} />
        </div>
        <div style={{ overflow: 'auto', maxHeight: 600 }}>
          {filtered.map(p => {
            const pFlags = flags.filter(f => f.patientId === p.id && !f.resolved);
            return (
              <div key={p.id} onClick={() => setSelectedPatient(p)} className={`severity-${p.acuity}`} style={{
                padding: '12px 16px', cursor: 'pointer',
                background: selectedPatient?.id === p.id ? 'var(--emerald-light)' : 'transparent',
                borderBottom: '1px solid var(--parchment-3)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div className="avatar-circle" style={{ background: `${getAcuityColor(p.acuity)}15`, color: getAcuityColor(p.acuity) }}>
                    {p.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>{p.bedId} — {p.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>{p.diagnosis.slice(0, 50)}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className={`badge badge-${p.acuity <= 1 ? 'critical' : p.acuity <= 2 ? 'warning' : p.acuity >= 5 ? 'emerald' : 'info'}`}>
                      {getAcuityLabel(p.acuity)}
                    </span>
                    {pFlags.length > 0 && <div className="badge badge-critical" style={{ marginTop: 4 }}>{pFlags.length} flags</div>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {selectedPatient && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div className="avatar-circle" style={{ width: 48, height: 48, fontSize: 18, background: `${getAcuityColor(selectedPatient.acuity)}15`, color: getAcuityColor(selectedPatient.acuity) }}>
              {selectedPatient.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 18, fontWeight: 600, fontFamily: "'Instrument Serif', Georgia, serif", color: 'var(--ink)' }}>{selectedPatient.name}</div>
              <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>
                {new Date().getFullYear() - new Date(selectedPatient.dob).getFullYear()}yo {selectedPatient.sex} · {selectedPatient.bedId} · MRN: {selectedPatient.mrn}
              </div>
            </div>
            <span className={`badge badge-${selectedPatient.acuity <= 1 ? 'critical' : selectedPatient.acuity <= 2 ? 'warning' : selectedPatient.acuity >= 5 ? 'emerald' : 'info'}`} style={{ fontSize: 12 }}>
              {getAcuityLabel(selectedPatient.acuity)}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="card">
              <h4 style={{ fontSize: 13, fontFamily: "'Instrument Serif', Georgia, serif", color: 'var(--ink)', marginBottom: 8 }}>Current Vitals</h4>
              {selectedPatient.vitals ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {Object.entries(JSON.parse(typeof selectedPatient.vitals === 'string' ? selectedPatient.vitals : '{}')).filter(([k]) => k !== 'trend').map(([key, val]) => (
                    <div key={key}>
                      <div style={{ fontSize: 10, color: 'var(--ink-4)', textTransform: 'uppercase' }}>{key}</div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)', fontFamily: "'JetBrains Mono'" }}>{String(val)}</div>
                    </div>
                  ))}
                </div>
              ) : <div style={{ fontSize: 12, color: 'var(--ink-4)' }}>No vitals data</div>}
            </div>
            <div className="card">
              <h4 style={{ fontSize: 13, fontFamily: "'Instrument Serif', Georgia, serif", color: 'var(--ink)', marginBottom: 8 }}>Diagnosis & Status</h4>
              <div style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 10, color: 'var(--ink-4)', textTransform: 'uppercase' }}>Diagnosis</div>
                <div style={{ fontSize: 13, color: 'var(--ink)' }}>{selectedPatient.diagnosis}</div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: 'var(--ink-4)', textTransform: 'uppercase' }}>Code Status</div>
                <span className="mono" style={{ fontSize: 13, color: 'var(--ink)' }}>{selectedPatient.codeStatus}</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
            {[
              { title: 'Active Medications', data: selectedPatient.medications, render: (m: any) => `${m.name} ${m.dose} ${m.route}` },
              { title: 'Pending Labs', data: selectedPatient.pendingLabs, render: (l: any) => `${l.name} — ${l.status}` },
              { title: 'Open Actions', data: selectedPatient.openActions, render: (a: any) => `${a.description}` },
            ].map(section => (
              <div className="card" key={section.title}>
                <h4 style={{ fontSize: 13, fontFamily: "'Instrument Serif', Georgia, serif", color: 'var(--ink)', marginBottom: 8 }}>{section.title}</h4>
                {(() => {
                  let data: any[];
                  try { data = typeof section.data === 'string' ? JSON.parse(section.data) : section.data; } catch { data = []; }
                  return data.length > 0 ? data.slice(0, 4).map((item: any, i: number) => (
                    <div key={i} style={{ fontSize: 11, color: 'var(--ink-2)', padding: '4px 0', borderBottom: '1px solid var(--parchment-3)' }}>
                      {section.render(item)}
                    </div>
                  )) : <div style={{ fontSize: 11, color: 'var(--ink-4)' }}>None</div>;
                })()}
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="card">
              <h4 style={{ fontSize: 13, fontFamily: "'Instrument Serif', Georgia, serif", color: 'var(--ink)', marginBottom: 8 }}>Allergies</h4>
              {(() => {
                let allergies: any[];
                try { allergies = JSON.parse(typeof selectedPatient.allergies === 'string' ? selectedPatient.allergies : '[]'); } catch { allergies = []; }
                return allergies.length > 0 ? allergies.map((a: any, i: number) => (
                  <div key={i} style={{ fontSize: 12, color: 'var(--ink-2)', padding: '4px 0' }}>{a.allergen} {a.severity ? `(${a.severity})` : ''}</div>
                )) : <div style={{ fontSize: 12, color: 'var(--ink-4)' }}>No known allergies</div>;
              })()}
            </div>
            <div className="card">
              <h4 style={{ fontSize: 13, fontFamily: "'Instrument Serif', Georgia, serif", color: 'var(--ink)', marginBottom: 8 }}>Active Flags</h4>
              {patientFlags.length > 0 ? patientFlags.map(f => (
                <div key={f.id} className={`flag-item flag-${f.severity.toLowerCase()}`} style={{ marginBottom: 4 }}>
                  <span style={{ fontSize: 12 }}>{f.severity === 'CRITICAL' ? '🔴' : f.severity === 'WARNING' ? '🟡' : '🔵'}</span>
                  <div style={{ flex: 1 }}><div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink)' }}>{f.title}</div></div>
                </div>
              )) : <div style={{ fontSize: 12, color: 'var(--ink-4)' }}>No active flags</div>}
            </div>
          </div>

          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <h4 style={{ fontSize: 13, fontFamily: "'Instrument Serif', Georgia, serif", color: 'var(--ink)', margin: 0 }}>EHR Reconciliation</h4>
              <button onClick={() => setShowEhrDiff(!showEhrDiff)} style={{
                padding: '4px 12px', fontSize: 11, fontWeight: 600,
                background: showEhrDiff ? 'var(--emerald-light)' : 'var(--parchment-2)',
                border: '1px solid var(--parchment-3)', borderRadius: 6, cursor: 'pointer',
                color: showEhrDiff ? 'var(--emerald)' : 'var(--ink-2)',
              }}>{showEhrDiff ? 'Hide Diff' : 'Show EHR Diff'}</button>
            </div>
            {showEhrDiff && (
              <div>
                {[
                  { field: 'Diagnosis', handoff: selectedPatient.diagnosis, ehr: selectedPatient.diagnosis },
                  { field: 'Code Status', handoff: selectedPatient.codeStatus, ehr: 'Full Resuscitation', discrepancy: selectedPatient.codeStatus !== 'Full Resuscitation' },
                  { field: 'Medications', handoff: 'Per transcript', ehr: 'Per MAR', discrepancy: false },
                ].map((row, i) => (
                  <div key={i} style={{
                    display: 'grid', gridTemplateColumns: '120px 1fr 1fr', gap: 12, padding: '8px 12px',
                    background: row.discrepancy ? 'var(--critical-light)' : 'var(--parchment-2)',
                    borderRadius: 8, marginBottom: 4, fontSize: 12,
                  }}>
                    <span style={{ fontWeight: 600, color: 'var(--ink)' }}>{row.field}</span>
                    <span style={{ color: 'var(--ink-2)' }}>Handoff: {row.handoff}</span>
                    <span style={{ color: 'var(--ink-2)' }}>EHR: {row.ehr}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button onClick={() => router.push(`/handoff/new?patientId=${selectedPatient.id}`)} style={{
            padding: '12px', background: 'var(--emerald)', color: '#fff',
            border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: 'pointer',
          }}>Start Handoff for {selectedPatient.name} →</button>
        </div>
      )}
    </div>
  );
}

export default function PatientsPage() {
  return (
    <AppShell title="Patients" subtitle="Full patient census and clinical detail">
      <Suspense fallback={<div style={{ textAlign: 'center', padding: 40, color: 'var(--ink-4)' }}>Loading...</div>}>
        <PatientsContent />
      </Suspense>
    </AppShell>
  );
}
