'use client';

import { useSession, signOut } from 'next-auth/react';
import { useAppStore } from '@/store/appStore';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function Topbar({ title, subtitle }: { title: string; subtitle?: string }) {
  const { data: session } = useSession();
  const { toggleSidebar, currentWard } = useAppStore();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const user = session?.user as any;
  const initials = (user?.name?.split(' ') || []).map((n: string) => n[0]).join('') || (user?.email?.[0] || '').toUpperCase() || 'U';

  return (
    <header style={{
      height: 52,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      borderBottom: '1px solid var(--parchment-3)',
      background: 'var(--white)',
      flexShrink: 0,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <button onClick={toggleSidebar} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: 'var(--ink-3)' }}>☰</button>
        <div>
          <h1 style={{ fontSize: 16, fontFamily: "'Instrument Serif', Georgia, serif", color: 'var(--ink)', margin: 0 }}>{title}</h1>
          {subtitle && <span style={{ fontSize: 11, color: 'var(--ink-4)' }}>{subtitle}</span>}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <span className="live-dot" />
        <span className="mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>{currentWard} — LIVE</span>
        <button
          onClick={() => router.push('/handoff/new')}
          style={{
            background: 'var(--emerald)',
            color: '#fff',
            border: 'none',
            borderRadius: 100,
            padding: '6px 16px',
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          + New Handoff
        </button>
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="avatar-circle"
            style={{ background: 'var(--emerald-light)', color: 'var(--emerald)', width: 30, height: 30, fontSize: 11, border: 'none', cursor: 'pointer' }}
          >
            {initials}
          </button>
          {menuOpen && (
            <div className="glass" style={{
              position: 'absolute', right: 0, top: 36, width: 180, padding: 8, zIndex: 100,
              backdropFilter: 'blur(20px)',
            }}>
              <div style={{ padding: '8px 10px', fontSize: 12, color: 'var(--ink-2)', borderBottom: '1px solid var(--parchment-3)', marginBottom: 4 }}>
                {user?.name || user?.email}
                <div style={{ fontSize: 10, color: 'var(--ink-4)', marginTop: 2 }}>{user?.role}</div>
              </div>
              <button
                onClick={() => { signOut({ callbackUrl: '/login' }); setMenuOpen(false); }}
                style={{ width: '100%', padding: '8px 10px', fontSize: 12, color: 'var(--critical)', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', borderRadius: 6 }}
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
