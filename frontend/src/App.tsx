import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

/* ── Lazy-load pages: code-splits bundle AND isolates crashes ── */
const LandingPage   = lazy(() => import('./pages/LandingPage').then(m => ({ default: m.LandingPage })));
const AuthPage      = lazy(() => import('./pages/AuthPage').then(m => ({ default: m.AuthPage })));
const DashboardPage = lazy(() => import('./pages/DashboardPage').then(m => ({ default: m.DashboardPage })));
const WorkspacePage = lazy(() => import('./pages/WorkspacePage').then(m => ({ default: m.WorkspacePage })));
const PricingPage   = lazy(() => import('./pages/PricingPage').then(m => ({ default: m.PricingPage })));

/* ── Spinner shown while lazy chunks download ── */
function PageLoader() {
  return (
    <div style={{ minHeight: '100vh', background: '#07090f', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14 }}>
      <style>{`@keyframes _spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ width: 34, height: 34, border: '3px solid rgba(99,102,241,0.2)', borderTopColor: '#6366f1', borderRadius: '50%', animation: '_spin 0.75s linear infinite' }} />
      <span style={{ fontSize: '0.8rem', color: '#475569', fontFamily: 'Inter,sans-serif' }}>Loading Craftly…</span>
    </div>
  );
}

/* ── Error screen shown when ErrorBoundary catches ── */
function ErrorScreen({ message }: { message: string }) {
  return (
    <div style={{ minHeight: '100vh', background: '#07090f', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20, padding: '2rem', fontFamily: 'Inter,sans-serif', textAlign: 'center' }}>
      <div style={{ fontSize: '2.5rem' }}>⚠️</div>
      <div>
        <h2 style={{ color: '#f8fafc', fontWeight: 700, fontSize: '1.2rem', marginBottom: 8 }}>Something went wrong</h2>
        <p style={{ color: '#64748b', fontSize: '0.85rem', maxWidth: 400, lineHeight: 1.65, margin: '0 auto' }}>{message}</p>
      </div>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
        <button onClick={() => { window.location.href = '/'; }} style={{ background: '#6366f1', color: '#fff', border: 'none', padding: '10px 22px', borderRadius: 8, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}>Go to Home</button>
        <button onClick={() => window.location.reload()} style={{ background: 'transparent', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.12)', padding: '10px 18px', borderRadius: 8, fontWeight: 500, cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}>Reload page</button>
      </div>
    </div>
  );
}

/* ── Error Boundary (class component — only way to catch render errors) ── */
type EBState = { crashed: boolean; msg: string };
class ErrorBoundary extends React.Component<React.PropsWithChildren<{}>, EBState> {
  declare state: EBState;
  declare props: React.PropsWithChildren<{}>;
  constructor(p: React.PropsWithChildren<{}>) {
    super(p);
    this.state = { crashed: false, msg: '' };
  }
  static getDerivedStateFromError(err: Error): EBState {
    return { crashed: true, msg: err.message || 'Unknown error' };
  }
  componentDidCatch(err: Error, info: React.ErrorInfo) {
    console.error('[Craftly ErrorBoundary]', err.message, info.componentStack);
  }
  render(): React.ReactNode {
    if (this.state.crashed) return <ErrorScreen message={this.state.msg} />;
    return this.props.children as React.ReactNode;
  }
}

/* ── Route guards ── */
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <>{children}</>;
}

function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public routes */}
        <Route path="/"       element={<LandingPage />} />
        <Route path="/pricing" element={<PricingPage />} />

        {/* Auth – redirects to /dashboard if already logged in */}
        <Route path="/login"  element={<PublicRoute><AuthPage /></PublicRoute>} />
        <Route path="/signup" element={<PublicRoute><AuthPage /></PublicRoute>} />

        {/* Protected – redirects to /login if not authenticated */}
        <Route path="/dashboard"   element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/project/:id" element={<ProtectedRoute><WorkspacePage /></ProtectedRoute>} />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <AppRoutes />
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}
