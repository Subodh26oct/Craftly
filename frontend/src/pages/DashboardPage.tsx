import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../api/axios';
import { Project, UserUsageSummary } from '../types';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles, Plus, LogOut, CreditCard, ArrowUpRight,
  Zap, Activity, FolderOpen, Clock, Code2, ChevronRight
} from 'lucide-react';

/* ── Helpers ── */
const techColor = (name: string) => {
  const map: Record<string, string> = {
    React: '#61dafb', Spring: '#6aad3d', Java: '#f89820',
    Node: '#68a063', Python: '#3572a5', TypeScript: '#3178c6', Default: '#6366f1',
  };
  for (const k of Object.keys(map)) if (name.toLowerCase().includes(k.toLowerCase())) return map[k];
  return map['Default'];
};

const timeAgo = (date: string) => {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

/* ── Usage Ring SVG ── */
const UsageRing: React.FC<{ pct: number; color: string; size?: number }> = ({ pct, color, size = 48 }) => {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const dash = circ * Math.min(pct / 100, 1);
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', flexShrink: 0 }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={5} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={5}
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 0.8s cubic-bezier(0.4,0,0.2,1)' }}
      />
    </svg>
  );
};

/* ── Project Card ── */
const ProjectCard: React.FC<{ project: Project; onClick: () => void }> = ({ project, onClick }) => {
  const [hovered, setHovered] = useState(false);
  const initials = project.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  const hue = (project.name.charCodeAt(0) * 37) % 360;

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? 'var(--bg-elevated)' : 'var(--bg-card)',
        border: hovered ? '1px solid var(--border-hover)' : '1px solid var(--border)',
        borderRadius: 'var(--r-lg)', padding: '22px',
        cursor: 'pointer', transition: 'all 0.18s ease',
        transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
        display: 'flex', flexDirection: 'column', gap: 12,
        position: 'relative', overflow: 'hidden',
      }}
    >
      {/* Top accent bar */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 3,
        background: `linear-gradient(90deg, hsl(${hue},70%,60%), hsl(${hue + 60},70%,60%))`,
        opacity: hovered ? 1 : 0,
        transition: 'opacity 0.2s',
      }} />

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
        {/* Avatar */}
        <div style={{
          width: 40, height: 40, borderRadius: 'var(--r-md)', flexShrink: 0,
          background: `linear-gradient(135deg, hsl(${hue},60%,45%), hsl(${hue + 60},60%,45%))`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '0.85rem', fontWeight: 800, color: '#fff',
          boxShadow: `0 4px 16px hsla(${hue},60%,50%,0.25)`,
        }}>
          {initials}
        </div>
        <ArrowUpRight size={15} style={{ color: hovered ? 'var(--primary)' : 'var(--t3)', transition: 'color 0.18s', flexShrink: 0 }} />
      </div>

      <div>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--t1)', marginBottom: 5, lineHeight: 1.3 }}>
          {project.name}
        </h3>
        <p style={{ fontSize: '0.8rem', color: 'var(--t3)', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {project.description || 'AI generated full-stack workspace'}
        </p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginTop: 'auto' }}>
        {['Spring Boot', 'React'].map(tech => (
          <span key={tech} style={{
            fontSize: '0.68rem', fontWeight: 600,
            color: techColor(tech), background: techColor(tech) + '18',
            padding: '2px 8px', borderRadius: 'var(--r-full)',
            border: `1px solid ${techColor(tech)}30`,
          }}>{tech}</span>
        ))}
        {project.updatedAt && (
          <span style={{ fontSize: '0.7rem', color: 'var(--t3)', marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 3 }}>
            <Clock size={10} />{timeAgo(project.updatedAt)}
          </span>
        )}
      </div>
    </div>
  );
};

