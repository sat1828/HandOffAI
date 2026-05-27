'use client';

import { useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export function useSocket() {
  const { data: session } = useSession();
  const router = useRouter();
  const esRef = useRef<EventSource | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!session?.user?.id) return;

    let delay = 1000;

    function connect() {
      if (esRef.current) esRef.current.close();

      const es = new EventSource('/api/socket');
      esRef.current = es;

      es.addEventListener('notification', (e: MessageEvent) => {
        try {
          const data = JSON.parse(e.data);
          toast.custom(
            (t) => (
              <div
                onClick={() => {
                  if (data.link) router.push(data.link);
                  toast.dismiss(t.id);
                }}
                style={{
                  background: 'rgba(255,255,255,0.85)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid var(--parchment-3)',
                  borderRadius: 12,
                  padding: '12px 16px',
                  cursor: data.link ? 'pointer' : 'default',
                  boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
                  maxWidth: 360,
                }}
              >
                <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--ink)' }}>
                  {data.title}
                </div>
                <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2 }}>
                  {data.message}
                </div>
              </div>
            ),
            { duration: 5000 },
          );
        } catch {
          /* ignore parse errors */
        }
      });

      es.onerror = () => {
        es.close();
        timerRef.current = setTimeout(connect, delay);
        delay = Math.min(delay * 2, 30000);
      };
    }

    connect();

    return () => {
      if (esRef.current) esRef.current.close();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [session?.user?.id, router]);
}
