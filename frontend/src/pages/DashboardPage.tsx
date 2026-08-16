import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../api/axios';
import { Project, UserUsageSummary } from '../types';
import { useNavigate } from 'react-router-dom';
import { Plus, Folder, Sparkles, LogOut, CreditCard, Activity, ArrowUpRight } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [projects, setProjects] = useState<Project[]>([]);
  const [usage, setUsage] = useState<UserUsageSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [projectDesc, setProjectDesc] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  const fetchDashboardData = async () => {
    try {
      const [projRes, usageRes] = await Promise.all([
        apiClient.get<Project[]>('/api/projects'),
        apiClient.get<UserUsageSummary>('/api/usage/summary').catch(() => null)
      ]);
      setProjects(projRes.data);
      if (usageRes) setUsage(usageRes.data);
    } catch (err: any) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError('');

    try {
      const res = await apiClient.post<Project>('/api/projects', {
        name: projectName,
        description: projectDesc
      });
      setShowModal(false);
      setProjectName('');
      setProjectDesc('');
      navigate(`/project/${res.data.id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create project (Quota limit reached?)');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#090d16', color: '#f3f4f6', fontFamily: 'sans-serif' }}>
      
      {/* Header Navigation Bar */}
      <header style={{ borderBottom: '1px solid #1f2937', background: '#111827', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ padding: '0.5rem', background: '#2563eb', borderRadius: '0.5rem', color: '#fff' }}>
            <Sparkles size={20} />
          </div>
          <span style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Craftly Platform</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            onClick={() => navigate('/pricing')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#1f2937', color: '#60a5fa', border: '1px solid #374151', padding: '0.5rem 1rem', borderRadius: '0.5rem', cursor: 'pointer' }}
          >
            <CreditCard size={16} /> Upgrade Plan
          </button>

          <span style={{ fontSize: '0.875rem', color: '#9ca3af' }}>{user?.name || user?.email}</span>

          <button
            onClick={() => { logout(); navigate('/login'); }}
            style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
        
        {/* Usage Analytics Widget Banner */}
        {usage && (
          <div style={{ background: '#111827', border: '1px solid #1f2937', borderRadius: '0.75rem', padding: '1.5rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <Activity size={18} style={{ color: '#3b82f6' }} />
                <span style={{ fontWeight: '600', color: '#d1d5db' }}>Plan: {usage.planName} Tier</span>
              </div>
              <p style={{ margin: 0, fontSize: '0.875rem', color: '#9ca3af' }}>
                Tokens Used Today: <strong style={{ color: '#fff' }}>{usage.tokensToday}</strong> / {usage.maxTokensPerDay}
              </p>
            </div>

            <div style={{ width: '250px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.25rem', color: '#9ca3af' }}>
                <span>Monthly Quota</span>
                <span>{usage.percentageUsed}%</span>
              </div>
              <div style={{ width: '100%', height: '8px', background: '#374151', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${Math.min(100, usage.percentageUsed)}%`, height: '100%', background: usage.isLimitExceeded ? '#ef4444' : '#3b82f6' }} />
              </div>
            </div>
          </div>
        )}

        {/* Dashboard Title & Create Button */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>Your Projects</h2>
            <p style={{ margin: '0.25rem 0 0 0', color: '#9ca3af', fontSize: '0.875rem' }}>Manage and edit your AI generated fullstack projects</p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#2563eb', color: '#fff', border: 'none', padding: '0.75rem 1.25rem', borderRadius: '0.5rem', fontWeight: '600', cursor: 'pointer' }}
          >
            <Plus size={18} /> New Project
          </button>
        </div>

        {/* Projects Grid */}
        {loading ? (
          <p style={{ color: '#9ca3af' }}>Loading workspace projects...</p>
        ) : projects.length === 0 ? (
          <div style={{ background: '#111827', border: '1px border-dashed #374151', borderRadius: '0.75rem', padding: '3rem', textAlign: 'center' }}>
            <Folder size={48} style={{ color: '#4b5563', marginBottom: '1rem' }} />
            <h3 style={{ margin: 0, fontSize: '1.125rem' }}>No projects created yet</h3>
            <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '1.5rem' }}>Click 'New Project' above to prompt AI and generate your first workspace app.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {projects.map((p) => (
              <div
                key={p.id}
                onClick={() => navigate(`/project/${p.id}`)}
                style={{ background: '#111827', border: '1px solid #1f2937', borderRadius: '0.75rem', padding: '1.5rem', cursor: 'pointer', transition: 'border-color 0.2s' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: '600', color: '#fff' }}>{p.name}</h3>
                  <ArrowUpRight size={18} style={{ color: '#6b7280' }} />
                </div>
                <p style={{ margin: 0, color: '#9ca3af', fontSize: '0.875rem', lineHeight: '1.4' }}>
                  {p.description || 'AI Code Generation Workspace Project'}
                </p>
              </div>
            ))}
          </div>
        )}

      </main>

      {/* Modal for Creating New Project */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ background: '#111827', border: '1px solid #1f2937', padding: '2rem', borderRadius: '1rem', width: '100%', maxWidth: '450px' }}>
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.25rem' }}>Create New AI Project</h3>

            {error && <p style={{ color: '#ef4444', fontSize: '0.875rem', marginBottom: '1rem' }}>{error}</p>}

            <form onSubmit={handleCreateProject} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', color: '#9ca3af', marginBottom: '0.25rem' }}>Project Name</label>
                <input
                  type="text"
                  required
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="E-Commerce Storefront"
                  style={{ width: '100%', background: '#1f2937', border: '1px solid #374151', padding: '0.5rem 0.75rem', borderRadius: '0.5rem', color: '#fff', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', color: '#9ca3af', marginBottom: '0.25rem' }}>Description</label>
                <textarea
                  rows={3}
                  value={projectDesc}
                  onChange={(e) => setProjectDesc(e.target.value)}
                  placeholder="AI generated fullstack app..."
                  style={{ width: '100%', background: '#1f2937', border: '1px solid #374151', padding: '0.5rem 0.75rem', borderRadius: '0.5rem', color: '#fff', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '0.5rem', fontWeight: '600', cursor: 'pointer' }}
                >
                  {creating ? 'Creating...' : 'Create Workspace'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
