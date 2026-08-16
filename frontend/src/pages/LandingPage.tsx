import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles, ArrowRight, Code2, Zap, Shield,
  Play, Check, MessageSquare, Layers,
  FileCode, ChevronRight, Plus, Terminal,
  Globe, Box, Activity, ExternalLink
} from 'lucide-react';

/* ─────────────────────────────────────────────
   PROMPT ROTATOR
───────────────────────────────────────────── */
const EXAMPLE_PROMPTS = [
  'Build a SaaS dashboard with Stripe billing and user auth',
  'Create a real-time chat app with WebSocket and PostgreSQL',
  'Generate a REST API with Spring Boot, JWT, and MinIO storage',
  'Design an e-commerce platform with cart, checkout, and inventory',
];

function useTypingEffect(texts: string[], speed = 38, pause = 2400) {
  const [idx, setIdx] = useState(0);
  const [display, setDisplay] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = texts[idx];
    let timer: ReturnType<typeof setTimeout>;
    if (!deleting && display.length < current.length) {
      timer = setTimeout(() => setDisplay(current.slice(0, display.length + 1)), speed);
    } else if (!deleting && display.length === current.length) {
      timer = setTimeout(() => setDeleting(true), pause);
    } else if (deleting && display.length > 0) {
      timer = setTimeout(() => setDisplay(display.slice(0, -1)), speed / 2.5);
    } else {
      setDeleting(false);
      setIdx((i) => (i + 1) % texts.length);
    }
    return () => clearTimeout(timer);
  }, [display, deleting, idx, texts, speed, pause]);

  return display;
}

/* ─────────────────────────────────────────────
   FEATURE BENTO CARD
───────────────────────────────────────────── */
interface BentoCardProps {
  icon: React.ReactNode;
  label: string;
  title: string;
  desc: string;
  accent: string;
  wide?: boolean;
  preview?: React.ReactNode;
}

const BentoCard: React.FC<BentoCardProps> = ({ icon, label, title, desc, accent, wide, preview }) => (
  <div style={{
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--r-xl)',
    padding: '28px',
    gridColumn: wide ? 'span 2' : 'span 1',
    display: 'flex', flexDirection: 'column', gap: '16px',
    position: 'relative', overflow: 'hidden',
    transition: 'border-color 0.2s, transform 0.2s',
    cursor: 'default',
  }}
    onMouseEnter={e => {
      (e.currentTarget as HTMLDivElement).style.borderColor = accent + '50';
      (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-3px)';
    }}
    onMouseLeave={e => {
      (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)';
      (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
    }}
  >
    {/* Glow blob */}
    <div style={{
      position: 'absolute', top: '-40px', right: '-40px',
      width: '180px', height: '180px', borderRadius: '50%',
      background: `radial-gradient(circle, ${accent}18 0%, transparent 70%)`,
      pointerEvents: 'none',
    }} />

    <div style={{
      width: 40, height: 40, borderRadius: 'var(--r-md)',
      background: accent + '18',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: accent, flexShrink: 0,
    }}>
      {icon}
    </div>

    <div>
      <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: accent, marginBottom: 8 }}>{label}</div>
      <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--t1)', marginBottom: 8, lineHeight: 1.3 }}>{title}</h3>
      <p style={{ fontSize: '0.875rem', color: 'var(--t3)', lineHeight: 1.65 }}>{desc}</p>
    </div>

    {preview && (
      <div style={{ marginTop: 'auto', paddingTop: 16, borderTop: '1px solid var(--border)' }}>
        {preview}
      </div>
    )}
  </div>
);

/* ─────────────────────────────────────────────
   STEP CARD
───────────────────────────────────────────── */
const StepCard: React.FC<{ num: string; title: string; desc: string; accent: string }> = ({ num, title, desc, accent }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: '32px 28px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--r-xl)', position: 'relative' }}>
    <div style={{ fontSize: '3.5rem', fontWeight: 900, fontFamily: 'var(--mono)', color: 'var(--border-hover)', lineHeight: 1 }}>{num}</div>
    <div>
      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--t1)', marginBottom: 8 }}>{title}</h3>
      <p style={{ fontSize: '0.875rem', color: 'var(--t3)', lineHeight: 1.65 }}>{desc}</p>
    </div>
    <div style={{ width: 32, height: 3, borderRadius: 99, background: accent }} />
  </div>
);

