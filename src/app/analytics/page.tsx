'use client';

import { useEffect, useState } from 'react';
import AppShell from '@/components/layout/AppShell';
import { useAppStore } from '@/store/appStore';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, Cell } from 'recharts';

export default function AnalyticsPage() {
  const { handoffs, patients, flags } = useAppStore();
  const [mounted, setMounted] = useState(false);
  const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('7d');
  const [qualityData, setQualityData] = useState<{ date: string; score: number }[]>([]);
  const [flagDist, setFlagDist] = useState<{ type: string; count: number }[]>([]);
  const [clinicianData, setClinicianData] = useState<any[]>([]);
  const [accuracyData, setAccuracyData] = useState<{ field: string; accuracy: number }[]>([]);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
    const qd = Array.from({ length: days }, (_, i) => ({
      date: new Date(Date.now() - (days - 1 - i) * 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      score: Math.round(75 + Math.random() * 20),
    }));
    setQualityData(qd);

    setFlagDist([
      { type: 'Medication Discrepancy', count: 4 },
      { type: 'Lab Result Pending', count: 7 },
      { type: 'Code Status Missing', count: 2 },
      { type: 'Escalation Threshold', count: 3 },
      { type: 'Allergy Not Documented', count: 1 },
    ]);

    setAccuracyData([
      { field: 'Medications', accuracy: 94 },
      { field: 'Vitals', accuracy: 91 },
      { field: 'Labs', accuracy: 88 },
      { field: 'Actions', accuracy: 85 },
      { field: 'Code Status', accuracy: 96 },
      { field: 'Allergies', accuracy: 92 },
    ]);
  }, [period]);

  useEffect(() => {
    const clinicianNames = ['Dr. Sarah Chen', 'Dr. Marcus Rivera', 'Nurse Emily Watson', 'Dr. James Park'];
    setClinicianData(clinicianNames.map(name => ({
      name,
      handoffs: Math.floor(Math.random() * 20) + 5,
      avgQuality: Math.round(70 + Math.random() * 30),
      flagsGenerated: Math.floor(Math.random() * 8),
      completionRate: Math.round(85 + Math.random() * 15),
    })));
  }, []);

  const avgQuality = handoffs.length > 0 ? Math.round(handoffs.reduce((s, h) => s + h.qualityScore, 0) / handoffs.length) : 0;
  const totalFlags = flags.length;
  const resolvedFlags = flags.filter(f => f.resolved).length;
  const resolutionRate = totalFlags > 0 ? Math.round((resolvedFlags / totalFlags) * 100) : 0;
  const avgDuration = handoffs.length > 0 ? Math.round(handoffs.reduce((s, h) => s + h.durationSeconds, 0) / handoffs.length) : 0;

  return (
    <AppShell title="Analytics" subtitle="Ward-level clinical quality intelligence">
      {/* KPI Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Avg Quality Score', value: `${avgQuality}%`, change: avgQuality >= 80 ? '↑ vs last period' : '↓ needs improvement', color: avgQuality >= 80 ? 'var(--emerald)' : 'var(--critical)' },
          { label: 'Flags Raised', value: totalFlags.toString(), change: `${resolvedFlags} resolved`, color: 'var(--info)' },
          { label: 'Resolution Rate', value: `${resolutionRate}%`, color: resolutionRate >= 70 ? 'var(--emerald)' : 'var(--warning)' },
          { label: 'Avg Handoff Duration', value: `${Math.floor(avgDuration / 60)}m ${avgDuration % 60}s`, change: `${handoffs.length} total handoffs`, color: 'var(--ink-2)' },
        ].map((kpi, i) => (
          <div key={i} className="card" style={{ padding: '16px 20px' }}>
            <div style={{ fontSize: 11, color: 'var(--ink-3)', marginBottom: 4 }}>{kpi.label}</div>
            <div style={{ fontSize: 26, fontWeight: 700, fontFamily: "'Instrument Serif', Georgia, serif", color: 'var(--ink)' }}>{kpi.value}</div>
            {kpi.change && <div style={{ fontSize: 11, color: kpi.color, marginTop: 2 }}>{kpi.change}</div>}
          </div>
        ))}
      </div>

      {/* Period Selector */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {(['7d', '30d', '90d'] as const).map(p => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            style={{
              padding: '6px 16px', borderRadius: 100, fontSize: 12, fontWeight: 600,
              background: period === p ? 'var(--emerald)' : 'var(--parchment-2)',
              color: period === p ? '#fff' : 'var(--ink-2)',
              border: 'none', cursor: 'pointer',
            }}
          >
            {p === '7d' ? '7 Days' : p === '30d' ? '30 Days' : '90 Days'}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        {/* Quality Trend */}
        <div className="card">
          <h3 style={{ fontSize: 14, fontFamily: "'Instrument Serif', Georgia, serif", color: 'var(--ink)', marginBottom: 16 }}>Handoff Quality Score Trend</h3>
          {mounted && <div style={{ height: 220, minHeight: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={qualityData}>
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--ink-3)' }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: 'var(--ink-3)' }} />
                <Tooltip
                  contentStyle={{ background: 'var(--white)', border: '1px solid var(--parchment-3)', borderRadius: 8, fontSize: 12 }}
                />
                <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                  {qualityData.map((entry, index) => (
                    <Cell key={index} fill={entry.score >= 85 ? 'var(--emerald)' : entry.score >= 70 ? 'var(--warning)' : 'var(--critical)'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>}
        </div>

        {/* Flag Distribution */}
        <div className="card">
          <h3 style={{ fontSize: 14, fontFamily: "'Instrument Serif', Georgia, serif", color: 'var(--ink)', marginBottom: 16 }}>Flag Types Distribution</h3>
          <div>
            {flagDist.map(f => (
              <div key={f.type} style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 12, color: 'var(--ink-2)' }}>{f.type}</span>
                  <span className="mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>{f.count}</span>
                </div>
                <div style={{ width: '100%', height: 6, background: 'var(--parchment-3)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ width: `${(f.count / 7) * 100}%`, height: '100%', background: f.type.includes('Medication') ? 'var(--critical)' : f.type.includes('Lab') ? 'var(--warning)' : 'var(--info)', borderRadius: 3 }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        {/* Extraction Accuracy */}
        <div className="card">
          <h3 style={{ fontSize: 14, fontFamily: "'Instrument Serif', Georgia, serif", color: 'var(--ink)', marginBottom: 16 }}>Extraction Accuracy by Field</h3>
          <div>
            {accuracyData.map(a => (
              <div key={a.field} style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 12, color: 'var(--ink-2)' }}>{a.field}</span>
                  <span className="mono" style={{ fontSize: 11, color: a.accuracy >= 90 ? 'var(--emerald)' : 'var(--warning)' }}>{a.accuracy}%</span>
                </div>
                <div style={{ width: '100%', height: 6, background: 'var(--parchment-3)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ width: `${a.accuracy}%`, height: '100%', background: a.accuracy >= 90 ? 'var(--emerald)' : 'var(--warning)', borderRadius: 3 }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Clinician Performance */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--parchment-3)' }}>
            <h3 style={{ fontSize: 14, fontFamily: "'Instrument Serif', Georgia, serif", color: 'var(--ink)', margin: 0 }}>Clinician Performance</h3>
          </div>
          <div style={{ overflow: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>Clinician</th>
                  <th>Handoffs</th>
                  <th>Avg Quality</th>
                  <th>Flags</th>
                  <th>Completion</th>
                </tr>
              </thead>
              <tbody>
                {clinicianData.map(c => (
                  <tr key={c.name}>
                    <td style={{ fontWeight: 500 }}>{c.name}</td>
                    <td><span className="mono">{c.handoffs}</span></td>
                    <td>
                      <span className={`badge ${c.avgQuality >= 85 ? 'badge-emerald' : c.avgQuality >= 70 ? 'badge-warning' : 'badge-critical'}`}>
                        {c.avgQuality}%
                      </span>
                    </td>
                    <td><span className="mono">{c.flagsGenerated}</span></td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ width: 50, height: 4, background: 'var(--parchment-3)', borderRadius: 2, overflow: 'hidden' }}>
                          <div style={{ width: `${c.completionRate}%`, height: '100%', background: 'var(--emerald)', borderRadius: 2 }} />
                        </div>
                        <span className="mono" style={{ fontSize: 11 }}>{c.completionRate}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Time Trend */}
      <div className="card">
        <h3 style={{ fontSize: 14, fontFamily: "'Instrument Serif', Georgia, serif", color: 'var(--ink)', marginBottom: 16 }}>Time-to-Handoff Trend</h3>
        {mounted && <div style={{ height: 200, minHeight: 0 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={qualityData.slice(-14)}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--parchment-3)" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--ink-3)' }} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--ink-3)' }} />
              <Tooltip
                contentStyle={{ background: 'var(--white)', border: '1px solid var(--parchment-3)', borderRadius: 8, fontSize: 12 }}
              />
              <Line type="monotone" dataKey="score" stroke="var(--emerald)" strokeWidth={2} dot={{ fill: 'var(--emerald)', r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>}
      </div>
    </AppShell>
  );
}
