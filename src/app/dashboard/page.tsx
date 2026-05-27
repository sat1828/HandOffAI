'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AppShell from '@/components/layout/AppShell';
import { useAppStore } from '@/store/appStore';
import { timeAgo, getAcuityLabel, getAcuityColor } from '@/lib/utils';
import type { Patient, Flag, Handoff } from '@/types';

export default function DashboardPage() {
  const router = useRouter();
  const { patients, setPatients, flags, setFlags, handoffs, setHandoffs, currentWard } = useAppStore();
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedHandoff, setSelectedHandoff] = useState<Handoff | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [pRes, fRes, hRes] = await Promise.all([
          fetch('/api/patients'),
          fetch('/api/patients/flags'),
          fetch('/api/handoffs?limit=10'),
        ]);
        if (pRes.ok) setPatients(await pRes.json());
        if (fRes.ok) setFlags(await fRes.json());
        if (hRes.ok) {
          const hData = await hRes.json();
          setHandoffs(hData.handoffs || hData);
        }
      } catch {}
    }
    load();
  }, [currentWard, setPatients, setFlags, setHandoffs]);

  const sortedPatients = [...patients].sort((a, b) => a.acuity - b.acuity);
  const activeFlags = flags.filter(f => !f.resolved);
  const todayHandoffs = handoffs.length;
  const avgQuality = handoffs.length > 0 ? Math.round(handoffs.reduce((s, h) => s + h.qualityScore, 0) / handoffs.length) : 0;
  const recentHandoffs = handoffs.slice(0, 4);

  return (
    <AppShell title="Clinical Dashboard" subtitle={`${currentWard} — ${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}`}>
      {/* KPI Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Active Patients', value: patients.length.toString(), change: '+2 today', color: 'var(--emerald)' },
          { label: 'Open Flags', value: activeFlags.length.toString(), change: activeFlags.length > 0 ? `${activeFlags.filter(f => f.severity === 'CRITICAL').length} critical` : 'None', color: 'var(--critical)' },
          { label: "Today's Handoffs", value: todayHandoffs.toString(), change: 'vs yesterday +1', color: 'var(--info)' },
          { label: 'Avg Quality Score', value: `${avgQuality}%`, change: avgQuality >= 80 ? 'Above target' : 'Needs improvement', color: avgQuality >= 80 ? 'var(--emerald)' : 'var(--warning)' },
        ].map((kpi, i) => (
          <div key={i} className="card" style={{ padding: '16px 20px' }}>
            <div style={{ fontSize: 12, color: 'var(--ink-3)', marginBottom: 4 }}>{kpi.label}</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--ink)', fontFamily: "'Instrument Serif', Georgia, serif" }}>{kpi.value}</div>
            <div style={{ fontSize: 11, color: kpi.color, marginTop: 2 }}>{kpi.change}</div>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 24, minHeight: 0 }}>
        {/* Left: Patient Queue */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--parchment-3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: 16, fontFamily: "'Instrument Serif', Georgia, serif", color: 'var(--ink)', margin: 0 }}>Patient Census</h2>
            <span style={{ fontSize: 11, color: 'var(--ink-4)' }}>Sorted by severity</span>
          </div>
          <div style={{ overflow: 'auto', maxHeight: 480 }}>
            <table>
              <thead>
                <tr>
                  <th>Bed</th>
                  <th>Patient</th>
                  <th>Diagnosis</th>
                  <th>Severity</th>
                  <th>Flags</th>
                </tr>
              </thead>
              <tbody>
                {sortedPatients.map((p) => (
                  <tr
                    key={p.id}
                    onClick={() => {
                      setSelectedPatient(p);
                      router.push(`/patients?id=${p.id}`);
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    <td><span className="mono" style={{ color: 'var(--ink-2)', fontWeight: 500 }}>{p.bedId}</span></td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div className="avatar-circle" style={{ width: 28, height: 28, fontSize: 10, background: `${getAcuityColor(p.acuity)}15`, color: getAcuityColor(p.acuity) }}>
                          {p.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink)' }}>{p.name}</div>
                          <div style={{ fontSize: 10, color: 'var(--ink-4)' }}>{`${new Date().getFullYear() - new Date(p.dob).getFullYear()}${p.sex}`}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--ink-2)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.diagnosis}</td>
                    <td>
                      <span className={`badge badge-${p.acuity <= 1 ? 'critical' : p.acuity <= 2 ? 'warning' : p.acuity >= 5 ? 'emerald' : 'info'}`}>
                        {getAcuityLabel(p.acuity)}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${p.flags?.filter(f => !f.resolved).length > 0 ? 'badge-warning' : 'badge-emerald'}`}>
                        {p.flags?.filter(f => !f.resolved).length || 0}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Active Flags */}
          <div className="card" style={{ padding: '16px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 style={{ fontSize: 14, fontFamily: "'Instrument Serif', Georgia, serif", color: 'var(--ink)', margin: 0 }}>Active Flags</h3>
              <span className="badge badge-critical">{activeFlags.length}</span>
            </div>
            {activeFlags.length === 0 ? (
              <div style={{ fontSize: 12, color: 'var(--ink-4)', padding: '16px 0', textAlign: 'center' }}>No active flags. All clear.</div>
            ) : (
              activeFlags.slice(0, 5).map((flag) => (
                <div key={flag.id} className={`flag-item flag-${flag.severity.toLowerCase()}`}>
                  <span style={{ fontSize: 14 }}>{flag.severity === 'CRITICAL' ? '🔴' : flag.severity === 'WARNING' ? '🟡' : '🔵'}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink)' }}>{flag.title}</div>
                    <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>{flag.description}</div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Recent Handoffs */}
          <div className="card" style={{ padding: '16px 20px' }}>
            <h3 style={{ fontSize: 14, fontFamily: "'Instrument Serif', Georgia, serif", color: 'var(--ink)', margin: '0 0 12px' }}>Recent Handoffs</h3>
            {recentHandoffs.map((h) => {
              const patient = patients.find(p => p.id === h.patientId);
              return (
                <div
                  key={h.id}
                  className="severity-3"
                  style={{ padding: '10px 12px', marginBottom: 6, borderRadius: 8, background: 'var(--parchment-2)', cursor: 'pointer' }}
                  onClick={() => setSelectedHandoff(h)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink)' }}>{patient?.name || 'Unknown'}</div>
                      <div style={{ fontSize: 10, color: 'var(--ink-4)' }}>{h.clinician?.name || 'Unknown'} · {timeAgo(h.createdAt)}</div>
                    </div>
                    <div>
                      <span className={`badge ${h.qualityScore >= 85 ? 'badge-emerald' : h.qualityScore >= 70 ? 'badge-warning' : 'badge-critical'}`}>
                        {h.qualityScore}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Handoff Detail Modal */}
      {selectedHandoff && (
        <div
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.4)', zIndex: 1000,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 24,
          }}
          onClick={() => setSelectedHandoff(null)}
        >
          <div className="glass" style={{ width: 600, maxHeight: '80vh', overflow: 'auto', padding: 32 }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontSize: 20, fontFamily: "'Instrument Serif', Georgia, serif", color: 'var(--ink)', margin: 0 }}>Handoff Detail</h2>
              <button onClick={() => setSelectedHandoff(null)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: 'var(--ink-3)' }}>✕</button>
            </div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, color: 'var(--ink-4)', marginBottom: 2 }}>Patient</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>{patients.find(p => p.id === selectedHandoff.patientId)?.name || 'Unknown'}</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 11, color: 'var(--ink-4)' }}>Quality Score</div>
                <span className={`badge ${selectedHandoff.qualityScore >= 85 ? 'badge-emerald' : 'badge-warning'}`} style={{ marginTop: 2 }}>
                  {selectedHandoff.qualityScore}%
                </span>
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'var(--ink-4)' }}>Duration</div>
                <div style={{ fontSize: 13, color: 'var(--ink)' }}>{Math.floor(selectedHandoff.durationSeconds / 60)}m {selectedHandoff.durationSeconds % 60}s</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'var(--ink-4)' }}>FHIR Sync</div>
                <span className={`badge ${selectedHandoff.fhirWriteStatus === 'success' ? 'badge-emerald' : 'badge-warning'}`}>
                  {selectedHandoff.fhirWriteStatus}
                </span>
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'var(--ink-4)' }}>Created</div>
                <div style={{ fontSize: 12, color: 'var(--ink)' }}>{timeAgo(selectedHandoff.createdAt)}</div>
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, color: 'var(--ink-4)', marginBottom: 4 }}>Flags</div>
              {selectedHandoff.flags?.length > 0 ? selectedHandoff.flags.map(f => (
                <div key={f.id} className={`flag-item flag-${f.severity.toLowerCase()}`}>
                  <span>{f.severity === 'CRITICAL' ? '🔴' : f.severity === 'WARNING' ? '🟡' : '🔵'}</span>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink)' }}>{f.title}</div>
                    <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>{f.description}</div>
                  </div>
                </div>
              )) : <div style={{ fontSize: 12, color: 'var(--ink-4)' }}>No flags</div>}
            </div>
            <button
              onClick={() => setSelectedHandoff(null)}
              style={{ width: '100%', padding: '10px', background: 'var(--parchment-2)', border: '1px solid var(--parchment-3)', borderRadius: 12, fontSize: 13, cursor: 'pointer', color: 'var(--ink)' }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </AppShell>
  );
}
