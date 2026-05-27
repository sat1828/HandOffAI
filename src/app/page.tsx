'use client';

import { useEffect, useState, useRef } from 'react';
import { useThemeStore } from '@/store/themeStore';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const { theme, toggleTheme } = useThemeStore();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const heroCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => {
      const winScroll = document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - window.innerHeight;
      if (height <= 0) return;
      setScrolled((winScroll / height) * 100);
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (heroCardRef.current) {
        const rect = heroCardRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        setMousePos({ x: x * 12, y: y * -8 });
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.12 }
    );
    document.querySelectorAll('.fade-up').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <div className="scroll-progress" style={{ width: `${scrolled}%` }} />
      <div className="noise-overlay" />

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50" style={{ background: 'var(--glass)', backdropFilter: 'blur(20px) saturate(1.4)', borderBottom: '1px solid var(--glass-border)' }}>
        <div className="flex items-center justify-between px-8 py-4" style={{ maxWidth: 1280, margin: '0 auto' }}>
          <span style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 24, color: 'var(--emerald)', fontWeight: 600 }}>HandOffAI</span>
          <div className="flex items-center gap-6">
            <a href="#how-it-works" style={{ fontSize: 13, color: 'var(--ink-2)', textDecoration: 'none' }}>How It Works</a>
            <a href="#features" style={{ fontSize: 13, color: 'var(--ink-2)', textDecoration: 'none' }}>Features</a>
            <a href="#pricing" style={{ fontSize: 13, color: 'var(--ink-2)', textDecoration: 'none' }}>Pricing</a>
            <a href="#compliance" style={{ fontSize: 13, color: 'var(--ink-2)', textDecoration: 'none' }}>Compliance</a>
            <button onClick={toggleTheme} style={{ background: 'var(--parchment-2)', border: 'none', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', fontSize: 16 }}>{theme === 'light' ? '🌙' : '☀️'}</button>
            <button onClick={() => router.push('/login')} style={{ fontSize: 13, color: 'var(--ink)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}>Sign In</button>
            <button onClick={() => router.push('/login')} style={{ fontSize: 13, background: 'var(--emerald)', color: '#fff', border: 'none', borderRadius: 100, padding: '8px 20px', fontWeight: 600, cursor: 'pointer' }}>Request Demo</button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', paddingTop: 80, position: 'relative', overflow: 'hidden' }}>
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 40px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center' }}>
          <div>
            <h1 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 72, letterSpacing: '-0.03em', lineHeight: 1.02, color: 'var(--ink)', marginBottom: 24 }}>
              The last handoff a hospital ever gets wrong.
            </h1>
            <p style={{ fontSize: 18, color: 'var(--ink-2)', lineHeight: 1.7, marginBottom: 32, maxWidth: 520 }}>
              Every shift change, critical information falls through the cracks. HandOffAI listens, extracts, and reconciles spoken handoffs against the EHR — in under 90 seconds.
            </p>
            <div className="flex items-center gap-4" style={{ marginBottom: 40 }}>
              <button onClick={() => router.push('/dashboard')} style={{ background: 'var(--emerald)', color: '#fff', border: 'none', borderRadius: 100, padding: '12px 28px', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>
                ▶ Watch Live Demo
              </button>
              <button onClick={() => router.push('/login')} style={{ background: 'transparent', color: 'var(--ink)', border: '1px solid var(--parchment-3)', borderRadius: 100, padding: '12px 28px', fontSize: 15, fontWeight: 500, cursor: 'pointer' }}>
                Start Free Trial
              </button>
            </div>
            <div className="flex items-center gap-8">
              <div><span style={{ fontSize: 28, fontWeight: 700, color: 'var(--critical)' }}>70%</span><p style={{ fontSize: 12, color: 'var(--ink-3)', margin: 0 }}>sentinel events linked to poor handoffs</p></div>
              <div><span style={{ fontSize: 28, fontWeight: 700, color: 'var(--emerald)' }}>3×</span><p style={{ fontSize: 12, color: 'var(--ink-3)', margin: 0 }}>faster shift transitions</p></div>
              <div><span style={{ fontSize: 28, fontWeight: 700, color: 'var(--info)' }}>$2.1B</span><p style={{ fontSize: 12, color: 'var(--ink-3)', margin: 0 }}>global clinical comms market</p></div>
            </div>
          </div>
          <div
            ref={heroCardRef}
            className="glass"
            style={{
              padding: 32,
              transform: `perspective(1200px) rotateY(${mousePos.x}deg) rotateX(${mousePos.y}deg)`,
              transition: 'transform 0.1s ease-out',
            }}
          >
            <div className="flex items-center justify-between" style={{ marginBottom: 24 }}>
              <span className="mono" style={{ color: 'var(--emerald)', fontWeight: 600 }}>ICU — Priority Queue</span>
              <span className="live-dot" />
            </div>
            {[
              { name: 'Robert Chen', bed: 'ICU-01', severity: 'Critical', acuity: 1, flags: 3, diagnosis: 'Septic shock' },
              { name: 'Sarah Okafor', bed: 'ICU-02', severity: 'Critical', acuity: 1, flags: 1, diagnosis: 'ARDS' },
              { name: 'James Mitchell', bed: 'ICU-03', severity: 'Critical', acuity: 1, flags: 2, diagnosis: 'Cardiogenic shock' },
              { name: 'Patricia Kowalski', bed: 'ICU-04', severity: 'High', acuity: 2, flags: 1, diagnosis: 'Stroke' },
            ].map((p, i) => (
              <div key={i} className={`severity-${p.acuity}`} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', marginBottom: 6, borderRadius: 8, background: 'var(--parchment-2)' }}>
                <div className="avatar-circle" style={{ background: 'var(--critical-light)', color: 'var(--critical)' }}>{p.name.split(' ').map(n => n[0]).join('')}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>{p.bed} — {p.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>{p.diagnosis}</div>
                </div>
                <span className="badge badge-critical">{p.severity}</span>
                <span className="badge badge-warning">{p.flags} flags</span>
              </div>
            ))}
            <div style={{ marginTop: 20, padding: '12px 16px', background: 'var(--critical-light)', borderRadius: 12, borderLeft: '3px solid var(--critical)' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--critical)', marginBottom: 2 }}>⚠️ 6 unresolved flags</div>
              <div style={{ fontSize: 11, color: 'var(--ink-2)' }}>3 critical, 2 warnings, 1 info — resolve before next round</div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="fade-up" style={{ padding: '120px 40px', background: 'var(--parchment-2)' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto' }}>
          <h2 style={{ fontSize: 48, textAlign: 'center', marginBottom: 60, color: 'var(--ink)' }}>The handoff problem is measured in lives.</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32 }}>
            {[
              { stat: '70%', desc: 'of sentinel events are traced to miscommunication during handoffs', source: 'The Joint Commission' },
              { stat: '4×', desc: 'increased risk of adverse events when handoffs omit critical data', source: 'AHRQ Research' },
              { stat: '50%', desc: 'of documentation burden is created by unstructured verbal handoffs', source: 'NEJM Catalyst' },
            ].map((item, i) => (
              <div className="card" key={i}>
                <span style={{ fontSize: 64, fontWeight: 700, color: 'var(--critical)', fontFamily: "'Instrument Serif', Georgia, serif", display: 'block', marginBottom: 12 }}>{item.stat}</span>
                <p style={{ fontSize: 15, color: 'var(--ink-2)', lineHeight: 1.6, marginBottom: 12 }}>{item.desc}</p>
                <span style={{ fontSize: 11, color: 'var(--ink-3)', fontStyle: 'italic' }}>— {item.source}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="fade-up" style={{ padding: '120px 40px' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto' }}>
          <h2 style={{ fontSize: 48, textAlign: 'center', marginBottom: 16, color: 'var(--ink)' }}>From spoken word to structured note in 90 seconds.</h2>
          <p style={{ fontSize: 16, textAlign: 'center', color: 'var(--ink-3)', marginBottom: 60, maxWidth: 600, marginLeft: 'auto', marginRight: 'auto' }}>
            Four steps. One seamless handoff. Zero information lost.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }}>
            {[
              { step: '01', title: 'Capture', desc: 'Clinician speaks naturally. Web Speech API or Whisper v3 transcribes with medical vocabulary.', pill: 'Whisper v3' },
              { step: '02', title: 'Extract', desc: 'Claude NLP extracts 40+ clinical fields — vitals, meds, labs, actions, code status.', pill: 'Claude 3.5' },
              { step: '03', title: 'Reconcile', desc: 'Extracted data cross-referenced against live EHR via FHIR. Discrepancies surfaced as flags.', pill: 'FHIR R4' },
              { step: '04', title: 'Score', desc: 'Severity scoring model ranks incoming patients. Incoming clinician gets a prioritized queue.', pill: 'Severity AI' },
            ].map((item, i) => (
              <div className="card" key={i} style={{ textAlign: 'center' }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--emerald-light)', color: 'var(--emerald)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontWeight: 700, fontSize: 16 }}>{item.step}</div>
                <h3 style={{ fontSize: 20, fontFamily: "'Instrument Serif', Georgia, serif", color: 'var(--ink)', marginBottom: 8 }}>{item.title}</h3>
                <p style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.6, marginBottom: 12 }}>{item.desc}</p>
                <span className="badge badge-emerald" style={{ fontSize: 10 }}>{item.pill}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="fade-up" style={{ padding: '120px 40px', background: 'var(--parchment-2)' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto' }}>
          <h2 style={{ fontSize: 48, textAlign: 'center', marginBottom: 60, color: 'var(--ink)' }}>Built for clinical reality.</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            {[
              { title: 'Real-Time Extraction', desc: 'Voice-to-text streams as the clinician speaks. Structured fields populate instantly on screen. Zero latency.', icon: '🎙️' },
              { title: 'EHR Discrepancy Detection', desc: 'Automatically compares what was said against live FHIR records. Flags medication mismatches, missing labs, code status changes.', icon: '🔍' },
              { title: 'Severity Scoring & Triage', desc: 'Each patient scored on a 5-level acuity scale. Incoming clinicians see a ranked, actionable queue — not a firehose.', icon: '📊' },
              { title: 'Analytics & Learning', desc: 'Ward-level quality trends, clinician performance, extraction accuracy. Continuous improvement built in.', icon: '📈' },
            ].map((f, i) => (
              <div className="card" key={i} style={{ display: 'flex', gap: 20 }}>
                <span style={{ fontSize: 32 }}>{f.icon}</span>
                <div>
                  <h3 style={{ fontSize: 18, fontFamily: "'Instrument Serif', Georgia, serif", color: 'var(--ink)', marginBottom: 6 }}>{f.title}</h3>
                  <p style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.7 }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Compliance */}
      <section id="compliance" className="fade-up" style={{ padding: '120px 40px' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto' }}>
          <h2 style={{ fontSize: 48, textAlign: 'center', marginBottom: 16, color: 'var(--ink)' }}>Enterprise-grade security. Hospital-ready compliance.</h2>
          <p style={{ fontSize: 16, textAlign: 'center', color: 'var(--ink-3)', marginBottom: 60 }}>HIPAA, SOC 2, FHIR R4, HITRUST — we checked every box.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }}>
            {[
              { name: 'HIPAA', desc: 'BAAs signed. AES-256 encrypted. TLS 1.3 in transit.' },
              { name: 'SOC 2 Type II', desc: 'Annual audits. Controls for security, availability, confidentiality.' },
              { name: 'FHIR R4', desc: 'SMART on FHIR certified. Epic and Cerner compatible.' },
              { name: 'HITRUST CSF v11', desc: 'Risk management framework. Complete control mapping.' },
            ].map((c, i) => (
              <div className="card" key={i} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--emerald)', marginBottom: 8 }}>{c.name}</div>
                <p style={{ fontSize: 12, color: 'var(--ink-3)', lineHeight: 1.6 }}>{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Metrics Band */}
      <div className="fade-up" style={{ padding: '80px 40px', background: 'var(--emerald)' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 32, textAlign: 'center' }}>
          {[
            { value: '94%', label: 'field completion rate' },
            { value: '−67%', label: 'missed flags reduced' },
            { value: '3.4×', label: 'faster handoffs' },
            { value: '89%', label: 'clinician satisfaction' },
          ].map((m, i) => (
            <div key={i}>
              <div style={{ fontSize: 40, fontWeight: 700, color: '#fff', fontFamily: "'Instrument Serif', Georgia, serif" }}>{m.value}</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>{m.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Pricing */}
      <section id="pricing" className="fade-up" style={{ padding: '120px 40px' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto' }}>
          <h2 style={{ fontSize: 48, textAlign: 'center', marginBottom: 60, color: 'var(--ink)' }}>Pricing that scales with your hospital.</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, alignItems: 'stretch' }}>
            {[
              { name: 'Pilot', price: '$1,200', unit: '/ward/mo', desc: 'For single-ward evaluation', features: ['Up to 12 beds', '3 clinicians', 'Core extraction', 'Email support', '30-day trial'], featured: false },
              { name: 'Hospital', price: '$890', unit: '/ward/mo', desc: 'For multi-ward deployment', features: ['Unlimited beds', 'Unlimited clinicians', 'EHR integration', 'Real-time analytics', 'Priority support', 'API access'], featured: true },
              { name: 'Health System', price: 'Custom', unit: '', desc: 'For enterprise health systems', features: ['All Hospital features', 'Custom integrations', 'Dedicated success manager', 'On-premise option', 'SLA guarantee', 'Custom ML models'], featured: false },
            ].map((plan, i) => (
              <div key={i} className="card" style={{
                display: 'flex',
                flexDirection: 'column',
                border: plan.featured ? '2px solid var(--emerald)' : '1px solid var(--parchment-3)',
                position: 'relative',
                transform: plan.featured ? 'scale(1.03)' : 'none',
              }}>
                {plan.featured && <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: 'var(--emerald)', color: '#fff', fontSize: 11, fontWeight: 600, padding: '3px 14px', borderRadius: 100 }}>Most Popular</div>}
                <h3 style={{ fontSize: 22, fontFamily: "'Instrument Serif', Georgia, serif", color: 'var(--ink)', marginBottom: 4 }}>{plan.name}</h3>
                <div style={{ fontSize: 40, fontWeight: 700, color: 'var(--ink)', fontFamily: "'Instrument Serif', Georgia, serif" }}>{plan.price}<span style={{ fontSize: 14, color: 'var(--ink-3)', fontWeight: 400 }}>{plan.unit}</span></div>
                <p style={{ fontSize: 13, color: 'var(--ink-3)', margin: '8px 0 20px' }}>{plan.desc}</p>
                <div style={{ flex: 1 }}>{plan.features.map((f, j) => <div key={j} style={{ fontSize: 13, color: 'var(--ink-2)', padding: '6px 0', borderBottom: '1px solid var(--parchment-3)' }}>✓ {f}</div>)}</div>
                <button onClick={() => router.push('/login')} style={{
                  marginTop: 24,
                  padding: '12px',
                  borderRadius: 100,
                  border: plan.featured ? 'none' : '1px solid var(--parchment-3)',
                  background: plan.featured ? 'var(--emerald)' : 'transparent',
                  color: plan.featured ? '#fff' : 'var(--ink)',
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: 'pointer',
                }}>Get Started</button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="fade-up" style={{ padding: '120px 40px', textAlign: 'center', background: 'var(--parchment-2)' }}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <h2 style={{ fontSize: 48, color: 'var(--ink)', marginBottom: 16 }}>Every shift change is a chance to save someone.</h2>
          <p style={{ fontSize: 15, color: 'var(--ink-3)', marginBottom: 32 }}>HIPAA-compliant. FHIR-integrated. Production-ready.
          <br />Start with a free 30-day pilot for one ward.</p>
          <div className="flex items-center justify-center gap-4">
            <button onClick={() => router.push('/login')} style={{ background: 'var(--emerald)', color: '#fff', border: 'none', borderRadius: 100, padding: '14px 32px', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>Start Free Trial</button>
            <button style={{ background: 'transparent', color: 'var(--ink)', border: '1px solid var(--parchment-3)', borderRadius: 100, padding: '14px 32px', fontSize: 15, fontWeight: 500, cursor: 'pointer' }}>Talk to Sales</button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '60px 40px 40px', borderTop: '1px solid var(--parchment-3)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 40 }}>
          <div>
            <span style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 22, color: 'var(--emerald)', fontWeight: 600 }}>HandOffAI</span>
            <p style={{ fontSize: 13, color: 'var(--ink-3)', marginTop: 12, lineHeight: 1.7 }}>Closing the gap where patients fall through. Clinical handoff intelligence for modern hospitals.</p>
          </div>
          <div><h4 style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Product</h4>{['Features', 'Pricing', 'API', 'Integrations'].map(l => <div key={l} style={{ fontSize: 13, color: 'var(--ink-3)', marginBottom: 8 }}>{l}</div>)}</div>
          <div><h4 style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Clinical</h4>{['Documentation', 'Research', 'Compliance', 'Case Studies'].map(l => <div key={l} style={{ fontSize: 13, color: 'var(--ink-3)', marginBottom: 8 }}>{l}</div>)}</div>
          <div><h4 style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Company</h4>{['About', 'Blog', 'Careers', 'Contact'].map(l => <div key={l} style={{ fontSize: 13, color: 'var(--ink-3)', marginBottom: 8 }}>{l}</div>)}</div>
        </div>
        <div style={{ maxWidth: 1280, margin: '40px auto 0', paddingTop: 24, borderTop: '1px solid var(--parchment-3)', fontSize: 12, color: 'var(--ink-4)', textAlign: 'center' }}>
          © 2026 HandOffAI. HIPAA-compliant. All rights reserved.
        </div>
      </footer>
    </>
  );
}