/* ═════════════════════════════════════
   DASHBOARD PAGE
═════════════════════════════════════ */
export const DashboardPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [projects, setProjects] = useState<Project[]>([]);
  const [usage, setUsage] = useState<UserUsageSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [projectDesc, setProjectDesc] = useState('');
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Close menu on outside click
  useEffect(() => {
    const handler = () => setUserMenuOpen(false);
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const [projRes, usageRes] = await Promise.all([
          apiClient.get<Project[]>('/api/projects'),
          apiClient.get<UserUsageSummary>('/api/usage/summary').catch(() => null),
        ]);
        setProjects(projRes.data);
        if (usageRes) setUsage(usageRes.data);
        setApiError(null);
      } catch (err: any) {
        const status = err?.response?.status;
        if (status === 401 || status === 403) {
          logout();
          navigate('/login');
        } else {
          setApiError(
            status
              ? `API error ${status}. The backend may be waking up — try refreshing in 30 seconds.`
              : 'Cannot reach the backend. Render free tier may be starting up (30–60 s). Please refresh.'
          );
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim()) return;
    setCreating(true);
    setFormError('');
    try {
      const res = await apiClient.post<Project>('/api/projects', { name: projectName, description: projectDesc });
      setShowModal(false);
      setProjectName('');
      setProjectDesc('');
      navigate(`/project/${res.data.id}`);
    } catch (err: any) {
      setFormError(err?.response?.data?.message || 'Failed to create project. Check your quota.');
    } finally {
      setCreating(false);
    }
  };

  const handleLogout = () => { logout(); navigate('/'); };

  const userInitial = (user?.name || user?.email || 'U').charAt(0).toUpperCase();
  const tokenPct = usage ? Math.round((usage.tokensToday / usage.maxTokensPerDay) * 100) : 0;
  const monthlyPct = usage?.percentageUsed ?? 0;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', fontFamily: 'var(--font)' }}>

      {/* ── TOP NAV ── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(7,9,15,0.85)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border)',
        height: 56, display: 'flex', alignItems: 'center',
        padding: '0 clamp(1rem,3vw,2rem)',
        justifyContent: 'space-between', gap: 16,
      }}>
        {/* Logo */}
        <button onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: 9, background: 'none', border: 'none', cursor: 'pointer' }}>
          <div style={{ width: 28, height: 28, background: 'linear-gradient(135deg, #6366f1, #06b6d4)', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sparkles size={14} color="#fff" />
          </div>
          <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--t1)', letterSpacing: '-0.02em' }}>Craftly</span>
        </button>

        {/* Right section */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            onClick={() => navigate('/pricing')}
            style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)', color: 'var(--primary)', padding: '6px 12px', borderRadius: 'var(--r-full)', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font)' }}
          >
            <Zap size={12} /> Upgrade
          </button>

          {/* User menu */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setUserMenuOpen(v => !v)}
              style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg-card)', border: '1px solid var(--border)', padding: '5px 12px 5px 5px', borderRadius: 'var(--r-full)', cursor: 'pointer', fontFamily: 'var(--font)' }}
            >
              <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 800, color: '#fff' }}>
                {userInitial}
              </div>
              <span style={{ fontSize: '0.82rem', color: 'var(--t2)', fontWeight: 500 }}>{user?.name || user?.email?.split('@')[0]}</span>
            </button>

            {userMenuOpen && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                borderRadius: 'var(--r-lg)', overflow: 'hidden', minWidth: 180,
                boxShadow: 'var(--shadow-lg)', zIndex: 200, animation: 'scaleIn 0.15s ease',
              }}>
                <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--t1)' }}>{user?.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--t3)' }}>{user?.email}</div>
                </div>
                {[
                  { icon: <CreditCard size={14} />, label: 'Manage billing', action: () => { navigate('/pricing'); setUserMenuOpen(false); } },
                  { icon: <LogOut size={14} />, label: 'Sign out', action: handleLogout, danger: true },
                ].map(item => (
                  <button key={item.label} onClick={item.action} style={{
                    display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                    background: 'none', border: 'none', padding: '11px 16px',
                    color: (item as any).danger ? 'var(--danger)' : 'var(--t2)',
                    fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'var(--font)',
                    transition: 'background 0.15s',
                  }}
                    onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.04)')}
                    onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.background = 'none')}
                  >
                    {item.icon} {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── MAIN CONTENT ── */}
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: 'clamp(1.5rem,4vw,2.5rem) clamp(1rem,3vw,2rem)' }}>

        {/* ── API ERROR BANNER ── */}
        {apiError && (
          <div style={{
            background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)',
            borderRadius: 'var(--r-lg)', padding: '14px 18px', marginBottom: 24,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: '1rem' }}>⚠️</span>
              <span style={{ fontSize: '0.875rem', color: '#fbbf24', lineHeight: 1.5 }}>{apiError}</span>
            </div>
            <button
              onClick={() => { setApiError(null); setLoading(true); window.location.reload(); }}
              style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)', color: '#fbbf24', padding: '6px 14px', borderRadius: 'var(--r-md)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, fontFamily: 'var(--font)', flexShrink: 0 }}
            >
              Refresh
            </button>
          </div>
        )}

        {/* ── GREETING + STATS ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 24, marginBottom: 36 }}>
          <div>
            <h1 style={{ fontSize: 'clamp(1.4rem,3vw,1.9rem)', fontWeight: 800, color: 'var(--t1)', letterSpacing: '-0.03em', marginBottom: 6 }}>
              Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'},{' '}
              <span style={{ color: 'var(--primary)' }}>{user?.name?.split(' ')[0] || 'Developer'}</span> 👋
            </h1>
            <p style={{ fontSize: '0.9rem', color: 'var(--t3)' }}>
              {projects.length === 0 ? 'Create your first AI-powered workspace project.' : `You have ${projects.length} active workspace project${projects.length !== 1 ? 's' : ''}.`}
            </p>
          </div>

          {/* Usage widget */}
          {usage && (
            <div style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: 'var(--r-lg)', padding: '16px 20px',
              display: 'flex', alignItems: 'center', gap: 20, flexShrink: 0,
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <div style={{ position: 'relative', width: 48, height: 48 }}>
                  <UsageRing pct={tokenPct} color={tokenPct > 80 ? 'var(--danger)' : 'var(--primary)'} />
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', fontWeight: 700, color: 'var(--t2)' }}>{tokenPct}%</div>
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--t3)', textAlign: 'center' }}>Daily<br />tokens</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <div style={{ position: 'relative', width: 48, height: 48 }}>
                  <UsageRing pct={monthlyPct} color={monthlyPct > 80 ? 'var(--danger)' : 'var(--accent)'} />
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', fontWeight: 700, color: 'var(--t2)' }}>{monthlyPct}%</div>
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--t3)', textAlign: 'center' }}>Monthly<br />quota</div>
              </div>
              <div style={{ borderLeft: '1px solid var(--border)', paddingLeft: 20 }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--primary)', marginBottom: 3 }}>{usage.planName} Plan</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--t2)' }}>{usage.tokensToday.toLocaleString()} / {usage.maxTokensPerDay.toLocaleString()}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--t3)' }}>tokens used today</div>
              </div>
            </div>
          )}
        </div>

        {/* ── PROJECTS HEADER ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <FolderOpen size={16} style={{ color: 'var(--t3)' }} />
            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--t2)' }}>
              Projects
              {projects.length > 0 && <span style={{ marginLeft: 8, background: 'var(--bg-elevated)', color: 'var(--t3)', padding: '1px 8px', borderRadius: 'var(--r-full)', fontSize: '0.75rem', fontWeight: 500 }}>{projects.length}</span>}
            </span>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="btn btn-primary"
            style={{ padding: '8px 16px', fontSize: '0.85rem' }}
          >
            <Plus size={14} /> New project
          </button>
        </div>

        {/* ── PROJECT GRID ── */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 18 }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ height: 160, background: 'var(--bg-card)', borderRadius: 'var(--r-lg)', border: '1px solid var(--border)', animation: 'pulse 1.5s ease infinite' }} />
            ))}
          </div>
        ) : projects.length === 0 ? (
          /* Empty state */
          <div style={{
            background: 'var(--bg-card)', border: '1px dashed var(--border)',
            borderRadius: 'var(--r-xl)', padding: '64px 32px',
            textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
          }}>
            <div style={{ width: 60, height: 60, borderRadius: 'var(--r-lg)', background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Code2 size={28} style={{ color: 'var(--primary)' }} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--t1)', marginBottom: 8 }}>No projects yet</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--t3)', maxWidth: 340 }}>
                Click "New project" and describe your application — Craftly will generate the complete codebase in seconds.
              </p>
            </div>
            <button onClick={() => setShowModal(true)} className="btn btn-primary" style={{ marginTop: 8 }}>
              <Plus size={14} /> Create first project
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 18 }}>
            {projects.map(p => (
              <ProjectCard key={p.id} project={p} onClick={() => navigate(`/project/${p.id}`)} />
            ))}
          </div>
        )}
      </main>

      {/* ── CREATE PROJECT MODAL ── */}
      {showModal && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 500, padding: 20 }}
          onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}
        >
          <div style={{
            background: 'var(--bg-elevated)', border: '1px solid var(--border)',
            borderRadius: 'var(--r-2xl)', padding: '32px',
            width: '100%', maxWidth: 480,
            animation: 'scaleIn 0.18s ease',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
              <div style={{ width: 36, height: 36, borderRadius: 'var(--r-md)', background: 'rgba(99,102,241,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Sparkles size={18} style={{ color: 'var(--primary)' }} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--t1)' }}>New AI project</h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--t3)' }}>Craftly will generate the full codebase</p>
              </div>
            </div>

            {formError && (
              <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 'var(--r-md)', padding: '10px 14px', fontSize: '0.82rem', color: '#fca5a5', marginBottom: 16 }}>
                {formError}
              </div>
            )}

            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--t2)', marginBottom: 7 }}>Project name *</label>
                <input className="input" required value={projectName} onChange={e => setProjectName(e.target.value)} placeholder="E-Commerce Platform" autoFocus />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--t2)', marginBottom: 7 }}>
                  Description <span style={{ color: 'var(--t3)', fontWeight: 400 }}>(optional)</span>
                </label>
                <textarea
                  className="input"
                  rows={3} value={projectDesc}
                  onChange={e => setProjectDesc(e.target.value)}
                  placeholder="A multi-vendor e-commerce app with Stripe payments, inventory management, and an admin dashboard..."
                  style={{ resize: 'vertical', lineHeight: 1.55 }}
                />
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-ghost" style={{ padding: '10px 18px', fontSize: '0.875rem' }}>Cancel</button>
                <button type="submit" disabled={creating} className="btn btn-primary" style={{ padding: '10px 20px', fontSize: '0.875rem' }}>
                  {creating ? <><div className="spinner" /> Creating…</> : <><Plus size={14} /> Create project</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
