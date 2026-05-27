'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';

function ResetForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (password !== confirm) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Reset failed');
      toast.success('Password reset successfully!');
      router.push('/login?reset=1');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: 14, color: 'var(--critical)', marginBottom: 20 }}>Invalid reset link. No token provided.</p>
        <button
          onClick={() => router.push('/forgot-password')}
          style={{
            width: '100%', padding: '12px',
            background: 'var(--emerald)', color: '#fff', border: 'none', borderRadius: 12,
            fontSize: 14, fontWeight: 600, cursor: 'pointer',
          }}
        >
          Request New Reset Link
        </button>
      </div>
    );
  }

  return (
    <>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <span style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 28, color: 'var(--emerald)', fontWeight: 600 }}>HandOffAI</span>
        <p style={{ fontSize: 13, color: 'var(--ink-3)', marginTop: 8 }}>Set a new password</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-2)', display: 'block', marginBottom: 6 }}>New Password</label>
          <input
            type="password" value={password} onChange={(e) => setPassword(e.target.value)}
            placeholder="Min. 8 characters" required minLength={8} style={{ width: '100%' }}
          />
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-2)', display: 'block', marginBottom: 6 }}>Confirm Password</label>
          <input
            type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)}
            placeholder="Repeat your password" required style={{ width: '100%' }}
          />
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
          {loading ? 'Resetting...' : 'Reset Password'}
        </button>
      </form>

      <div style={{ marginTop: 20, textAlign: 'center' }}>
        <button
          onClick={() => router.push('/login')}
          style={{ fontSize: 13, color: 'var(--emerald)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
        >
          Back to Sign In
        </button>
      </div>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--parchment)', padding: 24 }}>
      <div className="glass" style={{ width: 420, padding: 40 }}>
        <Suspense fallback={<div style={{ textAlign: 'center', padding: 40, fontSize: 14, color: 'var(--ink-3)' }}>Loading...</div>}>
          <ResetForm />
        </Suspense>
      </div>
    </div>
  );
}
