'use client';

import { useEffect, useState } from 'react';
import AppShell from '@/components/layout/AppShell';

interface AuditLogEntry {
  id: string;
  action: string;
  metadata: string;
  createdAt: string;
  user: { name: string; email: string };
}

export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [days, setDays] = useState(7);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLogs();
  }, [page, days]);

  async function loadLogs() {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20', search, days: String(days) });
      const res = await fetch(`/api/audit-logs?${params}`);
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs);
        setTotalPages(data.totalPages);
      }
    } catch {}
    setLoading(false);
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    loadLogs();
  }

  const dayOptions = [
    { label: 'Today', value: 1 },
    { label: '7 Days', value: 7 },
    { label: '30 Days', value: 30 },
    { label: 'All', value: 0 },
  ];

  return (
    <AppShell title="Audit Log">
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--parchment-3)', display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8, flex: 1, minWidth: 200 }}>
            <input
              type="text"
              placeholder="Search by email or action..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ flex: 1 }}
            />
            <button type="submit" style={{ padding: '8px 16px', background: 'var(--emerald)', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 12, cursor: 'pointer' }}>
              Search
            </button>
          </form>
          <div style={{ display: 'flex', gap: 4 }}>
            {dayOptions.map(d => (
              <button
                key={d.value}
                onClick={() => { setDays(d.value); setPage(1); }}
                style={{
                  padding: '6px 12px', borderRadius: 6, border: '1px solid var(--parchment-3)',
                  background: days === d.value ? 'var(--emerald-light)' : 'transparent',
                  color: days === d.value ? 'var(--emerald)' : 'var(--ink-2)',
                  fontWeight: days === d.value ? 600 : 400,
                  fontSize: 12, cursor: 'pointer',
                }}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th style={{ width: 180 }}>Timestamp</th>
                <th>User</th>
                <th>Action</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} style={{ textAlign: 'center', padding: 32, color: 'var(--ink-4)' }}>Loading...</td></tr>
              ) : logs.length === 0 ? (
                <tr><td colSpan={4} style={{ textAlign: 'center', padding: 32, color: 'var(--ink-4)' }}>No audit logs found</td></tr>
              ) : logs.map(log => (
                <>
                  <tr key={log.id} onClick={() => setExpandedId(expandedId === log.id ? null : log.id)} style={{ cursor: 'pointer' }}>
                    <td className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', whiteSpace: 'nowrap' }}>{new Date(log.createdAt).toLocaleString()}</td>
                    <td style={{ fontSize: 12 }}>{log.user?.name || 'Unknown'} <span style={{ color: 'var(--ink-4)' }}>({log.user?.email})</span></td>
                    <td><span className="badge badge-info">{log.action}</span></td>
                    <td style={{ fontSize: 12, color: 'var(--ink-3)' }}>
                      {expandedId === log.id ? '▲ Collapse' : '▼ Expand'}
                    </td>
                  </tr>
                  {expandedId === log.id && (
                    <tr key={`${log.id}-details`}>
                      <td colSpan={4} style={{ padding: '12px 16px', background: 'var(--parchment-2)' }}>
                        <pre className="mono" style={{ fontSize: 11, color: 'var(--ink-2)', whiteSpace: 'pre-wrap', wordBreak: 'break-word', margin: 0 }}>
                          {JSON.stringify(JSON.parse(log.metadata || '{}'), null, 2)}
                        </pre>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ padding: '12px 20px', borderTop: '1px solid var(--parchment-3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, color: 'var(--ink-3)' }}>
          <span>Page {page} of {totalPages}</span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              disabled={page <= 1}
              onClick={() => setPage(p => p - 1)}
              style={{
                padding: '6px 14px', border: '1px solid var(--parchment-3)', borderRadius: 6,
                background: page <= 1 ? 'var(--parchment)' : 'var(--white)',
                color: page <= 1 ? 'var(--ink-4)' : 'var(--ink-2)',
                cursor: page <= 1 ? 'default' : 'pointer', fontSize: 12,
              }}
            >
              Previous
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(p => p + 1)}
              style={{
                padding: '6px 14px', border: '1px solid var(--parchment-3)', borderRadius: 6,
                background: page >= totalPages ? 'var(--parchment)' : 'var(--white)',
                color: page >= totalPages ? 'var(--ink-4)' : 'var(--ink-2)',
                cursor: page >= totalPages ? 'default' : 'pointer', fontSize: 12,
              }}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
