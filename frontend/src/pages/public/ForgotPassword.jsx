import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import { KeyRound, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/auth/forgot-password', { email });
      setSubmitted(true);
    } catch (err) {
      setError(err.message || 'Failed to request password reset.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 180px)', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: '440px', width: '100%' }}>
        <div className="card card-gold-trim glass-card" style={{ padding: '2.5rem 2rem', borderRadius: '16px' }}>
          <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
            <div style={{ 
              display: 'inline-flex', 
              background: 'linear-gradient(135deg, rgba(234, 88, 12, 0.15) 0%, rgba(217, 119, 6, 0.25) 100%)', 
              color: '#d97706', 
              padding: '14px', 
              borderRadius: '50%', 
              marginBottom: '0.75rem',
              border: '1px solid rgba(217, 119, 6, 0.3)',
              boxShadow: '0 4px 16px rgba(217, 119, 6, 0.15)'
            }}>
              <KeyRound size={32} />
            </div>
            <h2 className="temple-gradient-text" style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '6px' }}>
              Reset Password
            </h2>
            <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
              Enter your registered email address to receive password reset instructions and security tokens.
            </p>
          </div>

          {submitted ? (
            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
              <div style={{ 
                display: 'inline-flex', 
                background: 'rgba(22, 163, 74, 0.12)', 
                color: '#16a34a', 
                padding: '16px', 
                borderRadius: '50%', 
                marginBottom: '1rem',
                border: '1px solid rgba(22, 163, 74, 0.25)' 
              }}>
                <CheckCircle2 size={36} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem', color: '#0f172a' }}>Instructions Dispatched</h3>
              <p style={{ fontSize: '0.875rem', lineHeight: 1.6, marginBottom: '1.5rem', color: '#475569' }}>
                If an account matches <strong style={{ color: '#0f172a' }}>{email}</strong>, a secure reset link has been dispatched to your inbox.
              </p>
              <Link to="/login" className="btn btn-primary" style={{ width: '100%', padding: '0.8rem', fontWeight: 700 }}>
                Return to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {error && (
                <div className="alert alert-danger" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '0.85rem 1rem', borderRadius: '10px', marginBottom: '1.25rem' }}>
                  <AlertCircle size={18} style={{ flexShrink: 0 }} />
                  <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{error}</span>
                </div>
              )}

              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>Registered Email Address</label>
                <input
                  type="email"
                  className="form-input"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ borderRadius: '8px' }}
                />
              </div>

              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ 
                  width: '100%', 
                  marginBottom: '1.25rem',
                  padding: '0.85rem',
                  fontWeight: 700,
                  borderRadius: '8px',
                  boxShadow: '0 4px 14px rgba(217, 119, 6, 0.35)'
                }} 
                disabled={loading}
              >
                {loading ? 'Sending Instructions...' : 'Send Reset Link'}
              </button>

              <div style={{ textAlign: 'center', borderTop: '1px solid rgba(226, 232, 240, 0.8)', paddingTop: '1.25rem' }}>
                <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.875rem', color: '#64748b', textDecoration: 'none', fontWeight: 600 }}>
                  <ArrowLeft size={16} /> Back to Login
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
