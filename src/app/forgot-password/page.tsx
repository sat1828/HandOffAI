'use client';

import { useState } from 'react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong');
      setSent(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--parchment)', padding: 24 }}>
      <div className="glass" style={{ width: 420, padding: 40 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <span style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 28, color: 'var(--emerald)', fontWeight: 600 }}>HandOffAI</span>
          {!sent ? (
            <p style={{ fontSize: 13, color: 'var(--ink-3)', marginTop: 8 }}>Reset your password</p>
          ) : (
            <p style={{ fontSize: 13, color: 'var(--emerald)', marginTop: 8 }}>Check your email</p>
          )}
        </div>

        {sent ? (
          <div style={{ textAlign: 'center' }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--emerald)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 16 }}>
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="M22 4l-10 8L2 4" />
            </svg>
            <p style={{ fontSize: 14, color: 'var(--ink-2)', marginBottom: 8 }}>
              We&apos;ve sent a password reset link to <strong>{email}</strong>
            </p>
            <p style={{ fontSize: 12, color: 'var(--ink-4)', marginBottom: 20 }}>
              Check your inbox and follow the instructions to reset your password.
            </p>
            <button
              onClick={() => window.location.href = '/login'}
              style={{
                width: '100%', padding: '12px',
                background: 'var(--emerald)', color: '#fff', border: 'none', borderRadius: 12,
                fontSize: 14, fontWeight: 600, cursor: 'pointer',
              }}
            >
              Back to Sign In
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-2)', display: 'block', marginBottom: 6 }}>Email</label>
              <input
                type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="you@hospital.com" required style={{ width: '100%' }}
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
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        )}

        <div style={{ marginTop: 20, textAlign: 'center' }}>
          <span style={{ fontSize: 13, color: 'var(--ink-3)' }}>Remember your password? </span>
          <button
            onClick={() => window.location.href = '/login'}
            style={{ fontSize: 13, color: 'var(--emerald)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
          >
            Sign in
          </button>
        </div>

        <div style={{ marginTop: 16, textAlign: 'center' }}>
          <button
            onClick={() => window.location.href = '/'}
            style={{ fontSize: 12, color: 'var(--ink-3)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
