'use client';

import { useEffect, useState } from 'react';
import AppShell from '@/components/layout/AppShell';
import { useThemeStore } from '@/store/themeStore';
import toast from 'react-hot-toast';

interface UserSettings {
  hospitalName: string;
  activeWard: string;
  shiftPattern: string;
  model: string;
  extractionProtocol: string;
  autoFlag: boolean;
  realtimeStreaming: boolean;
  minRecordingDuration: number;
  fhirEndpoint: string;
  fhirClientId: string;
  fhirSyncInterval: number;
  slackWebhook: string;
  emailAlerts: boolean;
  sessionTimeout: number;
  compactView: boolean;
  fontSize: number;
}

const defaultSettings: UserSettings = {
  hospitalName: 'University Medical Center',
  activeWard: 'ICU',
  shiftPattern: '3-shift',
  model: 'claude-sonnet-4',
  extractionProtocol: 'ipass-sbar',
  autoFlag: true,
  realtimeStreaming: true,
  minRecordingDuration: 30,
  fhirEndpoint: 'https://fhir.hospital.com/R4',
  fhirClientId: 'handoffai-prod',
  fhirSyncInterval: 15,
  slackWebhook: '',
  emailAlerts: true,
  sessionTimeout: 15,
  compactView: false,
  fontSize: 15,
};

