import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles, ArrowRight, Code2, Zap, Shield, Globe,
  ChevronRight, Play, Star, Check,
  MessageSquare, Layers, Box, Terminal, FileCode, ExternalLink
} from 'lucide-react';

// --- Typing animation for hero prompt ---
const PROMPTS = [
  'Build me a full-stack e-commerce app with Stripe checkout...',
  'Create a real-time chat app with WebSocket support...',
  'Generate a REST API with JWT auth and PostgreSQL...',
  'Design a SaaS dashboard with analytics and billing...',
];

const TypingAnimation: React.FC = () => {
  const [promptIdx, setPromptIdx] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const current = PROMPTS[promptIdx];
    let timeout: ReturnType<typeof setTimeout>;

    if (!isDeleting && displayText.length < current.length) {
      timeout = setTimeout(() => setDisplayText(current.slice(0, displayText.length + 1)), 35);
    } else if (!isDeleting && displayText.length === current.length) {
      timeout = setTimeout(() => setIsDeleting(true), 2200);
    } else if (isDeleting && displayText.length > 0) {
      timeout = setTimeout(() => setDisplayText(displayText.slice(0, -1)), 18);
    } else {
      setIsDeleting(false);
      setPromptIdx((prev) => (prev + 1) % PROMPTS.length);
    }
    return () => clearTimeout(timeout);
  }, [displayText, isDeleting, promptIdx]);

  return (
    <span style={{ color: '#e2e8f0' }}>
      {displayText}
      <span style={{
        display: 'inline-block', width: '2px', height: '1.1em',
        background: '#3b82f6', marginLeft: '2px', verticalAlign: 'text-bottom',
        animation: 'blink 1s step-end infinite'
      }} />
    </span>
  );
};

// --- Floating code snippet card ---
const CodeSnippet: React.FC<{ code: string; lang: string; top: string; left?: string; right?: string; delay?: string }> = ({ code, lang, top, left, right, delay = '0s' }) => (
  <div style={{
    position: 'absolute', top, left, right,
    background: 'rgba(17,24,39,0.9)',
    border: '1px solid rgba(59,130,246,0.2)',
    borderRadius: '10px', padding: '12px 16px',
    fontFamily: 'monospace', fontSize: '12px', lineHeight: '1.6',
    color: '#94a3b8', backdropFilter: 'blur(12px)',
    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
    animation: `floatUp 6s ease-in-out ${delay} infinite alternate`,
    width: '240px', zIndex: 2,
    display: 'none',
  }}>
    <div style={{ color: '#64748b', fontSize: '10px', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{lang}</div>
    <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{code}</pre>
  </div>
);

// --- Feature Card ---
const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; desc: string; accent: string }> = ({ icon, title, desc, accent }) => (
  <div style={{
    background: 'rgba(17,24,39,0.6)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '16px', padding: '28px',
    backdropFilter: 'blur(8px)',
    transition: 'border-color 0.3s, transform 0.3s',
  }}
    onMouseEnter={(e) => {
      (e.currentTarget as HTMLDivElement).style.borderColor = accent + '44';
      (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)';
    }}
    onMouseLeave={(e) => {
      (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.06)';
      (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
    }}
  >
    <div style={{
      width: '44px', height: '44px', borderRadius: '10px',
      background: accent + '18', display: 'flex', alignItems: 'center', justifyContent: 'center',
      marginBottom: '18px', color: accent
    }}>{icon}</div>
    <h3 style={{ margin: '0 0 10px 0', fontSize: '1.05rem', fontWeight: '600', color: '#f1f5f9' }}>{title}</h3>
    <p style={{ margin: 0, color: '#64748b', fontSize: '0.875rem', lineHeight: '1.65' }}>{desc}</p>
  </div>
);

// --- Stat counter ---
const Stat: React.FC<{ number: string; label: string }> = ({ number, label }) => (
  <div style={{ textAlign: 'center' }}>
    <div style={{ fontSize: '2.25rem', fontWeight: '800', color: '#f1f5f9', letterSpacing: '-0.03em' }}>{number}</div>
    <div style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '4px' }}>{label}</div>
  </div>
);

