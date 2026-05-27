'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error === 'EMAIL_NOT_VERIFIED') {
        setError('Please verify your email before signing in. Check your inbox.');
        return;
      }

      if (result?.error || !result?.ok) {
        throw new Error('Invalid email or password');
      }

      toast.success('Welcome back');
      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    signIn('google', { callbackUrl: '/dashboard' });
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--parchment)', padding: 24 }}>
      <div className="glass" style={{ width: 420, padding: 40 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <span style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 28, color: 'var(--emerald)', fontWeight: 600 }}>HandOffAI</span>
          <p style={{ fontSize: 13, color: 'var(--ink-3)', marginTop: 8 }}>Sign in to your account</p>
        </div>

        <button
          onClick={handleGoogleLogin}
          style={{
            width: '100%', padding: '10px', background: 'var(--white)', color: 'var(--ink)',
            border: '1px solid var(--parchment-3)', borderRadius: 12, fontSize: 14, fontWeight: 500,
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 16,
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
          Continue with Google
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div style={{ flex: 1, height: 1, background: 'var(--parchment-3)' }} />
          <span style={{ fontSize: 12, color: 'var(--ink-4)' }}>or</span>
          <div style={{ flex: 1, height: 1, background: 'var(--parchment-3)' }} />
        </div>

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-2)', display: 'block', marginBottom: 6 }}>Email</label>
            <input
              type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="you@hospital.com" required style={{ width: '100%' }}
            />
          </div>
          <div style={{ marginBottom: 8 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-2)', display: 'block', marginBottom: 6 }}>Password</label>
            <input
              type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password" required style={{ width: '100%' }}
            />
          </div>

          <div style={{ textAlign: 'right', marginBottom: 20 }}>
            <button
              type="button" onClick={() => router.push('/forgot-password')}
              style={{ fontSize: 12, color: 'var(--emerald)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}
            >
              Forgot password?
            </button>
          </div>

          {error && (
            <div style={{ fontSize: 12, color: 'var(--critical)', marginBottom: 12, padding: '8px 12px', background: 'var(--critical-light)', borderRadius: 8 }}>
              {error}
            </div>
          )}

          <button
            type="submit" disabled={loading}
            style={{
              width: '100%', padding: '12px',
              background: loading ? 'var(--ink-4)' : 'var(--emerald)',
              color: '#fff', border: 'none', borderRadius: 12,
              fontSize: 14, fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div style={{ marginTop: 20, textAlign: 'center' }}>
          <span style={{ fontSize: 13, color: 'var(--ink-3)' }}>Don&apos;t have an account? </span>
          <button
            onClick={() => router.push('/register')}
            style={{ fontSize: 13, color: 'var(--emerald)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
          >
            Create account
          </button>
        </div>

        <div style={{ marginTop: 16, textAlign: 'center' }}>
          <button
            onClick={() => router.push('/')}
            style={{ fontSize: 12, color: 'var(--ink-3)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