export default function SettingsPage() {
  const { theme, toggleTheme } = useThemeStore();
  const [activeSection, setActiveSection] = useState('hospital');
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        if (data && Object.keys(data).length > 0) {
          setSettings(prev => ({ ...prev, ...data }));
        }
      }
    } catch {}
    setLoading(false);
  }

  async function saveSettings() {
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        toast.success('Settings saved');
      } else {
        toast.error('Failed to save settings');
      }
    } catch {
      toast.error('Failed to save settings');
    }
  }

  const sections = [
    { id: 'hospital', label: 'Hospital Profile' },
    { id: 'ai', label: 'AI & Extraction' },
    { id: 'ehr', label: 'EHR Integration' },
    { id: 'notifications', label: 'Notifications' },
    { id: 'security', label: 'Security' },
    { id: 'appearance', label: 'Appearance' },
  ];

  if (loading) {
    return (
      <AppShell title="Settings" subtitle="Configure your HandOffAI instance">
        <div style={{ padding: 24, color: 'var(--ink-4)' }}>Loading settings...</div>
      </AppShell>
    );
  }

  return (
    <AppShell title="Settings" subtitle="Configure your HandOffAI instance">
      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 24 }}>
        <div className="card" style={{ padding: '8px', height: 'fit-content' }}>
          {sections.map(s => (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              style={{
                width: '100%', display: 'block', padding: '8px 12px',
                borderRadius: 8, border: 'none', textAlign: 'left',
                background: activeSection === s.id ? 'var(--emerald-light)' : 'transparent',
                color: activeSection === s.id ? 'var(--emerald)' : 'var(--ink-2)',
                fontWeight: activeSection === s.id ? 600 : 400,
                fontSize: 13, cursor: 'pointer', marginBottom: 2,
              }}
            >
              {s.label}
            </button>
          ))}
        </div>

        <div className="card">
          {activeSection === 'hospital' && (
            <div>
              <h2 style={{ fontSize: 18, fontFamily: "'Instrument Serif', Georgia, serif", color: 'var(--ink)', marginBottom: 20 }}>Hospital Profile</h2>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-2)', display: 'block', marginBottom: 6 }}>Hospital Name</label>
                <input value={settings.hospitalName} onChange={e => setSettings(s => ({ ...s, hospitalName: e.target.value }))} style={{ width: '100%' }} />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-2)', display: 'block', marginBottom: 6 }}>Active Ward</label>
                <select value={settings.activeWard} onChange={e => setSettings(s => ({ ...s, activeWard: e.target.value }))} style={{ width: '100%' }}>
                  <option value="ICU">ICU</option>
                  <option value="Cardiology">Cardiology</option>
                  <option value="Neurology">Neurology</option>
                  <option value="Emergency Dept">Emergency Dept</option>
                </select>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-2)', display: 'block', marginBottom: 6 }}>Shift Pattern</label>
                <select value={settings.shiftPattern} onChange={e => setSettings(s => ({ ...s, shiftPattern: e.target.value }))} style={{ width: '100%' }}>
                  <option value="2-shift">2-Shift (07:00–19:00 / 19:00–07:00)</option>
                  <option value="3-shift">3-Shift (07:00–15:00 / 15:00–23:00 / 23:00–07:00)</option>
                </select>
              </div>
              <button onClick={saveSettings} style={{ padding: '10px 24px', background: 'var(--emerald)', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                Save Changes
              </button>
            </div>
          )}

          {activeSection === 'ai' && (
            <div>
              <h2 style={{ fontSize: 18, fontFamily: "'Instrument Serif', Georgia, serif", color: 'var(--ink)', marginBottom: 20 }}>AI & Extraction Settings</h2>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-2)', display: 'block', marginBottom: 6 }}>Extraction Model</label>
                <select value={settings.model} onChange={e => setSettings(s => ({ ...s, model: e.target.value }))} style={{ width: '100%' }}>
                  <option value="claude-sonnet-4">Claude claude-sonnet-4-20250514 (Recommended)</option>
                  <option value="gpt-4o">GPT-4o</option>
                </select>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-2)', display: 'block', marginBottom: 6 }}>Extraction Protocol</label>
                <select value={settings.extractionProtocol} onChange={e => setSettings(s => ({ ...s, extractionProtocol: e.target.value }))} style={{ width: '100%' }}>
                  <option value="ipass-sbar">I-PASS + SBAR</option>
                  <option value="sbar">SBAR Only</option>
                  <option value="ipass">I-PASS Only</option>
                </select>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input type="checkbox" checked={settings.autoFlag} onChange={e => setSettings(s => ({ ...s, autoFlag: e.target.checked }))} />
                  <span style={{ fontSize: 13, color: 'var(--ink-2)' }}>Auto-flag EHR discrepancies</span>
                </label>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input type="checkbox" checked={settings.realtimeStreaming} onChange={e => setSettings(s => ({ ...s, realtimeStreaming: e.target.checked }))} />
                  <span style={{ fontSize: 13, color: 'var(--ink-2)' }}>Real-time streaming during recording</span>
                </label>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-2)', display: 'block', marginBottom: 6 }}>Min Recording Duration (seconds)</label>
                <input type="number" value={settings.minRecordingDuration} onChange={e => setSettings(s => ({ ...s, minRecordingDuration: Number(e.target.value) }))} style={{ width: 120 }} />
              </div>
              <button onClick={saveSettings} style={{ padding: '10px 24px', background: 'var(--emerald)', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                Save Changes
              </button>
            </div>
          )}

          {activeSection === 'ehr' && (
            <div>
              <h2 style={{ fontSize: 18, fontFamily: "'Instrument Serif', Georgia, serif", color: 'var(--ink)', marginBottom: 20 }}>EHR Integration</h2>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-2)', display: 'block', marginBottom: 6 }}>FHIR Endpoint URL</label>
                <input value={settings.fhirEndpoint} onChange={e => setSettings(s => ({ ...s, fhirEndpoint: e.target.value }))} style={{ width: '100%' }} />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-2)', display: 'block', marginBottom: 6 }}>SMART Client ID</label>
                <input value={settings.fhirClientId} onChange={e => setSettings(s => ({ ...s, fhirClientId: e.target.value }))} style={{ width: '100%' }} />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-2)', display: 'block', marginBottom: 6 }}>Sync Interval (minutes)</label>
                <input type="number" value={settings.fhirSyncInterval} onChange={e => setSettings(s => ({ ...s, fhirSyncInterval: Number(e.target.value) }))} style={{ width: 120 }} />
              </div>
              <div style={{ marginBottom: 16, padding: '12px 16px', background: 'var(--emerald-light)', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: 'var(--emerald)', fontSize: 16 }}>✓</span>
                <span style={{ fontSize: 13, color: 'var(--ink)' }}>Epic FHIR R4 — Connected</span>
                <button style={{ marginLeft: 'auto', padding: '4px 12px', fontSize: 11, background: 'var(--parchment-2)', border: '1px solid var(--parchment-3)', borderRadius: 6, cursor: 'pointer' }}>
                  Test Connection
                </button>
              </div>
              <button onClick={saveSettings} style={{ padding: '10px 24px', background: 'var(--emerald)', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                Save Changes
              </button>
            </div>
          )}

          {activeSection === 'notifications' && (
            <div>
              <h2 style={{ fontSize: 18, fontFamily: "'Instrument Serif', Georgia, serif", color: 'var(--ink)', marginBottom: 20 }}>Notifications</h2>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input type="checkbox" checked={settings.emailAlerts} onChange={e => setSettings(s => ({ ...s, emailAlerts: e.target.checked }))} />
                  <span style={{ fontSize: 13, color: 'var(--ink-2)' }}>Email alerts for critical flags</span>
                </label>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-2)', display: 'block', marginBottom: 6 }}>Slack Webhook URL</label>
                <input value={settings.slackWebhook} onChange={e => setSettings(s => ({ ...s, slackWebhook: e.target.value }))} style={{ width: '100%' }} placeholder="https://hooks.slack.com/services/..." />
              </div>
              <button onClick={saveSettings} style={{ padding: '10px 24px', background: 'var(--emerald)', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                Save Changes
              </button>
            </div>
          )}

          {activeSection === 'security' && (
            <div>
              <h2 style={{ fontSize: 18, fontFamily: "'Instrument Serif', Georgia, serif", color: 'var(--ink)', marginBottom: 20 }}>Security</h2>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-2)', display: 'block', marginBottom: 6 }}>Session Timeout (minutes)</label>
                <input type="number" value={settings.sessionTimeout} onChange={e => setSettings(s => ({ ...s, sessionTimeout: Number(e.target.value) }))} style={{ width: 120 }} />
              </div>
              <button onClick={saveSettings} style={{ padding: '10px 24px', background: 'var(--emerald)', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                Save Changes
              </button>
            </div>
          )}

          {activeSection === 'appearance' && (
            <div>
              <h2 style={{ fontSize: 18, fontFamily: "'Instrument Serif', Georgia, serif", color: 'var(--ink)', marginBottom: 20 }}>Appearance</h2>
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-2)', marginBottom: 8 }}>Theme</div>
                <div style={{ display: 'flex', gap: 12 }}>
                  <button
                    onClick={() => { if (theme !== 'light') toggleTheme(); }}
                    style={{
                      padding: '8px 20px', borderRadius: 8, border: theme === 'light' ? '2px solid var(--emerald)' : '1px solid var(--parchment-3)',
                      background: theme === 'light' ? 'var(--emerald-light)' : 'var(--parchment-2)',
                      color: 'var(--ink)', fontWeight: 600, fontSize: 13, cursor: 'pointer',
                    }}
                  >
                    ☀️ Light
                  </button>
                  <button
                    onClick={() => { if (theme !== 'dark') toggleTheme(); }}
                    style={{
                      padding: '8px 20px', borderRadius: 8, border: theme === 'dark' ? '2px solid var(--emerald)' : '1px solid var(--parchment-3)',
                      background: theme === 'dark' ? 'var(--emerald-light)' : 'var(--parchment-2)',
                      color: 'var(--ink)', fontWeight: 600, fontSize: 13, cursor: 'pointer',
                    }}
                  >
                    🌙 Dark
                  </button>
                </div>
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-2)', display: 'block', marginBottom: 6 }}>Font Size: {settings.fontSize}px</label>
                <input
                  type="range"
                  min={12}
                  max={20}
                  value={settings.fontSize}
                  onChange={e => setSettings(s => ({ ...s, fontSize: Number(e.target.value) }))}
                  style={{ width: 200 }}
                />
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input type="checkbox" checked={settings.compactView} onChange={e => setSettings(s => ({ ...s, compactView: e.target.checked }))} />
                  <span style={{ fontSize: 13, color: 'var(--ink-2)' }}>Compact view (denser layout)</span>
                </label>
              </div>
              <button onClick={saveSettings} style={{ padding: '10px 24px', background: 'var(--emerald)', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                Save Changes
              </button>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