// --- Pricing Card ---
const PricingCard: React.FC<{
  name: string; price: string; desc: string;
  features: string[]; accent: string; highlighted?: boolean; cta: string;
  onCta: () => void;
}> = ({ name, price, desc, features, accent, highlighted, cta, onCta }) => (
  <div style={{
    background: highlighted ? 'rgba(37,99,235,0.12)' : 'rgba(17,24,39,0.6)',
    border: highlighted ? `1px solid rgba(59,130,246,0.4)` : '1px solid rgba(255,255,255,0.06)',
    borderRadius: '18px', padding: '32px 28px',
    position: 'relative', backdropFilter: 'blur(8px)',
    display: 'flex', flexDirection: 'column', gap: '6px'
  }}>
    {highlighted && (
      <div style={{
        position: 'absolute', top: '-13px', left: '50%', transform: 'translateX(-50%)',
        background: 'linear-gradient(90deg, #2563eb, #7c3aed)',
        color: '#fff', fontSize: '0.72rem', fontWeight: '700',
        padding: '4px 14px', borderRadius: '99px', letterSpacing: '0.06em'
      }}>MOST POPULAR</div>
    )}
    <div style={{ fontSize: '0.875rem', fontWeight: '600', color: accent, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{name}</div>
    <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#f1f5f9', letterSpacing: '-0.04em', margin: '8px 0 4px' }}>
      {price}<span style={{ fontSize: '1rem', fontWeight: '400', color: '#64748b' }}>{price !== 'Free' ? '/mo' : ''}</span>
    </div>
    <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '20px' }}>{desc}</div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1, marginBottom: '24px' }}>
      {features.map((f, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.875rem', color: '#cbd5e1' }}>
          <Check size={15} style={{ color: accent, flexShrink: 0 }} /> {f}
        </div>
      ))}
    </div>
    <button onClick={onCta} style={{
      background: highlighted ? 'linear-gradient(90deg, #2563eb, #7c3aed)' : 'rgba(255,255,255,0.06)',
      color: '#fff', border: highlighted ? 'none' : '1px solid rgba(255,255,255,0.1)',
      padding: '12px', borderRadius: '10px', fontWeight: '600', cursor: 'pointer', fontSize: '0.9rem',
      transition: 'opacity 0.2s',
    }}
      onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.opacity = '0.85')}
      onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.opacity = '1')}
    >{cta}</button>
  </div>
);

