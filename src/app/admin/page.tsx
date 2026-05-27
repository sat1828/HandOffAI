'use client';

import { useEffect, useState } from 'react';
import AppShell from '@/components/layout/AppShell';
import { timeAgo } from '@/lib/utils';
import toast from 'react-hot-toast';

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
  lastActive: string | null;
}

interface SystemStats {
  totalUsers: number;
  totalHandoffs: number;
  totalPatients: number;
  totalFlags: number;
  totalAuditLogs: number;
  recentLogs: { id: string; action: string; metadata: string; createdAt: string; user: { name: string; email: string } }[];
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState('CLINICIAN');

  useEffect(() => {
    loadUsers();
    loadStats();
  }, []);

  async function loadUsers() {
    const res = await fetch('/api/admin/users');
    if (res.ok) setUsers(await res.json());
  }

  async function loadStats() {
    const res = await fetch('/api/admin/stats');
    if (res.ok) setStats(await res.json());
  }

  async function handleRoleChange(userId: string, role: string) {
    const res = await fetch(`/api/admin/users/${userId}/role`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role }),
    });
    if (res.ok) {
      toast.success('Role updated');
      loadUsers();
    } else {
      toast.error('Failed to update role');
    }
  }

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: inviteEmail, name: inviteName, role: inviteRole }),
    });
    if (res.ok) {
      toast.success('User invited');
      setShowInvite(false);
      setInviteEmail('');
      setInviteName('');
      setInviteRole('CLINICIAN');
      loadUsers();
    } else {
      const err = await res.json();
      toast.error(err.error || 'Failed to invite user');
    }
  }

  const tabs = ['users', 'system'];

  return (
    <AppShell title="Admin Panel">
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--parchment-3)' }}>
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '10px 24px',
                border: 'none',
                background: 'none',
                fontSize: 14,
                fontWeight: activeTab === tab ? 600 : 400,
                color: activeTab === tab ? 'var(--emerald)' : 'var(--ink-3)',
                borderBottom: activeTab === tab ? '2px solid var(--emerald)' : '2px solid transparent',
                cursor: 'pointer',
                textTransform: 'capitalize',
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'users' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--parchment-3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: 16, fontFamily: "'Instrument Serif', Georgia, serif", color: 'var(--ink)', margin: 0 }}>Users</h2>
            <button onClick={() => setShowInvite(true)} style={{ padding: '8px 16px', background: 'var(--emerald)', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 12, cursor: 'pointer' }}>
              + Invite User
            </button>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Last Active</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td style={{ fontWeight: 500 }}>{u.name || '—'}</td>
                    <td style={{ fontSize: 12 }}>{u.email}</td>
                    <td>
                      <select
                        value={u.role}
                        onChange={e => handleRoleChange(u.id, e.target.value)}
                        style={{ fontSize: 12, padding: '4px 8px' }}
                      >
                        <option value="ADMIN">Admin</option>
                        <option value="CLINICIAN">Clinician</option>
                        <option value="VIEWER">Viewer</option>
                        <option value="AUDITOR">Auditor</option>
                      </select>
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--ink-3)' }}>{u.lastActive ? timeAgo(u.lastActive) : 'Never'}</td>
                    <td style={{ fontSize: 12, color: 'var(--ink-3)' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr><td colSpan={5} style={{ textAlign: 'center', padding: 24, color: 'var(--ink-4)' }}>No users found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'system' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
            {stats ? [
              { label: 'Total Users', value: stats.totalUsers },
              { label: 'Handoffs', value: stats.totalHandoffs },
              { label: 'Patients', value: stats.totalPatients },
              { label: 'Flags', value: stats.totalFlags },
              { label: 'Audit Logs', value: stats.totalAuditLogs },
            ].map((s, i) => (
              <div key={i} className="card" style={{ padding: '16px 20px' }}>
                <div style={{ fontSize: 12, color: 'var(--ink-3)', marginBottom: 4 }}>{s.label}</div>
                <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--ink)', fontFamily: "'Instrument Serif', Georgia, serif" }}>{s.value}</div>
              </div>
            )) : (
              <div style={{ fontSize: 13, color: 'var(--ink-4)', gridColumn: '1 / -1', padding: 24 }}>Loading...</div>
            )}
          </div>

          <div className="card" style={{ padding: '16px 20px' }}>
            <h3 style={{ fontSize: 14, fontFamily: "'Instrument Serif', Georgia, serif", color: 'var(--ink)', margin: '0 0 12px' }}>Recent Audit Activity</h3>
            {stats?.recentLogs?.length ? (
              <div>
                {stats.recentLogs.map(log => (
                  <div key={log.id} className="mono" style={{ padding: '6px 0', borderBottom: '1px solid var(--parchment-3)', fontSize: 11, color: 'var(--ink-3)' }}>
                    <span style={{ color: 'var(--ink-2)' }}>{new Date(log.createdAt).toLocaleString()}</span> — {log.user?.name || 'Unknown'} {log.action}
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ fontSize: 12, color: 'var(--ink-4)', padding: 12, textAlign: 'center' }}>No audit logs yet</div>
            )}
          </div>
        </>
      )}

      {showInvite && (
        <div
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
          onClick={() => setShowInvite(false)}
        >
          <div className="glass" style={{ width: 420, maxWidth: '100%', padding: 32 }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontSize: 20, fontFamily: "'Instrument Serif', Georgia, serif", color: 'var(--ink)', margin: 0 }}>Invite User</h2>
              <button onClick={() => setShowInvite(false)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: 'var(--ink-3)' }}>✕</button>
            </div>
            <form onSubmit={handleInvite}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-2)', display: 'block', marginBottom: 6 }}>Email</label>
                <input type="email" required value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} style={{ width: '100%' }} placeholder="user@hospital.com" />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-2)', display: 'block', marginBottom: 6 }}>Name</label>
                <input type="text" value={inviteName} onChange={e => setInviteName(e.target.value)} style={{ width: '100%' }} placeholder="Dr. Name" />
              </div>
              <div style={{ marginBottom: 24 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-2)', display: 'block', marginBottom: 6 }}>Role</label>
                <select value={inviteRole} onChange={e => setInviteRole(e.target.value)} style={{ width: '100%' }}>
                  <option value="ADMIN">Admin</option>
                  <option value="CLINICIAN">Clinician</option>
                  <option value="VIEWER">Viewer</option>
                  <option value="AUDITOR">Auditor</option>
                </select>
              </div>
              <button type="submit" style={{ width: '100%', padding: '10px', background: 'var(--emerald)', color: '#fff', border: 'none', borderRadius: 12, fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                Send Invite
              </button>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
