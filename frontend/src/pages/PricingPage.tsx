import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../api/axios';
import { ArrowLeft, Check, Zap, Shield, ArrowRight, Sparkles } from 'lucide-react';

interface Tier {
  id: number; name: string; price: { monthly: number; annual: number } | 'free';
  badge?: string; accent: string; highlighted?: boolean;
  desc: string;
  features: string[];
  notFeatures?: string[];
}

const TIERS: Tier[] = [
  {
    id: 1, name: 'Free', price: 'free', accent: '#94a3b8',
    desc: 'For developers experimenting with AI code generation.',
    features: ['3 workspace projects', '10,000 daily AI tokens', '1 container preview', 'ZIP code export', 'Community support'],
    notFeatures: ['Qdrant RAG vector search', 'Redis rate limiting', 'Kafka event streaming'],
  },
  {
    id: 2, name: 'Pro', price: { monthly: 29, annual: 23 }, accent: '#6366f1',
    badge: 'MOST POPULAR', highlighted: true,
    desc: 'For engineers shipping production-grade applications.',
    features: ['50 workspace projects', '500K monthly AI tokens', '5 concurrent previews', 'Qdrant RAG vector search', 'Redis rate limiting', 'Priority email support'],
    notFeatures: ['Kafka event streaming', 'Zipkin distributed tracing'],
  },
  {
    id: 3, name: 'Enterprise', price: { monthly: 199, annual: 159 }, accent: '#06b6d4',
    desc: 'For teams building at enterprise scale with full observability.',
    features: ['Unlimited workspace projects', 'Unlimited AI generation', '20 concurrent previews', 'Qdrant RAG vector search', 'Redis rate limiting', 'Apache Kafka event streaming', 'Zipkin distributed tracing', 'Custom domain preview', 'SLA guarantee + dedicated support'],
  },
];

const COMPARISON_ROWS = [
  { feature: 'Workspace Projects', free: '3', pro: '50', ent: 'Unlimited' },
  { feature: 'Daily AI Tokens', free: '10,000', pro: '500K / month', ent: 'Unlimited' },
  { feature: 'Container Previews', free: '1', pro: '5 concurrent', ent: '20 concurrent' },
  { feature: 'ZIP Export', free: true, pro: true, ent: true },
  { feature: 'Monaco Code Editor', free: true, pro: true, ent: true },
  { feature: 'Qdrant RAG Search', free: false, pro: true, ent: true },
  { feature: 'Redis Rate Limiting', free: false, pro: true, ent: true },
  { feature: 'Kafka Event Stream', free: false, pro: false, ent: true },
  { feature: 'Zipkin Tracing', free: false, pro: false, ent: true },
  { feature: 'Custom Domain', free: false, pro: false, ent: true },
  { feature: 'Support', free: 'Community', pro: 'Priority email', ent: 'Dedicated SLA' },
];

