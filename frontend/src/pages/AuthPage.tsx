import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Sparkles, ArrowRight, Lock, Mail, User as UserIcon } from 'lucide-react';

export const AuthPage: React.FC = () => {
  const location = useLocation();
  const [isLogin, setIsLogin] = useState(location.pathname !== '/signup');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, signup } = useAuth();
  const navigate = useNavigate();

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
      setError(err.response?.data?.message || 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#090d16', color: '#f3f4f6', fontFamily: 'sans-serif' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '2rem' }}>
        <div style={{ width: '100%', maxWidth: '400px', background: '#111827', padding: '2.5rem', borderRadius: '1rem', border: '1px solid #1f2937' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <div style={{ padding: '0.5rem', background: '#3b82f6', borderRadius: '0.5rem', color: '#fff' }}>
              <Sparkles size={24} />
            </div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>Craftly AI</h1>
          </div>

          <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: '#9ca3af' }}>
            {isLogin ? 'Sign in to your workspace' : 'Create your account'}
          </h2>

          {error && (
            <div style={{ background: '#7f1d1d', border: '1px solid #991b1b', color: '#fca5a5', padding: '0.75rem', borderRadius: '0.5rem', fontSize: '0.875rem', marginBottom: '1rem' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {!isLogin && (
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem', color: '#9ca3af' }}>Full Name</label>
                <div style={{ display: 'flex', alignItems: 'center', background: '#1f2937', borderRadius: '0.5rem', padding: '0.5rem 0.75rem' }}>
                  <UserIcon size={18} style={{ color: '#6b7280', marginRight: '0.5rem' }} />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Subodh Kumar"
                    style={{ background: 'transparent', border: 'none', color: '#fff', outline: 'none', width: '100%' }}
                  />
                </div>
              </div>
            )}

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem', color: '#9ca3af' }}>Email Address</label>
              <div style={{ display: 'flex', alignItems: 'center', background: '#1f2937', borderRadius: '0.5rem', padding: '0.5rem 0.75rem' }}>
                <Mail size={18} style={{ color: '#6b7280', marginRight: '0.5rem' }} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  style={{ background: 'transparent', border: 'none', color: '#fff', outline: 'none', width: '100%' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem', color: '#9ca3af' }}>Password</label>
              <div style={{ display: 'flex', alignItems: 'center', background: '#1f2937', borderRadius: '0.5rem', padding: '0.5rem 0.75rem' }}>
                <Lock size={18} style={{ color: '#6b7280', marginRight: '0.5rem' }} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{ background: 'transparent', border: 'none', color: '#fff', outline: 'none', width: '100%' }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem',
                backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '0.75rem',
                borderRadius: '0.5rem', fontSize: '1rem', fontWeight: '600', cursor: 'pointer', marginTop: '0.5rem'
              }}
            >
              {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Get Started Free')}
              <ArrowRight size={18} />
            </button>
          </form>

          <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem', color: '#6b7280' }}>
            {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
            <button
              onClick={() => setIsLogin(!isLogin)}
              style={{ background: 'none', border: 'none', color: '#60a5fa', cursor: 'pointer', fontWeight: '600' }}
            >
              {isLogin ? 'Sign Up' : 'Log In'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
