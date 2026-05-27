'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

function getStrength(pw: string): { label: string; score: number } {
  if (pw.length < 8) return { label: 'Weak', score: 20 };
  let score = 0;
  if (/[a-z]/.test(pw)) score += 25;
  if (/[A-Z]/.test(pw)) score += 25;
  if (/[0-9]/.test(pw)) score += 25;
  if (/[^a-zA-Z0-9]/.test(pw)) score += 25;
  const label = score <= 25 ? 'Weak' : score <= 50 ? 'Medium' : 'Strong';
  return { label, score };
}

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const strength = getStrength(password);

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
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');
      toast.success('Account created! Please verify your email.');
      router.push('/login?registered=1');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const barColor =
    strength.label === 'Weak' ? 'var(--critical)' :
    strength.label === 'Medium' ? 'var(--warning)' : 'var(--emerald)';

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--parchment)', padding: 24 }}>
      <div className="glass" style={{ width: 420, padding: 40 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <span style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 28, color: 'var(--emerald)', fontWeight: 600 }}>HandOffAI</span>
          <p style={{ fontSize: 13, color: 'var(--ink-3)', marginTop: 8 }}>Create your account</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-2)', display: 'block', marginBottom: 6 }}>Full Name</label>
            <input
              type="text" value={name} onChange={(e) => setName(e.target.value)}
              placeholder="Dr. Jane Smith" required style={{ width: '100%' }}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-2)', display: 'block', marginBottom: 6 }}>Email</label>
            <input
              type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="you@hospital.com" required style={{ width: '100%' }}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-2)', display: 'block', marginBottom: 6 }}>Password</label>
            <input
              type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 8 characters" required minLength={8} style={{ width: '100%' }}
            />
            {password && (
              <div style={{ marginTop: 8 }}>
                <div style={{ height: 4, background: 'var(--parchment-3)', borderRadius: 2, overflow: 'hidden', marginBottom: 4 }}>
                  <div style={{ height: '100%', width: `${strength.score}%`, borderRadius: 2, background: barColor, transition: 'width 0.2s ease' }} />
                </div>
                <span style={{ fontSize: 11, color: barColor, fontWeight: 600 }}>{strength.label}</span>
              </div>
            )}
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
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div style={{ marginTop: 20, textAlign: 'center' }}>
          <span style={{ fontSize: 13, color: 'var(--ink-3)' }}>Already have an account? </span>
          <button
            onClick={() => router.push('/login')}
            style={{ fontSize: 13, color: 'var(--emerald)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
          >
            Sign in
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