// ========== MAIN LANDING PAGE ==========
export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [promptInput, setPromptInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleLaunch = () => {
    if (promptInput.trim()) {
      localStorage.setItem('craftly_initial_prompt', promptInput);
    }
    navigate('/signup');
  };

  return (
    <div style={{
      minHeight: '100vh', backgroundColor: '#060b14',
      color: '#f1f5f9', fontFamily: "'Inter', -apple-system, sans-serif",
      overflowX: 'hidden',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes floatUp { from{transform:translateY(0px)} to{transform:translateY(-12px)} }
        @keyframes fadeSlideUp { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
        @keyframes rotateGlow { 0%{transform:rotate(0deg)} 100%{transform:rotate(360deg)} }
        .hero-section { animation: fadeSlideUp 0.8s ease both; }
        .hero-delay-1 { animation: fadeSlideUp 0.8s ease 0.15s both; }
        .hero-delay-2 { animation: fadeSlideUp 0.8s ease 0.3s both; }
        .hero-delay-3 { animation: fadeSlideUp 0.8s ease 0.45s both; }
        .nav-link { color: #94a3b8; text-decoration: none; font-size: 0.9rem; transition: color 0.2s; }
        .nav-link:hover { color: #f1f5f9; }
        .input-glow:focus { border-color: rgba(59,130,246,0.5) !important; box-shadow: 0 0 0 3px rgba(59,130,246,0.12) !important; outline: none; }
      `}</style>

      {/* ─── NAVIGATION ─── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: 'rgba(6,11,20,0.8)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        padding: '0 2rem', height: '60px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px', height: '32px', background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
            borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Sparkles size={17} color="#fff" />
          </div>
          <span style={{ fontWeight: '700', fontSize: '1.1rem', color: '#f1f5f9' }}>Craftly</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <a href="#features" className="nav-link">Features</a>
          <a href="#how-it-works" className="nav-link">How it works</a>
          <a href="#pricing" className="nav-link">Pricing</a>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => navigate('/login')}
            style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '500', padding: '6px 12px' }}
          >Sign in</button>
          <button
            onClick={() => navigate('/signup')}
            style={{
              background: 'linear-gradient(135deg, #2563eb, #7c3aed)', color: '#fff',
              border: 'none', padding: '8px 18px', borderRadius: '8px',
              fontWeight: '600', cursor: 'pointer', fontSize: '0.875rem',
              transition: 'opacity 0.2s',
            }}
          >Get started free</button>
        </div>
      </nav>

      {/* ─── HERO SECTION ─── */}
      <section style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '120px 1.5rem 80px', position: 'relative', textAlign: 'center',
      }}>
        {/* Background radial glow */}
        <div style={{
          position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)',
          width: '800px', height: '500px',
          background: 'radial-gradient(ellipse at center, rgba(37,99,235,0.15) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', top: '30%', left: '20%',
          width: '300px', height: '300px',
          background: 'radial-gradient(ellipse at center, rgba(124,58,237,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* Badge */}
        <div className="hero-section" style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(59,130,246,0.25)',
          borderRadius: '99px', padding: '6px 14px', marginBottom: '28px', cursor: 'default',
        }}>
          <div style={{ width: '6px', height: '6px', background: '#3b82f6', borderRadius: '50%', animation: 'pulse 2s infinite' }} />
          <span style={{ fontSize: '0.8rem', fontWeight: '500', color: '#93c5fd' }}>
            AI-Powered Code Generation · Spring Boot + React
          </span>
        </div>

        {/* Headline */}
        <h1 className="hero-delay-1" style={{
          fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: '900',
          lineHeight: 1.08, letterSpacing: '-0.04em', margin: '0 0 24px',
          maxWidth: '820px',
        }}>
          Build full-stack apps<br />
          <span style={{
            background: 'linear-gradient(90deg, #60a5fa, #a78bfa, #60a5fa)',
            backgroundSize: '200% auto',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            animation: 'shimmer 4s linear infinite',
          }}>with a single prompt</span>
        </h1>

        <p className="hero-delay-2" style={{
          fontSize: 'clamp(1rem, 2vw, 1.2rem)', color: '#64748b', lineHeight: '1.7',
          maxWidth: '540px', margin: '0 0 44px',
        }}>
          Craftly turns your ideas into production-ready applications. Describe what you want to build — our AI generates the full codebase, instantly.
        </p>

        {/* Prompt Input */}
        <div className="hero-delay-3" style={{ width: '100%', maxWidth: '660px', marginBottom: '20px' }}>
          <div style={{
            background: 'rgba(17,24,39,0.8)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '14px', display: 'flex', alignItems: 'center',
            padding: '6px 6px 6px 18px', gap: '10px',
            backdropFilter: 'blur(12px)',
            boxShadow: '0 0 0 1px rgba(59,130,246,0.1), 0 20px 60px rgba(0,0,0,0.5)',
          }}>
            <Sparkles size={18} style={{ color: '#3b82f6', flexShrink: 0 }} />
            <div style={{ flex: 1, textAlign: 'left', overflow: 'hidden' }}>
              {promptInput === '' ? (
                <div style={{ color: '#475569', fontSize: '0.95rem', pointerEvents: 'none', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  <TypingAnimation />
                </div>
              ) : null}
              <input
                ref={inputRef}
                value={promptInput}
                onChange={(e) => setPromptInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLaunch()}
                placeholder=""
                className="input-glow"
                style={{
                  position: promptInput === '' ? 'absolute' : 'static',
                  opacity: promptInput === '' ? 0 : 1,
                  width: promptInput === '' ? '1px' : '100%',
                  background: 'transparent', border: 'none', color: '#f1f5f9',
                  fontSize: '0.95rem', outline: 'none', fontFamily: 'inherit',
                }}
              />
            </div>
            <button
              onClick={handleLaunch}
              style={{
                background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                color: '#fff', border: 'none', padding: '11px 20px',
                borderRadius: '10px', fontWeight: '600', cursor: 'pointer',
                fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '6px',
                whiteSpace: 'nowrap', transition: 'opacity 0.2s',
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.opacity = '0.85')}
              onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.opacity = '1')}
            >
              Generate App <ArrowRight size={16} />
            </button>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginTop: '14px' }}>
            {['Next.js', 'Spring Boot', 'PostgreSQL', 'Stripe', 'Docker'].map((t) => (
              <span key={t} style={{ fontSize: '0.78rem', color: '#475569', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Check size={11} style={{ color: '#3b82f6' }} />{t}
              </span>
            ))}
          </div>
        </div>

        {/* CTA links */}
        <div className="hero-delay-3" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '12px' }}>
          <Play size={13} style={{ color: '#64748b' }} />
          <span style={{ color: '#64748b', fontSize: '0.85rem' }}>No credit card required · Free to start</span>
        </div>
      </section>

      {/* ─── EDITOR PREVIEW ─── */}
      <section style={{ padding: '0 1.5rem 100px', display: 'flex', justifyContent: 'center' }}>
        <div style={{
          width: '100%', maxWidth: '1100px',
          background: 'rgba(13,18,30,0.9)', border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '20px', overflow: 'hidden',
          boxShadow: '0 40px 120px rgba(0,0,0,0.6), 0 0 0 1px rgba(59,130,246,0.08)',
        }}>
          {/* Window chrome bar */}
          <div style={{
            background: 'rgba(17,24,39,0.95)', borderBottom: '1px solid rgba(255,255,255,0.06)',
            padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '8px',
          }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ef4444', opacity: 0.8 }} />
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#f59e0b', opacity: 0.8 }} />
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#10b981', opacity: 0.8 }} />
            <div style={{ flex: 1, textAlign: 'center', fontSize: '0.78rem', color: '#4b5563', fontFamily: 'monospace' }}>
              craftly — AI Workspace
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <div style={{ padding: '3px 10px', background: 'rgba(37,99,235,0.2)', borderRadius: '4px', fontSize: '0.7rem', color: '#60a5fa' }}>TypeScript</div>
              <div style={{ padding: '3px 10px', background: 'rgba(16,185,129,0.15)', borderRadius: '4px', fontSize: '0.7rem', color: '#34d399' }}>Live</div>
            </div>
          </div>

          {/* Three-panel IDE layout */}
          <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr 300px', minHeight: '480px' }}>
            {/* File explorer */}
            <div style={{ borderRight: '1px solid rgba(255,255,255,0.05)', padding: '12px 8px', fontFamily: 'monospace', fontSize: '0.78rem' }}>
              <div style={{ color: '#4b5563', fontSize: '0.68rem', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '4px 8px', marginBottom: '8px' }}>Explorer</div>
              {[
                { name: 'src', type: 'folder', indent: 0, open: true },
                { name: 'components', type: 'folder', indent: 1, open: true },
                { name: 'Dashboard.tsx', type: 'file', indent: 2, active: true },
                { name: 'Navbar.tsx', type: 'file', indent: 2 },
                { name: 'pages', type: 'folder', indent: 1 },
                { name: 'api', type: 'folder', indent: 1 },
                { name: 'App.tsx', type: 'file', indent: 1 },
                { name: 'pom.xml', type: 'file', indent: 0 },
                { name: 'Dockerfile', type: 'file', indent: 0 },
              ].map((item, i) => (
                <div key={i} style={{
                  padding: '4px 8px', paddingLeft: `${8 + item.indent * 14}px`,
                  borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
                  background: (item as any).active ? 'rgba(37,99,235,0.2)' : 'transparent',
                  color: (item as any).active ? '#60a5fa' : item.type === 'folder' ? '#94a3b8' : '#64748b',
                }}>
                  {item.type === 'folder' ? <Layers size={11} /> : <FileCode size={11} />}
                  {item.name}
                </div>
              ))}
            </div>

            {/* Code editor */}
            <div style={{ padding: '16px 20px', fontFamily: 'monospace', fontSize: '0.8rem', lineHeight: '1.8', overflowY: 'auto' }}>
              {[
                { line: `import React, { useState, useEffect } from 'react';`, color: '#94a3b8' },
                { line: `import { apiClient } from '../api/axios';`, color: '#94a3b8' },
                { line: '', color: '' },
                { line: `const Dashboard: React.FC = () => {`, color: '#60a5fa' },
                { line: `  const [projects, setProjects] = useState([]);`, color: '#94a3b8' },
                { line: `  const [usage, setUsage] = useState(null);`, color: '#94a3b8' },
                { line: '', color: '' },
                { line: `  useEffect(() => {`, color: '#a78bfa' },
                { line: `    apiClient.get('/api/projects')`, color: '#94a3b8' },
                { line: `      .then(res => setProjects(res.data));`, color: '#94a3b8' },
                { line: `  }, []);`, color: '#a78bfa' },
                { line: '', color: '' },
                { line: `  return (`, color: '#60a5fa' },
                { line: `    <div className="dashboard">`, color: '#94a3b8' },
                { line: `      <ProjectGrid projects={projects} />`, color: '#34d399' },
                { line: `      <UsageWidget data={usage} />`, color: '#34d399' },
                { line: `    </div>`, color: '#94a3b8' },
                { line: `  );`, color: '#60a5fa' },
                { line: `};`, color: '#60a5fa' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: '16px' }}>
                  <span style={{ color: '#2d3748', userSelect: 'none', minWidth: '20px', textAlign: 'right' }}>{item.line ? i + 1 : ''}</span>
                  <span style={{ color: item.color }}>{item.line}</span>
                </div>
              ))}
              {/* Cursor line */}
              <div style={{ display: 'flex', gap: '16px' }}>
                <span style={{ color: '#2d3748', minWidth: '20px', textAlign: 'right' }}>20</span>
                <span style={{ color: '#94a3b8' }}>export default Dashboard;</span>
                <span style={{ display: 'inline-block', width: '2px', height: '1em', background: '#3b82f6', animation: 'blink 1s infinite', marginLeft: '2px' }} />
              </div>
            </div>

            {/* AI chat panel */}
            <div style={{ borderLeft: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#94a3b8' }}>
                <Sparkles size={13} style={{ color: '#3b82f6' }} /> AI Assistant
              </div>
              <div style={{ flex: 1, padding: '14px', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.78rem' }}>
                <div style={{ background: 'rgba(37,99,235,0.12)', border: '1px solid rgba(59,130,246,0.15)', borderRadius: '10px', padding: '10px 12px', color: '#93c5fd' }}>
                  Create a dashboard with project stats and usage widget
                </div>
                <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '10px', padding: '10px 12px', color: '#64748b', lineHeight: '1.6' }}>
                  ✅ Generated <span style={{ color: '#34d399' }}>Dashboard.tsx</span> with project grid and usage stats<br />
                  ✅ Created <span style={{ color: '#34d399' }}>UsageWidget.tsx</span> component<br />
                  ✅ Updated <span style={{ color: '#34d399' }}>api/axios.ts</span> with new endpoints<br />
                  <span style={{ color: '#4b5563' }}>Generating type definitions...</span>
                  <span style={{ display: 'inline-block', width: '6px', height: '6px', background: '#3b82f6', borderRadius: '50%', marginLeft: '6px', animation: 'pulse 1s infinite' }} />
                </div>
              </div>
              <div style={{ padding: '10px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '8px', padding: '8px 12px', fontSize: '0.75rem', color: '#4b5563', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>Add filtering to the project grid...</span>
                  <ArrowRight size={12} style={{ color: '#3b82f6' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── STATS SECTION ─── */}
      <section style={{ padding: '20px 1.5rem 100px', borderTop: '1px solid rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '2rem' }}>
          <Stat number="10x" label="Faster development" />
          <Stat number="132+" label="Source files generated" />
          <Stat number="14" label="Enterprise features" />
          <Stat number="99.9%" label="API uptime on Render" />
        </div>
      </section>

      {/* ─── FEATURES SECTION ─── */}
      <section id="features" style={{ padding: '100px 1.5rem' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: '600', color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '14px' }}>Capabilities</div>
            <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: '800', letterSpacing: '-0.03em', margin: '0 0 16px' }}>
              Everything you need to ship
            </h2>
            <p style={{ color: '#64748b', fontSize: '1.05rem', maxWidth: '520px', margin: '0 auto', lineHeight: '1.7' }}>
              Built on top of an enterprise-grade Spring Boot 3 architecture. Every feature that real production apps need.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            <FeatureCard
              icon={<Zap size={22} />} accent="#3b82f6"
              title="Real-time AI Code Streaming"
              desc="Watch your app be built live. Server-Sent Events (SSE) stream AI-generated code token by token into your Monaco editor workspace."
            />
            <FeatureCard
              icon={<Code2 size={22} />} accent="#a78bfa"
              title="Monaco Code Editor"
              desc="Full VS Code editor engine embedded in the browser. Multi-file workspace, syntax highlighting, and auto-formatting out of the box."
            />
            <FeatureCard
              icon={<Box size={22} />} accent="#34d399"
              title="MinIO Object Storage"
              desc="Your entire project workspace stored in S3-compatible object storage. Download a production ZIP of your generated codebase anytime."
            />
            <FeatureCard
              icon={<MessageSquare size={22} />} accent="#f59e0b"
              title="Qdrant Vector RAG"
              desc="25-line sliding window code chunking with cosine similarity vector search. Your AI assistant gets smarter with every conversation."
            />
            <FeatureCard
              icon={<Shield size={22} />} accent="#ec4899"
              title="AOP Quota Enforcement"
              desc="Aspect-Oriented quota guards with Redis sliding-window rate limiting. Enterprise-grade protection for every API endpoint."
            />
            <FeatureCard
              icon={<Globe size={22} />} accent="#06b6d4"
              title="Stripe Billing Integration"
              desc="Hosted Stripe Checkout sessions, automated webhook handling, and plan upgrades/downgrades — the full subscription lifecycle."
            />
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section id="how-it-works" style={{ padding: '80px 1.5rem', background: 'rgba(17,24,39,0.3)' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: '600', color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '14px' }}>How it works</div>
            <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: '800', letterSpacing: '-0.03em', margin: 0 }}>
              From idea to production in 3 steps
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px' }}>
            {[
              { step: '01', icon: <MessageSquare size={28} />, title: 'Describe your app', desc: 'Type a natural language prompt describing what you want to build. Craftly understands full-stack requirements.', color: '#3b82f6' },
              { step: '02', icon: <Zap size={28} />, title: 'AI generates the code', desc: 'Watch as Gemini AI streams your full application — frontend, backend, database schema, Docker config — in real time.', color: '#a78bfa' },
              { step: '03', icon: <Globe size={28} />, title: 'Deploy instantly', desc: 'Export your project ZIP or deploy directly to Render + Vercel with a single click. Ship production apps, not demos.', color: '#34d399' },
            ].map((item, i) => (
              <div key={i} style={{ textAlign: 'center', padding: '32px 20px' }}>
                <div style={{
                  width: '64px', height: '64px', borderRadius: '16px', margin: '0 auto 20px',
                  background: item.color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', color: item.color
                }}>{item.icon}</div>
                <div style={{ fontSize: '0.75rem', fontWeight: '700', color: item.color, letterSpacing: '0.1em', marginBottom: '10px' }}>STEP {item.step}</div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '700', margin: '0 0 12px', color: '#f1f5f9' }}>{item.title}</h3>
                <p style={{ color: '#64748b', fontSize: '0.875rem', lineHeight: '1.7', margin: 0 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TECH STACK BANNER ─── */}
      <section style={{ padding: '60px 1.5rem', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px', fontSize: '0.8rem', color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          Built with enterprise-grade technology
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '12px', maxWidth: '900px', margin: '0 auto' }}>
          {['Spring Boot 3', 'Java 21', 'PostgreSQL', 'React 18', 'TypeScript', 'Vite', 'MinIO', 'Qdrant VectorDB', 'Apache Kafka', 'Redis', 'Stripe', 'Docker', 'Gemini AI', 'Zipkin', 'Render', 'Vercel'].map((tech) => (
            <div key={tech} style={{
              padding: '7px 14px', background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.06)', borderRadius: '99px',
              fontSize: '0.8rem', color: '#94a3b8',
            }}>{tech}</div>
          ))}
        </div>
      </section>

      {/* ─── PRICING ─── */}
      <section id="pricing" style={{ padding: '100px 1.5rem' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: '600', color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '14px' }}>Pricing</div>
            <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: '800', letterSpacing: '-0.03em', margin: '0 0 14px' }}>
              Start free, scale as you grow
            </h2>
            <p style={{ color: '#64748b', fontSize: '1rem', margin: 0 }}>No hidden fees. Cancel anytime.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
            <PricingCard
              name="Free" price="Free" accent="#64748b"
              desc="For hobby developers experimenting with AI"
              features={['3 Workspace Projects', '10,000 Daily AI Tokens', '1 Container Preview', 'ZIP Export', 'Community Support']}
              cta="Start building free"
              onCta={() => navigate('/signup')}
            />
            <PricingCard
              name="Pro" price="$29" accent="#3b82f6" highlighted
              desc="For professional engineers shipping real products"
              features={['50 Workspace Projects', '500K Monthly AI Tokens', '5 Concurrent Previews', 'Qdrant RAG Vector Search', 'Kafka Event Streaming', 'Priority Support']}
              cta="Upgrade to Pro"
              onCta={() => navigate('/signup')}
            />
            <PricingCard
              name="Enterprise" price="$199" accent="#a78bfa"
              desc="For engineering teams building at scale"
              features={['Unlimited Projects', 'Unlimited AI Generation', 'Dedicated Kafka Pipeline', 'Redis Rate Limiting', 'Zipkin Tracing', 'SLA + Dedicated Support']}
              cta="Contact sales"
              onCta={() => navigate('/signup')}
            />
          </div>
        </div>
      </section>

      {/* ─── CTA SECTION ─── */}
      <section style={{
        padding: '100px 1.5rem', textAlign: 'center',
        background: 'radial-gradient(ellipse at center bottom, rgba(37,99,235,0.12) 0%, transparent 70%)',
      }}>
        <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: '900', letterSpacing: '-0.04em', margin: '0 0 20px' }}>
          Start building your next<br />big idea today
        </h2>
        <p style={{ color: '#64748b', fontSize: '1.1rem', marginBottom: '40px' }}>
          Join developers using Craftly to ship faster with AI
        </p>
        <button
          onClick={() => navigate('/signup')}
          style={{
            background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
            color: '#fff', border: 'none', padding: '16px 36px',
            borderRadius: '12px', fontWeight: '700', cursor: 'pointer',
            fontSize: '1.05rem', display: 'inline-flex', alignItems: 'center', gap: '8px',
            transition: 'opacity 0.2s, transform 0.2s',
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = '0.9'; (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.02)'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = '1'; (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'; }}
        >
          Get started for free <ArrowRight size={18} />
        </button>
        <div style={{ marginTop: '16px', color: '#4b5563', fontSize: '0.85rem' }}>No credit card required · Free tier forever</div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer style={{
        borderTop: '1px solid rgba(255,255,255,0.05)',
        padding: '40px 1.5rem', display: 'flex',
        justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '28px', height: '28px', background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
            borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Sparkles size={14} color="#fff" />
          </div>
          <span style={{ fontWeight: '600', color: '#94a3b8', fontSize: '0.9rem' }}>Craftly AI Platform</span>
        </div>
        <div style={{ color: '#4b5563', fontSize: '0.8rem' }}>
          Built with ❤️ using Spring Boot 3 · React · Gemini AI · Deployed on Render + Vercel
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <a href="https://github.com/Subodh26oct/Craftly" target="_blank" rel="noopener" style={{ color: '#64748b', display: 'flex', alignItems: 'center' }}>
            <ExternalLink size={18} />
          </a>
        </div>
      </footer>
    </div>
  );
};
