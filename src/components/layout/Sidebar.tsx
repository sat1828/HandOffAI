'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useAppStore } from '@/store/appStore';
import { useThemeStore } from '@/store/themeStore';

const navItems = [
  { section: 'Clinical', items: [
    { label: 'Dashboard', path: '/dashboard', icon: '◉' },
    { label: 'New Handoff', path: '/handoff/new', icon: '⊕' },
    { label: 'Patients', path: '/patients', icon: '⊞' },
    { label: 'Handoff Records', path: '/handoffs', icon: '☰' },
  ]},
  { section: 'Intelligence', items: [
    { label: 'Analytics', path: '/analytics', icon: '◈' },
  ]},
  { section: 'Administration', items: [
    { label: 'Admin Panel', path: '/admin', icon: '⚙' },
    { label: 'Audit Log', path: '/audit-log', icon: '⊡' },
    { label: 'Settings', path: '/settings', icon: '⚙' },
  ]},
];

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { currentWard, setCurrentWard, sidebarOpen } = useAppStore();
  const { theme, toggleTheme } = useThemeStore();

  const isActive = (path: string) => pathname === path;

  return (
    <aside style={{
      width: sidebarOpen ? 220 : 0,
      minHeight: '100vh',
      background: 'var(--white)',
      borderRight: '1px solid var(--parchment-3)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      transition: 'width 0.2s ease',
      flexShrink: 0,
    }}>
      <div style={{ padding: '20px 16px', borderBottom: '1px solid var(--parchment-3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <span style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 20, color: 'var(--emerald)', fontWeight: 600 }}>HandOffAI</span>
        </div>
        <select
          value={currentWard}
          onChange={(e) => setCurrentWard(e.target.value)}
          style={{ width: '100%', fontSize: 12, padding: '6px 10px' }}
        >
          <option value="ICU">ICU</option>
          <option value="Cardiology">Cardiology</option>
          <option value="Neurology">Neurology</option>
          <option value="ED">Emergency Dept</option>
        </select>
      </div>

      <div style={{ flex: 1, padding: '12px 8px', overflowY: 'auto' }}>
        {navItems.map((section) => (
          <div key={section.section} style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--ink-4)', padding: '0 8px', marginBottom: 4 }}>
              {section.section}
            </div>
            {section.items.map((item) => {
              const active = isActive(item.path);
              return (
                <button
                  key={item.path}
                  onClick={() => router.push(item.path)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '8px 12px',
                    borderRadius: 8,
                    border: 'none',
                    background: active ? 'var(--emerald-light)' : 'transparent',
                    color: active ? 'var(--emerald)' : 'var(--ink-2)',
                    fontWeight: active ? 600 : 400,
                    fontSize: 13,
                    cursor: 'pointer',
                    marginBottom: 2,
                    textAlign: 'left',
                  }}
                >
                  <span style={{ fontSize: 14 }}>{item.icon}</span>
                  {item.label}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      <div style={{ padding: '12px 8px', borderTop: '1px solid var(--parchment-3)' }}>
        <button
          onClick={toggleTheme}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '8px 12px',
            borderRadius: 8,
            border: 'none',
            background: 'transparent',
            color: 'var(--ink-2)',
            fontSize: 13,
            cursor: 'pointer',
          }}
        >
          <span>{theme === 'light' ? '🌙' : '☀️'}</span>
          {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
        </button>
        <button
          onClick={() => router.push('/')}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '8px 12px',
            borderRadius: 8,
            border: 'none',
            background: 'transparent',
            color: 'var(--ink-4)',
            fontSize: 12,
            cursor: 'pointer',
          }}
        >
          ← Back to Home
        </button>
      </div>
    </aside>
  );
}