/* ─────────────────────────────────────────────
   PRICING CARD
───────────────────────────────────────────── */
interface PricingTierProps {
  name: string; price: string; period?: string;
  desc: string; features: string[]; accent: string;
  highlighted?: boolean; cta: string; onCta: () => void;
}
const PricingTier: React.FC<PricingTierProps> = ({ name, price, period, desc, features, accent, highlighted, cta, onCta }) => (
  <div style={{
    background: highlighted ? 'linear-gradient(145deg, rgba(99,102,241,0.1), rgba(6,182,212,0.05))' : 'var(--bg-card)',
    border: highlighted ? '1px solid rgba(99,102,241,0.35)' : '1px solid var(--border)',
    borderRadius: 'var(--r-xl)', padding: '32px 28px',
    display: 'flex', flexDirection: 'column', gap: 6, position: 'relative',
    boxShadow: highlighted ? '0 0 40px rgba(99,102,241,0.1)' : 'none',
  }}>
    {highlighted && (
      <div style={{
        position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)',
        background: 'linear-gradient(90deg, var(--primary), var(--accent))',
        color: '#fff', fontSize: '0.7rem', fontWeight: 700,
        padding: '4px 16px', borderRadius: 'var(--r-full)', letterSpacing: '0.1em',
        whiteSpace: 'nowrap',
      }}>MOST POPULAR</div>
    )}

    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: accent, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{name}</div>
    <div style={{ marginTop: 8, marginBottom: 4 }}>
      <span style={{ fontSize: '2.6rem', fontWeight: 800, color: 'var(--t1)', letterSpacing: '-0.04em' }}>{price}</span>
      {period && <span style={{ fontSize: '0.9rem', color: 'var(--t3)', marginLeft: 4 }}>{period}</span>}
    </div>
    <p style={{ fontSize: '0.875rem', color: 'var(--t3)', marginBottom: 20 }}>{desc}</p>

    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1, marginBottom: 24 }}>
      {features.map((f, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.875rem', color: 'var(--t2)' }}>
          <div style={{ width: 18, height: 18, borderRadius: '50%', background: accent + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Check size={11} color={accent} />
          </div>
          {f}
        </div>
      ))}
    </div>

    <button
      onClick={onCta}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        background: highlighted ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
        color: highlighted ? '#fff' : 'var(--t2)',
        border: highlighted ? 'none' : '1px solid var(--border)',
        padding: '12px', borderRadius: 'var(--r-md)',
        fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer',
        fontFamily: 'var(--font)',
        transition: 'all 0.18s',
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '0.85'; (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '1'; (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)'; }}
    >
      {cta} <ArrowRight size={15} />
    </button>
  </div>
);

/* ─────────────────────────────────────────────
   MAIN LANDING PAGE
───────────────────────────────────────────── */
export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [promptVal, setPromptVal] = useState('');
  const [focused, setFocused] = useState(false);
  const typedPrompt = useTypingEffect(EXAMPLE_PROMPTS);

  const handleGenerate = useCallback(() => {
    if (promptVal.trim()) localStorage.setItem('craftly_initial_prompt', promptVal.trim());
    navigate('/signup');
  }, [promptVal, navigate]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleGenerate();
  };

  return (
    <div style={{ fontFamily: 'var(--font)', background: 'var(--bg)', minHeight: '100vh', overflowX: 'hidden' }}>

      {/* ── NAV ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
        background: 'rgba(7,9,15,0.75)',
        backdropFilter: 'blur(24px)',
        borderBottom: '1px solid var(--border)',
        height: 58,
        display: 'flex', alignItems: 'center',
        padding: '0 clamp(1rem, 4vw, 2.5rem)',
        justifyContent: 'space-between',
        gap: 20,
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <div style={{
            width: 30, height: 30,
            background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
            borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Sparkles size={16} color="#fff" />
          </div>
          <span style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--t1)', letterSpacing: '-0.02em' }}>Craftly</span>
        </div>

        {/* Center links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {(['Features', 'How it works', 'Pricing'] as const).map(l => (
            <a key={l} href={`#${l.toLowerCase().replace(/ /g, '-')}`} className="nav-link">{l}</a>
          ))}
        </div>

        {/* Right CTA */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <button onClick={() => navigate('/login')} className="btn btn-ghost" style={{ padding: '7px 14px', fontSize: '0.85rem' }}>Sign in</button>
          <button onClick={() => navigate('/signup')} className="btn btn-primary" style={{ padding: '7px 16px', fontSize: '0.85rem' }}>
            Start free <ArrowRight size={13} />
          </button>
        </div>
      </nav>

      {/* ═══════════════════════════════════════
          HERO SECTION
      ═══════════════════════════════════════ */}
      <section style={{
        minHeight: '100vh',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: 'clamp(100px, 15vh, 160px) clamp(1rem, 4vw, 2rem) 80px',
        position: 'relative', textAlign: 'center', overflow: 'hidden',
      }}>
        {/* Mesh background */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 0,
          background: `
            radial-gradient(ellipse 80% 60% at 50% 0%, rgba(99,102,241,0.13) 0%, transparent 60%),
            radial-gradient(ellipse 50% 40% at 80% 70%, rgba(6,182,212,0.07) 0%, transparent 60%),
            radial-gradient(ellipse 40% 30% at 20% 80%, rgba(99,102,241,0.06) 0%, transparent 60%)
          `,
          pointerEvents: 'none',
        }} />

        {/* Grid overlay */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 0, opacity: 0.025,
          backgroundImage: 'linear-gradient(var(--border-hover) 1px, transparent 1px), linear-gradient(90deg, var(--border-hover) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
          pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 840 }}>

          {/* Badge */}
          <div className="fade-up" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(99,102,241,0.1)',
            border: '1px solid rgba(99,102,241,0.25)',
            borderRadius: 'var(--r-full)', padding: '6px 14px',
            marginBottom: 28,
          }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#6366f1', animation: 'blink 2s ease infinite' }} />
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#818cf8', letterSpacing: '0.04em' }}>
              AI Code Generation · Spring Boot 3 + React 18 + Gemini AI
            </span>
          </div>

          {/* Headline */}
          <h1 className="fade-up-d1" style={{
            fontSize: 'clamp(2.6rem, 7vw, 5rem)',
            fontWeight: 900, letterSpacing: '-0.045em',
            lineHeight: 1.06, color: 'var(--t1)', marginBottom: 22,
          }}>
            Build full-stack apps<br />
            <span className="shimmer-text">with a single prompt</span>
          </h1>

          {/* Subheadline */}
          <p className="fade-up-d2" style={{
            fontSize: 'clamp(1rem, 2.2vw, 1.2rem)',
            color: 'var(--t2)', lineHeight: 1.7,
            maxWidth: 560, margin: '0 auto 48px',
          }}>
            Craftly turns your ideas into production-ready applications — complete with Spring Boot APIs, React frontends, PostgreSQL schemas, and Docker configs.
          </p>

          {/* PROMPT INPUT */}
          <div className="fade-up-d3" style={{ width: '100%', maxWidth: 700, margin: '0 auto 20px' }}>
            <div style={{
              background: focused ? 'rgba(15,19,32,0.95)' : 'rgba(12,15,26,0.85)',
              border: focused ? '1px solid rgba(99,102,241,0.5)' : '1px solid rgba(255,255,255,0.1)',
              borderRadius: 'var(--r-xl)',
              padding: '4px 4px 4px 20px',
              display: 'flex', alignItems: 'center', gap: 12,
              backdropFilter: 'blur(20px)',
              boxShadow: focused
                ? '0 0 0 4px rgba(99,102,241,0.12), 0 20px 60px rgba(0,0,0,0.5)'
                : '0 20px 60px rgba(0,0,0,0.4)',
              transition: 'all 0.2s ease',
            }}>
              <Sparkles size={18} style={{ color: 'var(--primary)', flexShrink: 0 }} />

              <div style={{ flex: 1, position: 'relative', overflow: 'hidden', textAlign: 'left' }}>
                {/* Placeholder typing animation */}
                {!promptVal && !focused && (
                  <div style={{
                    position: 'absolute', inset: 0,
                    display: 'flex', alignItems: 'center',
                    fontSize: '0.95rem', color: 'var(--t3)',
                    pointerEvents: 'none',
                    whiteSpace: 'nowrap', overflow: 'hidden',
                  }}>
                    {typedPrompt}
                    <span style={{ display: 'inline-block', width: 2, height: '1em', background: 'var(--primary)', marginLeft: 1, animation: 'blink 1s step-end infinite', verticalAlign: 'text-bottom' }} />
                  </div>
                )}
                <input
                  value={promptVal}
                  onChange={e => setPromptVal(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  placeholder={focused ? 'Describe your full-stack application...' : ''}
                  style={{
                    width: '100%', background: 'transparent', border: 'none',
                    color: 'var(--t1)', fontSize: '0.95rem',
                    fontFamily: 'var(--font)', outline: 'none',
                    padding: '12px 0',
                  }}
                />
              </div>

              <button
                onClick={handleGenerate}
                style={{
                  background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                  color: '#fff', border: 'none',
                  padding: '11px 22px', borderRadius: 'var(--r-lg)',
                  fontWeight: 700, fontSize: '0.875rem',
                  display: 'flex', alignItems: 'center', gap: 7,
                  cursor: 'pointer', fontFamily: 'var(--font)',
                  whiteSpace: 'nowrap', flexShrink: 0,
                  transition: 'opacity 0.18s, transform 0.18s',
                }}
                onMouseEnter={e => { const b = e.currentTarget as HTMLButtonElement; b.style.opacity = '0.88'; b.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={e => { const b = e.currentTarget as HTMLButtonElement; b.style.opacity = '1'; b.style.transform = 'translateY(0)'; }}
              >
                Generate <ArrowRight size={15} />
              </button>
            </div>

            {/* Quick example pills */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginTop: 14 }}>
              {['SaaS Dashboard', 'E-commerce App', 'REST API', 'Chat App'].map(ex => (
                <button
                  key={ex}
                  onClick={() => { setPromptVal(`Build a ${ex.toLowerCase()} with full authentication and database`); }}
                  style={{
                    background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)',
                    color: 'var(--t3)', padding: '5px 12px', borderRadius: 'var(--r-full)',
                    fontSize: '0.78rem', cursor: 'pointer', fontFamily: 'var(--font)',
                    transition: 'all 0.15s',
                    display: 'flex', alignItems: 'center', gap: 5,
                  }}
                  onMouseEnter={e => { const b = e.currentTarget as HTMLButtonElement; b.style.borderColor = 'var(--border-hover)'; b.style.color = 'var(--t2)'; }}
                  onMouseLeave={e => { const b = e.currentTarget as HTMLButtonElement; b.style.borderColor = 'var(--border)'; b.style.color = 'var(--t3)'; }}
                >
                  <Plus size={10} /> {ex}
                </button>
              ))}
            </div>
          </div>

          {/* Social proof */}
          <div className="fade-up-d4" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 10 }}>
            <div style={{ display: 'flex', marginRight: 4 }}>
              {['S', 'A', 'K'].map((l, i) => (
                <div key={i} style={{
                  width: 24, height: 24, borderRadius: '50%',
                  background: `hsl(${240 + i * 40},70%,60%)`,
                  border: '2px solid var(--bg)',
                  marginLeft: i ? -8 : 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.6rem', fontWeight: 700, color: '#fff',
                }}>{l}</div>
              ))}
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--t3)' }}>Free to start · No credit card required</span>
          </div>
        </div>

        {/* Scroll indicator */}
        <div style={{
          position: 'absolute', bottom: 36, left: '50%', transform: 'translateX(-50%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
          opacity: 0.3, animation: 'float 3s ease infinite',
        }}>
          <div style={{ width: 1, height: 40, background: 'linear-gradient(to bottom, transparent, var(--t3))' }} />
          <div style={{ fontSize: '0.7rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--t3)' }}>scroll</div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          STATS STRIP
      ═══════════════════════════════════════ */}
      <section style={{ borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '40px clamp(1rem,4vw,2.5rem)' }}>
        <div style={{
          maxWidth: 1000, margin: '0 auto',
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 32,
          textAlign: 'center',
        }}>
          {[
            { val: '10×', lbl: 'Faster than manual coding' },
            { val: '132+', lbl: 'Source files generated' },
            { val: '14', lbl: 'Enterprise API features' },
            { val: '99.9%', lbl: 'Production uptime (Render)' },
          ].map(({ val, lbl }) => (
            <div key={lbl}>
              <div style={{ fontSize: 'clamp(1.8rem,3vw,2.4rem)', fontWeight: 900, color: 'var(--t1)', letterSpacing: '-0.04em' }}>{val}</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--t3)', marginTop: 4 }}>{lbl}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════
          FEATURES BENTO
      ═══════════════════════════════════════ */}
      <section id="features" className="section">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <div className="section-label">Capabilities</div>
            <h2 className="section-title">Everything your app needs, out of the box</h2>
            <p className="section-sub" style={{ margin: '0 auto' }}>
              Craftly generates a complete, enterprise-grade architecture — not just scaffolding.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 18, alignItems: 'start',
          }}>
            <BentoCard
              wide icon={<Zap size={20} />} accent="#6366f1"
              label="AI Streaming"
              title="Real-time code generation via Server-Sent Events"
              desc="Watch your application materialize token-by-token. Our SSE pipeline streams Gemini AI output directly into the Monaco editor — file-by-file, in real time."
              preview={
                <div style={{ fontFamily: 'var(--mono)', fontSize: '0.75rem', lineHeight: 1.7, color: 'var(--t3)' }}>
                  <span style={{ color: '#6366f1' }}>POST</span> /api/projects/42/chat/sessions/7/stream<br />
                  <span style={{ color: '#10b981' }}>▶</span> Generating <span style={{ color: 'var(--t2)' }}>UserController.java</span> ...<br />
                  <span style={{ color: '#10b981' }}>▶</span> Generating <span style={{ color: 'var(--t2)' }}>AuthService.java</span> ...<br />
                  <span className="stream-dot" />
                </div>
              }
            />
            <BentoCard
              icon={<Code2 size={20} />} accent="#06b6d4"
              label="Monaco Editor"
              title="VS Code engine in the browser"
              desc="Multi-file workspace editing with syntax highlighting, IntelliSense, and dark theme — powered by the same engine as VS Code."
            />
            <BentoCard
              icon={<Box size={20} />} accent="#10b981"
              label="MinIO Storage"
              title="S3-compatible project workspace"
              desc="Every file is persisted to MinIO object storage. Download your entire project as a production ZIP at any time."
            />
            <BentoCard
              icon={<MessageSquare size={20} />} accent="#f59e0b"
              label="Qdrant RAG"
              title="Vector search memory for your AI"
              desc="25-line sliding-window code chunking with cosine similarity search gives the AI deep context about your codebase across conversations."
            />
            <BentoCard
              icon={<Shield size={20} />} accent="#ec4899"
              label="AOP + Redis"
              title="Quota guards & rate limiting"
              desc="Aspect-Oriented @RequireQuota annotations and Redis sliding-window rate limiters protect every endpoint. Enterprise-grade, zero boilerplate."
            />
            <BentoCard
              icon={<Activity size={20} />} accent="#a78bfa"
              label="Kafka + Zipkin"
              title="Event streaming & distributed tracing"
              desc="Kafka topics publish every AI generation and usage event. Zipkin traces every request hop across your microservice-ready architecture."
            />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          HOW IT WORKS
      ═══════════════════════════════════════ */}
      <section id="how-it-works" style={{ padding: 'var(--space-24) clamp(1rem,4vw,2.5rem)', background: 'var(--bg-surface)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <div className="section-label">How it works</div>
            <h2 className="section-title">From idea to deployed app in 3 steps</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
            <StepCard num="01" accent="#6366f1" title="Describe your application"
              desc="Type a natural language prompt in the hero input. Include your tech stack preferences, features, and integrations." />
            <StepCard num="02" accent="#06b6d4" title="AI generates the full codebase"
              desc="Craftly streams a complete Spring Boot backend, React frontend, PostgreSQL schema, Docker config, and README — in real time." />
            <StepCard num="03" accent="#10b981" title="Edit, export, and deploy"
              desc="Fine-tune in the Monaco editor, chat with AI to iterate, then export a production ZIP or deploy directly to Render + Vercel." />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          CODE SHOWCASE
      ═══════════════════════════════════════ */}
      <section style={{ padding: 'var(--space-24) clamp(1rem,4vw,2.5rem)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center' }}>
            {/* Text */}
            <div>
              <div className="section-label">Full-Stack Architecture</div>
              <h2 className="section-title" style={{ marginBottom: 20 }}>Every layer generated, not just the scaffolding</h2>
              <p style={{ color: 'var(--t2)', lineHeight: 1.7, marginBottom: 28 }}>
                Unlike basic code generators, Craftly produces a complete production architecture — from JPA entities and Spring Security to React Router guards and Stripe webhook handlers.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  'Spring Boot 3 · Java 21 · JPA Repositories',
                  'JWT Auth · BCrypt · Spring Security Filter Chain',
                  'React 18 · TypeScript · Monaco Editor workspace',
                  'Stripe Checkout · Webhooks · Subscription lifecycle',
                  'Docker multi-stage build · PostgreSQL · MinIO',
                ].map(item => (
                  <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.875rem', color: 'var(--t2)' }}>
                    <Check size={14} style={{ color: 'var(--success)', flexShrink: 0 }} />
                    {item}
                  </div>
                ))}
              </div>
              <button
                onClick={() => navigate('/signup')}
                className="btn btn-primary"
                style={{ marginTop: 32, padding: '12px 24px' }}
              >
                Try it free <ArrowRight size={15} />
              </button>
            </div>

            {/* Code window */}
            <div style={{
              background: 'var(--bg-surface)', border: '1px solid var(--border)',
              borderRadius: 'var(--r-xl)', overflow: 'hidden',
              boxShadow: 'var(--shadow-xl)',
            }}>
              {/* Window chrome */}
              <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg-card)' }}>
                {['#ef4444', '#f59e0b', '#10b981'].map(c => (
                  <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c, opacity: 0.7 }} />
                ))}
                <div style={{ flex: 1, textAlign: 'center', fontFamily: 'var(--mono)', fontSize: '0.72rem', color: 'var(--t3)' }}>
                  UserController.java — generated by Craftly AI
                </div>
              </div>
              <div style={{ padding: '20px 24px', fontFamily: 'var(--mono)', fontSize: '0.78rem', lineHeight: 1.75 }}>
                {[
                  { t: '@RestController', c: '#818cf8' },
                  { t: '@RequestMapping("/api/users")', c: '#818cf8' },
                  { t: 'public class UserController {', c: 'var(--t2)' },
                  { t: '', c: '' },
                  { t: '  @Autowired UserService userService;', c: 'var(--t3)' },
                  { t: '', c: '' },
                  { t: '  @GetMapping("/me")', c: '#818cf8' },
                  { t: '  @PreAuthorize("isAuthenticated()")', c: '#818cf8' },
                  { t: '  public ResponseEntity<UserDto> getMe(', c: 'var(--t2)' },
                  { t: '      Authentication auth) {', c: 'var(--t2)' },
                  { t: '    return ResponseEntity.ok(', c: 'var(--t2)' },
                  { t: '      userService.getByEmail(', c: 'var(--t2)' },
                  { t: '        auth.getName()));', c: '#06b6d4' },
                  { t: '  }', c: 'var(--t2)' },
                  { t: '}', c: 'var(--t2)' },
                ].map((row, i) => (
                  <div key={i} style={{ display: 'flex', gap: 20 }}>
                    <span style={{ color: 'var(--border-hover)', minWidth: 18, textAlign: 'right', userSelect: 'none', fontSize: '0.72rem' }}>{row.t ? i + 1 : ''}</span>
                    <span style={{ color: row.c }}>{row.t}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          TECH STACK
      ═══════════════════════════════════════ */}
      <section style={{ padding: '60px clamp(1rem,4vw,2.5rem)', borderTop: '1px solid var(--border)' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--t3)', marginBottom: 24 }}>
            Built on enterprise-grade infrastructure
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 10, maxWidth: 860, margin: '0 auto' }}>
            {['Spring Boot 3', 'Java 21', 'PostgreSQL 16', 'React 18', 'TypeScript', 'Vite 5', 'MinIO S3', 'Qdrant VectorDB', 'Apache Kafka', 'Redis', 'Stripe', 'Docker', 'Gemini 1.5', 'Zipkin', 'Render', 'Vercel'].map(t => (
              <div key={t} style={{
                padding: '6px 14px', background: 'var(--bg-card)',
                border: '1px solid var(--border)', borderRadius: 'var(--r-full)',
                fontSize: '0.8rem', color: 'var(--t3)', transition: 'all 0.15s',
                cursor: 'default',
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.color = 'var(--t2)'; (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border-hover)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.color = 'var(--t3)'; (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)'; }}
              >
                {t}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          PRICING
      ═══════════════════════════════════════ */}
      <section id="pricing" className="section" style={{ background: 'var(--bg-surface)', borderTop: '1px solid var(--border)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <div className="section-label">Pricing</div>
            <h2 className="section-title">Start free, scale when ready</h2>
            <p className="section-sub" style={{ margin: '0 auto' }}>No commitment. Cancel anytime.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 22, maxWidth: 960, margin: '0 auto' }}>
            <PricingTier
              name="Free" price="$0" desc="For developers experimenting with AI code generation"
              accent="var(--t3)" cta="Start building"
              features={['3 workspace projects', '10,000 daily AI tokens', '1 container preview', 'ZIP export', 'Community support']}
              onCta={() => navigate('/signup')}
            />
            <PricingTier
              name="Pro" price="$29" period="/month" desc="For engineers shipping production applications"
              accent="var(--primary)" highlighted cta="Upgrade to Pro"
              features={['50 workspace projects', '500K monthly AI tokens', '5 concurrent previews', 'Qdrant RAG search', 'Redis rate limiting', 'Priority support']}
              onCta={() => navigate('/signup')}
            />
            <PricingTier
              name="Enterprise" price="$199" period="/month" desc="For teams building at scale with full compliance"
              accent="var(--accent)" cta="Contact sales"
              features={['Unlimited projects', 'Unlimited AI generation', 'Dedicated Kafka pipeline', 'Zipkin distributed tracing', 'Custom domain preview', 'SLA + dedicated support']}
              onCta={() => navigate('/signup')}
            />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          CTA SECTION
      ═══════════════════════════════════════ */}
      <section style={{
        padding: 'var(--space-24) clamp(1rem,4vw,2.5rem)',
        textAlign: 'center', position: 'relative', overflow: 'hidden',
        background: 'radial-gradient(ellipse 80% 60% at 50% 100%, rgba(99,102,241,0.1) 0%, transparent 70%)',
      }}>
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 900, letterSpacing: '-0.04em', color: 'var(--t1)', marginBottom: 16, lineHeight: 1.1 }}>
            Your next project starts<br />with a single sentence.
          </h2>
          <p style={{ fontSize: '1.05rem', color: 'var(--t2)', marginBottom: 36 }}>
            Join developers using Craftly to ship faster with AI.
          </p>
          <button
            onClick={() => navigate('/signup')}
            style={{
              background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
              color: '#fff', border: 'none', padding: '14px 32px',
              borderRadius: 'var(--r-lg)', fontWeight: 700, fontSize: '1rem',
              display: 'inline-flex', alignItems: 'center', gap: 8,
              cursor: 'pointer', fontFamily: 'var(--font)',
              boxShadow: '0 0 40px rgba(99,102,241,0.3)',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { const b = e.currentTarget as HTMLButtonElement; b.style.transform = 'translateY(-2px)'; b.style.boxShadow = '0 0 60px rgba(99,102,241,0.4)'; }}
            onMouseLeave={e => { const b = e.currentTarget as HTMLButtonElement; b.style.transform = 'translateY(0)'; b.style.boxShadow = '0 0 40px rgba(99,102,241,0.3)'; }}
          >
            Get started for free <ArrowRight size={17} />
          </button>
          <div style={{ marginTop: 14, fontSize: '0.82rem', color: 'var(--t3)' }}>
            No credit card · Free tier forever · Deploy to Render + Vercel
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          FOOTER
      ═══════════════════════════════════════ */}
      <footer style={{
        borderTop: '1px solid var(--border)',
        padding: '32px clamp(1rem,4vw,2.5rem)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexWrap: 'wrap', gap: 16,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 26, height: 26, background: 'linear-gradient(135deg, #6366f1, #06b6d4)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sparkles size={13} color="#fff" />
          </div>
          <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--t2)', letterSpacing: '-0.01em' }}>Craftly</span>
          <span style={{ color: 'var(--t3)', fontSize: '0.8rem' }}>— AI Code Generation Platform</span>
        </div>
        <div style={{ color: 'var(--t3)', fontSize: '0.78rem' }}>
          Spring Boot 3 · React 18 · Gemini AI · Deployed on Render + Vercel
        </div>
        <a href="https://github.com/Subodh26oct/Craftly" target="_blank" rel="noopener" style={{ color: 'var(--t3)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 5, transition: 'color 0.15s' }}
          onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.color = 'var(--t2)')}
          onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.color = 'var(--t3)')}
        >
          <ExternalLink size={13} /> GitHub
        </a>
      </footer>
    </div>
  );
};
