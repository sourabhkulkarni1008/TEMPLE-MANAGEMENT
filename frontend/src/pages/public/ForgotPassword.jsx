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
    <div className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ maxWidth: '420px', width: '100%', padding: '0 1rem' }}>
        <div className="card" style={{ padding: '2rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <div style={{ display: 'inline-flex', background: '#fef3c7', color: '#b45309', padding: '10px', borderRadius: '50%', marginBottom: '0.5rem' }}>
              <KeyRound size={28} />
            </div>
            <h2 style={{ fontSize: '1.35rem', marginBottom: '4px' }}>Reset Password</h2>
            <p style={{ fontSize: '0.85rem' }}>Enter your registered email address to receive password reset instructions</p>
          </div>

          {submitted ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ display: 'inline-flex', color: '#16a34a', marginBottom: '0.5rem' }}>
                <CheckCircle2 size={36} />
              </div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Instructions Dispatched</h3>
              <p style={{ fontSize: '0.875rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                If an account matches <strong>{email}</strong>, a secure reset link has been dispatched to your inbox.
              </p>
              <Link to="/login" className="btn btn-primary" style={{ width: '100%' }}>
                Return to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {error && (
                <div className="alert alert-danger" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.75rem' }}>
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Registered Email</label>
                <input
                  type="email"
                  className="form-input"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginBottom: '1rem' }} disabled={loading}>
                {loading ? 'Sending Instructions...' : 'Send Reset Link'}
              </button>

              <div style={{ textAlign: 'center' }}>
                <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', color: '#64748b' }}>
                  <ArrowLeft size={14} /> Back to Login
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
