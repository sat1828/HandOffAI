'use client';

import { Component, type ReactNode } from 'react';

interface Props { children: ReactNode }
interface State { hasError: boolean }

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: 40, textAlign: 'center', background: 'var(--parchment)' }}>
          <h1 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 40, color: 'var(--critical)', marginBottom: 12 }}>Something went wrong</h1>
          <p style={{ fontSize: 15, color: 'var(--ink-2)', marginBottom: 24 }}>An unexpected error occurred. Please refresh the page.</p>
          <button onClick={() => window.location.reload()} style={{ background: 'var(--emerald)', color: '#fff', border: 'none', borderRadius: 100, padding: '10px 24px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Refresh Page</button>
        </div>
      );
    }
    return this.props.children;
  }
}
