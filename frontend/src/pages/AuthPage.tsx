import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Sparkles, Check, Zap, Shield, Code2 } from 'lucide-react';

const FEATURES = [
  { icon: <Zap size={16} />, text: 'Real-time AI code streaming via SSE' },
  { icon: <Code2 size={16} />, text: 'Monaco Editor with multi-file workspace' },
  { icon: <Shield size={16} />, text: 'JWT auth · AOP quota · Redis rate limiting' },
  { icon: <Check size={16} />, text: 'Deploy to Render + Vercel in one click' },
];

export const AuthPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { login, signup } = useAuth();

  const [isLogin, setIsLogin] = useState(location.pathname !== '/signup');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const toggleMode = () => {
    setIsLogin(v => !v);
    setError('');
    navigate(isLogin ? '/signup' : '/login', { replace: true });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isLogin) {
        await login({ username: email, password });
      } else {
        await signup({ username: email, name, password });
      }
      navigate('/dashboard');
    } catch (err: any) {
      setError(err?.response?.data?.message || (isLogin ? 'Invalid credentials. Please try again.' : 'Could not create account. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      fontFamily: 'var(--font)', background: 'var(--bg)',
    }}>
      {/* ── LEFT BRAND PANEL ── */}
      <div style={{
        flex: '0 0 48%', display: 'flex', flexDirection: 'column',
        justifyContent: 'space-between', padding: '40px 56px',
        position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(145deg, var(--bg-surface) 0%, var(--bg) 100%)',
        borderRight: '1px solid var(--border)',
      }}>
        {/* Background mesh */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: `
            radial-gradient(ellipse 70% 50% at 30% 30%, rgba(99,102,241,0.08) 0%, transparent 70%),
            radial-gradient(ellipse 50% 40% at 80% 80%, rgba(6,182,212,0.05) 0%, transparent 70%)
          `,
        }} />

        {/* Logo */}
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg, #6366f1, #06b6d4)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sparkles size={17} color="#fff" />
          </div>
          <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--t1)', letterSpacing: '-0.02em' }}>Craftly</span>
        </div>

        {/* Center content */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--primary)', marginBottom: 20 }}>
            AI Code Generation Platform
          </div>
          <h2 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', fontWeight: 900, letterSpacing: '-0.04em', color: 'var(--t1)', lineHeight: 1.1, marginBottom: 20 }}>
            Turn ideas into{' '}
            <span className="shimmer-text">production apps</span>{' '}
            instantly
          </h2>
          <p style={{ fontSize: '0.95rem', color: 'var(--t2)', lineHeight: 1.7, marginBottom: 36, maxWidth: 360 }}>
            Describe your application in plain English. Craftly generates the complete full-stack codebase — backend, frontend, database, and deployment config.
          </p>

          {/* Feature list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {FEATURES.map((f, i) => (
              <div key={i} className="fade-up" style={{
                display: 'flex', alignItems: 'center', gap: 12,
                animationDelay: `${i * 0.1}s`,
              }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: 'rgba(99,102,241,0.12)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--primary)', flexShrink: 0,
                }}>
                  {f.icon}
                </div>
                <span style={{ fontSize: '0.875rem', color: 'var(--t2)' }}>{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom testimonial */}
        <div style={{
          position: 'relative', zIndex: 1,
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--r-lg)', padding: '18px 22px',
        }}>
          <p style={{ fontSize: '0.85rem', color: 'var(--t2)', lineHeight: 1.6, marginBottom: 12, fontStyle: 'italic' }}>
            "Built a complete SaaS boilerplate with authentication, billing, and AI in one afternoon — something that would have taken weeks before."
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, color: '#fff' }}>SK</div>
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--t1)' }}>Subodh Kumar</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--t3)' }}>Full-Stack Engineer · Creator of Craftly</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── RIGHT FORM PANEL ── */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '40px 48px', background: 'var(--bg)',
      }}>
        <div style={{ width: '100%', maxWidth: 380 }} className="fade-up">

          {/* Header */}
          <div style={{ marginBottom: 32 }}>
            <h1 style={{ fontSize: '1.7rem', fontWeight: 800, color: 'var(--t1)', letterSpacing: '-0.03em', marginBottom: 6 }}>
              {isLogin ? 'Welcome back' : 'Create your account'}
            </h1>
            <p style={{ fontSize: '0.9rem', color: 'var(--t3)' }}>
              {isLogin ? 'Sign in to your Craftly workspace' : 'Start building AI-powered apps for free'}
            </p>
          </div>

          {/* Error */}
          {error && (
            <div style={{
              background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
              color: '#fca5a5', borderRadius: 'var(--r-md)', padding: '12px 14px',
              fontSize: '0.85rem', marginBottom: 20, lineHeight: 1.5,
            }}>
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {!isLogin && (
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--t2)', marginBottom: 7 }}>Full name</label>
                <input
                  className="input"
                  type="text" required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Subodh Kumar"
                  autoComplete="name"
                />
              </div>
            )}

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--t2)', marginBottom: 7 }}>Email address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={15} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--t3)', pointerEvents: 'none' }} />
                <input
                  className="input"
                  type="email" required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  style={{ paddingLeft: 36 }}
                />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--t2)' }}>Password</label>
                {isLogin && (
                  <button type="button" style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.78rem', cursor: 'pointer', fontFamily: 'var(--font)' }}>
                    Forgot password?
                  </button>
                )}
              </div>
              <div style={{ position: 'relative' }}>
                <Lock size={15} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--t3)', pointerEvents: 'none' }} />
                <input
                  className="input"
                  type={showPw ? 'text' : 'password'} required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                  style={{ paddingLeft: 36, paddingRight: 40 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--t3)', cursor: 'pointer', padding: 2 }}
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                background: 'var(--primary)',
                color: '#fff', border: 'none',
                padding: '13px', borderRadius: 'var(--r-md)',
                fontWeight: 700, fontSize: '0.9rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: 'var(--font)',
                marginTop: 4, opacity: loading ? 0.65 : 1,
                transition: 'all 0.18s',
                boxShadow: loading ? 'none' : '0 0 24px rgba(99,102,241,0.3)',
              }}
            >
              {loading ? (
                <><div className="spinner" /> Processing…</>
              ) : (
                <>{isLogin ? 'Sign in to workspace' : 'Create free account'} <ArrowRight size={16} /></>
              )}
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '24px 0' }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            <span style={{ fontSize: '0.78rem', color: 'var(--t3)' }}>or</span>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          </div>

          {/* Toggle */}
          <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--t3)' }}>
            {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button
              onClick={toggleMode}
              style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font)', fontSize: '0.875rem' }}
            >
              {isLogin ? 'Sign up free' : 'Sign in'}
            </button>
          </p>

          {/* Back to home */}
          <p style={{ textAlign: 'center', marginTop: 24 }}>
            <button
              onClick={() => navigate('/')}
              style={{ background: 'none', border: 'none', color: 'var(--t3)', cursor: 'pointer', fontSize: '0.8rem', fontFamily: 'var(--font)', display: 'inline-flex', alignItems: 'center', gap: 4 }}
            >
              ← Back to Craftly home
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
