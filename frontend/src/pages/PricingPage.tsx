import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../api/axios';
import { Check, ArrowLeft, Zap, Shield, Sparkles } from 'lucide-react';

export const PricingPage: React.FC = () => {
  const navigate = useNavigate();
  const [loadingPlan, setLoadingPlan] = useState<number | null>(null);

  const handleSubscribe = async (planId: number) => {
    setLoadingPlan(planId);
    try {
      const res = await apiClient.post<{ checkoutUrl: string }>('/api/subscriptions/checkout-session', { planId });
      if (res.data.checkoutUrl) {
        window.location.href = res.data.checkoutUrl;
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to initiate Stripe Checkout Session.');
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#090d16', color: '#f3f4f6', fontFamily: 'sans-serif', padding: '2rem 1rem' }}>
      
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
          <ArrowLeft size={18} /> Back to Dashboard
        </button>

        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: '0 0 0.5rem 0' }}>Subscription Plans</h1>
          <p style={{ color: '#9ca3af', fontSize: '1.125rem' }}>Choose the right tier for your AI application building needs</p>
        </div>

        {/* Pricing Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
          
          {/* FREE Plan */}
          <div style={{ background: '#111827', border: '1px solid #1f2937', borderRadius: '1rem', padding: '2rem', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: '0 0 0.5rem 0' }}>FREE Tier</h3>
            <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '1.5rem' }}>For hobby developers and initial experimentation</p>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>$0 <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>/ month</span></div>

            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem 0', display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1, fontSize: '0.875rem', color: '#d1d5db' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Check size={16} style={{ color: '#10b981' }} /> Up to 3 Workspace Projects</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Check size={16} style={{ color: '#10b981' }} /> 10,000 Daily Tokens</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Check size={16} style={{ color: '#10b981' }} /> 1 Running Container Preview</li>
            </ul>

            <button disabled style={{ background: '#1f2937', color: '#9ca3af', border: 'none', padding: '0.75rem', borderRadius: '0.5rem', fontWeight: '600', cursor: 'not-allowed' }}>
              Current Plan
            </button>
          </div>

          {/* PRO Plan */}
          <div style={{ background: '#111827', border: '2px solid #3b82f6', borderRadius: '1rem', padding: '2rem', display: 'flex', flexDirection: 'column', position: 'relative' }}>
            
            <div style={{ position: 'absolute', top: '-12px', right: '1.5rem', background: '#2563eb', color: '#fff', fontSize: '0.75rem', fontWeight: 'bold', padding: '0.25rem 0.75rem', borderRadius: '1rem' }}>
              MOST POPULAR
            </div>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Zap size={20} style={{ color: '#3b82f6' }} /> PRO Developer
            </h3>
            <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '1.5rem' }}>For professional full-stack engineers and creators</p>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>$29 <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>/ month</span></div>

            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem 0', display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1, fontSize: '0.875rem', color: '#d1d5db' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Check size={16} style={{ color: '#10b981' }} /> Up to 50 Workspace Projects</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Check size={16} style={{ color: '#10b981' }} /> 500,000 Monthly Tokens</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Check size={16} style={{ color: '#10b981' }} /> 5 Concurrent Container Previews</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Check size={16} style={{ color: '#10b981' }} /> Qdrant RAG Vector Search</li>
            </ul>

            <button
              onClick={() => handleSubscribe(2)}
              disabled={loadingPlan === 2}
              style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '0.75rem', borderRadius: '0.5rem', fontWeight: '600', cursor: 'pointer' }}
            >
              {loadingPlan === 2 ? 'Redirecting to Stripe...' : 'Upgrade to Pro'}
            </button>
          </div>

          {/* ENTERPRISE Plan */}
          <div style={{ background: '#111827', border: '1px solid #1f2937', borderRadius: '1rem', padding: '2rem', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Shield size={20} style={{ color: '#a855f7' }} /> ENTERPRISE
            </h3>
            <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '1.5rem' }}>Unlimited power for high-volume engineering teams</p>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>$199 <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>/ month</span></div>

            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem 0', display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1, fontSize: '0.875rem', color: '#d1d5db' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Check size={16} style={{ color: '#10b981' }} /> Unlimited Workspace Projects</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Check size={16} style={{ color: '#10b981' }} /> Unlimited AI Generation</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Check size={16} style={{ color: '#10b981' }} /> Dedicated Kafka Event Pipeline</li>
            </ul>

            <button
              onClick={() => handleSubscribe(3)}
              disabled={loadingPlan === 3}
              style={{ background: '#a855f7', color: '#fff', border: 'none', padding: '0.75rem', borderRadius: '0.5rem', fontWeight: '600', cursor: 'pointer' }}
            >
              {loadingPlan === 3 ? 'Redirecting to Stripe...' : 'Upgrade to Enterprise'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
