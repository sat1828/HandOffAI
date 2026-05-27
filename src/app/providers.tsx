'use client';

import { useEffect } from 'react';
import { useThemeStore } from '@/store/themeStore';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { SessionProvider } from 'next-auth/react';
import { useSocket } from '@/lib/useSocket';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30000, retry: 1 },
  },
});

function SocketInit() {
  useSocket();
  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const { theme } = useThemeStore();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <SocketInit />
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'var(--white)',
              color: 'var(--ink)',
              border: '1px solid var(--parchment-3)',
              borderRadius: '12px',
              fontSize: '14px',
            },
          }}
        />
      </QueryClientProvider>
    </SessionProvider>
  );
}
