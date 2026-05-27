'use client';

import { useEffect, useState } from 'react';
import AppShell from '@/components/layout/AppShell';
import { useAppStore } from '@/store/appStore';
import { formatDateTime, timeAgo } from '@/lib/utils';
import type { Handoff } from '@/types';

export default function HandoffsPage() {
  const { handoffs, setHandoffs, patients, currentWard } = useAppStore();
  const [search, setSearch] = useState('');
  const [selectedHandoff, setSelectedHandoff] = useState<Handoff | null>(null);
  const [sortBy, setSortBy] = useState<'date' | 'quality' | 'duration'>('date');

  useEffect(() => {
    fetch('/api/handoffs?limit=50')
      .then(r => r.json())
      .then(d => setHandoffs(d.handoffs || d))
      .catch(() => {});
  }, [currentWard, setHandoffs]);

  const filtered = handoffs
    .filter(h => {
      const patient = patients.find(p => p.id === h.patientId);
      const q = search.toLowerCase();
      return !q || patient?.name?.toLowerCase().includes(q) || h.id?.toLowerCase().includes(q);
    })
    .sort((a, b) => {
      if (sortBy === 'quality') return b.qualityScore - a.qualityScore;
      if (sortBy === 'duration') return b.durationSeconds - a.durationSeconds;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  return (
    <AppShell title="Handoff Records" subtitle="All completed handoffs for your ward">
      {/* Filters */}
      <div className="card" style={{ padding: '16px 20px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
        <input
          placeholder="Search by patient name or ID..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ flex: 1 }}
        />
        <select value={sortBy} onChange={e => setSortBy(e.target.value as any)} style={{ width: 140 }}>
          <option value="date">Sort by Date</option>
          <option value="quality">Sort by Quality</option>
          <option value="duration">Sort by Duration</option>
        </select>
        <button
          onClick={() => {
            const csv = 'Timestamp,Patient,Quality Score,Duration\n' + filtered.map(h =>
              `${h.createdAt},${patients.find(p => p.id === h.patientId)?.name || ''},${h.qualityScore},${h.durationSeconds}s`
            ).join('\n');
            const blob = new Blob([csv], { type: 'text/csv' });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = 'handoffs.csv';
            a.click();
          }}
          style={{
            padding: '8px 16px', background: 'var(--parchment-2)', border: '1px solid var(--parchment-3)',
            borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', color: 'var(--ink)',
          }}
        >
          Export CSV
        </button>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflow: 'auto', maxHeight: 600 }}>
          <table>
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Patient</th>
                <th>Ward</th>
                <th>Quality</th>
                <th>Flags</th>
                <th>Duration</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={8} style={{ textAlign: 'center', padding: 40, color: 'var(--ink-4)' }}>No handoff records found.</td></tr>
              ) : filtered.map(h => {
                const patient = patients.find(p => p.id === h.patientId);
                return (
                  <tr key={h.id}>
                    <td><span className="mono" style={{ fontSize: 11 }}>{formatDateTime(h.createdAt)}</span></td>
                    <td style={{ fontWeight: 500 }}>{patient?.name || 'Unknown'}</td>
                    <td><span className="mono" style={{ fontSize: 11 }}>{h.wardId}</span></td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ width: 60, height: 4, background: 'var(--parchment-3)', borderRadius: 2, overflow: 'hidden' }}>
                          <div style={{
                            width: `${h.qualityScore}%`, height: '100%',
                            background: h.qualityScore >= 85 ? 'var(--emerald)' : h.qualityScore >= 70 ? 'var(--warning)' : 'var(--critical)',
                            borderRadius: 2,
                          }} />
                        </div>
                        <span className="mono" style={{ fontSize: 11 }}>{h.qualityScore}%</span>
                      </div>
                    </td>
                    <td>
                      {h.flags?.length > 0 ? (
                        <span className="badge badge-warning">{h.flags.length}</span>
                      ) : (
                        <span className="badge badge-emerald">✓</span>
                      )}
                    </td>
                    <td><span className="mono" style={{ fontSize: 11 }}>{Math.floor(h.durationSeconds / 60)}m {h.durationSeconds % 60}s</span></td>
                    <td>
                      <span className={`badge ${h.fhirWriteStatus === 'success' ? 'badge-emerald' : h.fhirWriteStatus === 'pending' ? 'badge-warning' : 'badge-critical'}`}>
                        {h.fhirWriteStatus === 'success' ? 'Complete' : h.fhirWriteStatus}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => setSelectedHandoff(h)}
                        style={{ fontSize: 11, color: 'var(--emerald)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedHandoff && (
        <div
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.4)', zIndex: 1000,
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
          }}
          onClick={() => setSelectedHandoff(null)}
        >
          <div className="glass" style={{ width: 640, maxHeight: '85vh', overflow: 'auto', padding: 32 }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontSize: 20, fontFamily: "'Instrument Serif', Georgia, serif", color: 'var(--ink)', margin: 0 }}>Handoff Detail</h2>
              <button onClick={() => setSelectedHandoff(null)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: 'var(--ink-3)' }}>✕</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 10, color: 'var(--ink-4)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Quality Score</div>
                <span className={`badge ${selectedHandoff.qualityScore >= 85 ? 'badge-emerald' : 'badge-warning'}`} style={{ marginTop: 4 }}>
                  {selectedHandoff.qualityScore}%
                </span>
              </div>
              <div>
                <div style={{ fontSize: 10, color: 'var(--ink-4)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Duration</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', marginTop: 4 }}>
                  {Math.floor(selectedHandoff.durationSeconds / 60)}m {selectedHandoff.durationSeconds % 60}s
                </div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: 'var(--ink-4)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>FHIR Sync</div>
                <span className={`badge ${selectedHandoff.fhirWriteStatus === 'success' ? 'badge-emerald' : 'badge-warning'}`} style={{ marginTop: 4 }}>
                  {selectedHandoff.fhirWriteStatus}
                </span>
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 10, color: 'var(--ink-4)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Transcript</div>
              <div style={{ fontSize: 12, color: 'var(--ink-2)', lineHeight: 1.7, padding: 12, background: 'var(--parchment-2)', borderRadius: 8, maxHeight: 150, overflow: 'auto' }}>
                {selectedHandoff.transcript || 'No transcript available'}
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 10, color: 'var(--ink-4)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Flags</div>
              {selectedHandoff.flags?.length > 0 ? selectedHandoff.flags.map(f => (
                <div key={f.id} className={`flag-item flag-${f.severity.toLowerCase()}`}>
                  <span>{f.severity === 'CRITICAL' ? '🔴' : f.severity === 'WARNING' ? '🟡' : '🔵'}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink)' }}>{f.title}</div>
                    <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>{f.description}</div>
                    <div style={{ fontSize: 10, color: 'var(--ink-4)', marginTop: 2 }}>{f.resolved ? '✓ Resolved' : '○ Active'}</div>
                  </div>
                </div>
              )) : <div style={{ fontSize: 12, color: 'var(--ink-4)', padding: 8 }}>No flags</div>}
            </div>

            <div style={{ fontSize: 10, color: 'var(--ink-4)', fontStyle: 'italic', marginBottom: 16 }}>
              Generated by HandOffAI · {formatDateTime(selectedHandoff.createdAt)}
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => setSelectedHandoff(null)}
                style={{
                  flex: 1, padding: '10px', background: 'var(--parchment-2)',
                  border: '1px solid var(--parchment-3)', borderRadius: 12,
                  fontSize: 13, cursor: 'pointer', color: 'var(--ink)',
                }}
              >
                Close
              </button>
              <button
                onClick={() => {
                  const content = JSON.stringify(selectedHandoff, null, 2);
                  const blob = new Blob([content], { type: 'application/json' });
                  const a = document.createElement('a');
                  a.href = URL.createObjectURL(blob);
                  a.download = `handoff-${selectedHandoff.id}.json`;
                  a.click();
                }}
                style={{
                  padding: '10px 20px', background: 'var(--emerald)', color: '#fff',
                  border: 'none', borderRadius: 12, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                }}
              >
                Export JSON
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
