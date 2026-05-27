'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { useAppStore } from '@/store/appStore';

export default function AppShell({ children, title, subtitle }: { children: React.ReactNode; title: string; subtitle?: string }) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const setUser = useAppStore((s) => s.setUser);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user) {
      const u = session.user as any;
      setUser({
        id: u.id || '',
        name: u.name || '',
        email: u.email || '',
        role: (u.role || 'CLINICIAN') as 'ADMIN' | 'CLINICIAN' | 'VIEWER' | 'AUDITOR',
        avatar: u.image || undefined,
      });
    }
  }, [session, setUser]);

  if (status === 'loading') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--parchment)' }}>
        <div className="skeleton" style={{ width: 32, height: 32, borderRadius: '50%' }} />
      </div>
    );
  }

  if (status === 'unauthenticated') return null;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--parchment)' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Topbar title={title} subtitle={subtitle} />
        <main style={{ flex: 1, padding: 24, overflowY: 'auto' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