export const PricingPage: React.FC = () => {
  const navigate = useNavigate();
  const [annual, setAnnual] = useState(false);
  const [loadingId, setLoadingId] = useState<number | null>(null);

  const subscribe = async (tier: Tier) => {
    if (tier.price === 'free') { navigate('/signup'); return; }
    setLoadingId(tier.id);
    try {
      const res = await apiClient.post<{ checkoutUrl: string }>('/api/subscriptions/checkout-session', { planId: tier.id });
      if (res.data.checkoutUrl) window.location.href = res.data.checkoutUrl;
    } catch {
      navigate('/signup');
    } finally {
      setLoadingId(null);
    }
  };

  const getPrice = (tier: Tier) => {
    if (tier.price === 'free') return { display: '$0', sub: 'forever free' };
    const p = annual ? tier.price.annual : tier.price.monthly;
    return { display: `$${p}`, sub: `per month${annual ? ', billed annually' : ''}` };
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', fontFamily: 'var(--font)', color: 'var(--t2)' }}>

      {/* ── NAV ── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(7,9,15,0.85)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border)',
        height: 56, display: 'flex', alignItems: 'center',
        padding: '0 clamp(1rem,4vw,2.5rem)',
        justifyContent: 'space-between',
      }}>
        <button onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: 9, background: 'none', border: 'none', cursor: 'pointer' }}>
          <div style={{ width: 28, height: 28, background: 'linear-gradient(135deg, #6366f1, #06b6d4)', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sparkles size={14} color="#fff" />
          </div>
          <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--t1)' }}>Craftly</span>
        </button>

        <button onClick={() => navigate(-1 as any)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: '1px solid var(--border)', color: 'var(--t2)', padding: '6px 14px', borderRadius: 'var(--r-md)', cursor: 'pointer', fontSize: '0.82rem', fontFamily: 'var(--font)' }}>
          <ArrowLeft size={13} /> Back
        </button>
      </nav>

      {/* ── HEADER ── */}
      <section style={{ padding: 'clamp(60px,10vh,100px) clamp(1rem,4vw,2.5rem) 60px', textAlign: 'center', position: 'relative' }}>
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(99,102,241,0.08) 0%, transparent 70%)',
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-block', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 'var(--r-full)', padding: '5px 14px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', letterSpacing: '0.06em', marginBottom: 20 }}>
            PRICING
          </div>
          <h1 style={{ fontSize: 'clamp(2.2rem,5vw,3.5rem)', fontWeight: 900, letterSpacing: '-0.04em', color: 'var(--t1)', lineHeight: 1.1, marginBottom: 14 }}>
            Start free, scale when ready
          </h1>
          <p style={{ fontSize: '1.05rem', color: 'var(--t2)', marginBottom: 36, maxWidth: 480, margin: '0 auto 36px' }}>
            Every plan includes the core AI workspace. Upgrade for more power, tokens, and enterprise features.
          </p>

          {/* Annual / Monthly toggle */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--r-full)', padding: '5px 6px' }}>
            <button
              onClick={() => setAnnual(false)}
              style={{ padding: '6px 16px', borderRadius: 'var(--r-full)', border: 'none', cursor: 'pointer', fontFamily: 'var(--font)', fontWeight: 600, fontSize: '0.85rem', transition: 'all 0.18s', background: !annual ? 'var(--bg-elevated)' : 'transparent', color: !annual ? 'var(--t1)' : 'var(--t3)' }}
            >Monthly</button>
            <button
              onClick={() => setAnnual(true)}
              style={{ padding: '6px 16px', borderRadius: 'var(--r-full)', border: 'none', cursor: 'pointer', fontFamily: 'var(--font)', fontWeight: 600, fontSize: '0.85rem', transition: 'all 0.18s', background: annual ? 'var(--bg-elevated)' : 'transparent', color: annual ? 'var(--t1)' : 'var(--t3)', display: 'flex', alignItems: 'center', gap: 6 }}
            >
              Annual
              <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#10b981', background: 'rgba(16,185,129,0.12)', padding: '2px 7px', borderRadius: 'var(--r-full)' }}>–20%</span>
            </button>
          </div>
        </div>
      </section>

      {/* ── PRICING CARDS ── */}
      <section style={{ padding: '0 clamp(1rem,4vw,2.5rem) 80px' }}>
        <div style={{ maxWidth: 1040, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
          {TIERS.map(tier => {
            const { display, sub } = getPrice(tier);
            const isLoading = loadingId === tier.id;

            return (
              <div
                key={tier.id}
                style={{
                  background: tier.highlighted
                    ? 'linear-gradient(145deg, rgba(99,102,241,0.08), rgba(6,182,212,0.04))'
                    : 'var(--bg-card)',
                  border: tier.highlighted ? '1px solid rgba(99,102,241,0.3)' : '1px solid var(--border)',
                  borderRadius: 'var(--r-xl)', padding: '32px 28px',
                  display: 'flex', flexDirection: 'column', gap: 8,
                  position: 'relative',
                  boxShadow: tier.highlighted ? '0 0 60px rgba(99,102,241,0.1)' : 'none',
                  transition: 'transform 0.2s',
                }}
                onMouseEnter={e => { if (!tier.highlighted) (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'; }}
              >
                {/* Popular badge */}
                {tier.badge && (
                  <div style={{
                    position: 'absolute', top: -13, left: '50%', transform: 'translateX(-50%)',
                    background: 'linear-gradient(90deg, #6366f1, #06b6d4)',
                    color: '#fff', fontSize: '0.68rem', fontWeight: 700,
                    padding: '4px 16px', borderRadius: 'var(--r-full)', letterSpacing: '0.1em', whiteSpace: 'nowrap',
                  }}>{tier.badge}</div>
                )}

                {/* Plan icon */}
                <div style={{ width: 36, height: 36, borderRadius: 'var(--r-md)', background: tier.accent + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 4 }}>
                  {tier.highlighted ? <Zap size={18} style={{ color: tier.accent }} /> : tier.id === 3 ? <Shield size={18} style={{ color: tier.accent }} /> : <Check size={18} style={{ color: tier.accent }} />}
                </div>

                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: tier.accent, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{tier.name}</div>
                <div style={{ marginTop: 4 }}>
                  <span style={{ fontSize: '2.6rem', fontWeight: 900, color: 'var(--t1)', letterSpacing: '-0.04em' }}>{display}</span>
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--t3)', marginBottom: 12 }}>{sub}</div>
                <p style={{ fontSize: '0.85rem', color: 'var(--t2)', lineHeight: 1.6, marginBottom: 16 }}>{tier.desc}</p>

                {/* Features */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 24 }}>
                  {tier.features.map((f, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: '0.85rem', color: 'var(--t2)' }}>
                      <div style={{ width: 17, height: 17, borderRadius: '50%', background: tier.accent + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                        <Check size={10} style={{ color: tier.accent }} />
                      </div>
                      {f}
                    </div>
                  ))}
                  {tier.notFeatures?.map((f, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: '0.85rem', color: 'var(--t3)', opacity: 0.5 }}>
                      <div style={{ width: 17, height: 17, flexShrink: 0 }} />
                      {f}
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <button
                  onClick={() => subscribe(tier)}
                  disabled={isLoading}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                    background: tier.highlighted ? 'var(--primary)' : 'rgba(255,255,255,0.06)',
                    color: tier.highlighted ? '#fff' : 'var(--t2)',
                    border: tier.highlighted ? 'none' : '1px solid var(--border)',
                    padding: '13px', borderRadius: 'var(--r-md)',
                    fontWeight: 700, fontSize: '0.9rem', cursor: isLoading ? 'wait' : 'pointer',
                    fontFamily: 'var(--font)', transition: 'all 0.18s',
                    boxShadow: tier.highlighted ? '0 0 24px rgba(99,102,241,0.3)' : 'none',
                    opacity: isLoading ? 0.7 : 1,
                  }}
                >
                  {isLoading ? <><div className="spinner" /> Redirecting…</> :
                    tier.price === 'free' ? <>Start for free <ArrowRight size={15} /></> :
                    tier.id === 3 ? <>Contact sales <ArrowRight size={15} /></> :
                    <>Upgrade to {tier.name} <ArrowRight size={15} /></>}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── COMPARISON TABLE ── */}
      <section style={{ padding: '0 clamp(1rem,4vw,2.5rem) 100px' }}>
        <div style={{ maxWidth: 1040, margin: '0 auto' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--t1)', letterSpacing: '-0.025em', marginBottom: 24, textAlign: 'center' }}>
            Full feature comparison
          </h2>

          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--r-xl)', overflow: 'hidden' }}>
            {/* Header row */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border)', padding: '14px 24px', gap: 16 }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Feature</div>
              {['Free', 'Pro', 'Enterprise'].map((h, i) => (
                <div key={h} style={{ fontSize: '0.85rem', fontWeight: 700, color: i === 1 ? 'var(--primary)' : 'var(--t2)', textAlign: 'center' }}>{h}</div>
              ))}
            </div>

            {/* Data rows */}
            {COMPARISON_ROWS.map((row, i) => (
              <div
                key={row.feature}
                style={{
                  display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr',
                  padding: '13px 24px', gap: 16,
                  borderBottom: i < COMPARISON_ROWS.length - 1 ? '1px solid var(--border)' : 'none',
                  background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)',
                  alignItems: 'center',
                }}
              >
                <div style={{ fontSize: '0.85rem', color: 'var(--t2)' }}>{row.feature}</div>
                {([row.free, row.pro, row.ent] as any[]).map((val, j) => (
                  <div key={j} style={{ textAlign: 'center', fontSize: '0.82rem' }}>
                    {typeof val === 'boolean' ? (
                      val
                        ? <Check size={15} style={{ color: j === 1 ? '#6366f1' : 'var(--success)', display: 'inline' }} />
                        : <span style={{ color: 'var(--t3)', fontSize: '1rem', lineHeight: 1 }}>—</span>
                    ) : (
                      <span style={{ color: j === 1 ? '#818cf8' : 'var(--t2)', fontWeight: j === 1 ? 600 : 400 }}>{val}</span>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '28px clamp(1rem,4vw,2.5rem)', textAlign: 'center', fontSize: '0.8rem', color: 'var(--t3)' }}>
        All plans include SSL, 99.9% uptime SLA on Render, and automatic GitHub deploys via Vercel.
        Questions? <a href="mailto:subodh@craftly.ai" style={{ color: 'var(--primary)' }}>Contact us</a>
      </footer>
    </div>
  );
};
