import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Landmark, Lock, Mail, UserCheck, ShieldCheck, AlertCircle } from 'lucide-react';

const Login = ({ defaultRole = 'PILGRIM' }) => {
  const [role, setRole] = useState(defaultRole);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // If path is /staff/login or /admin/login, sync role state
  React.useEffect(() => {
    if (location.pathname.includes('/admin')) setRole('ADMIN');
    else if (location.pathname.includes('/staff')) setRole('STAFF');
    else setRole('PILGRIM');
  }, [location.pathname]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password, role);
      if (user.role === 'ADMIN') navigate('/admin/dashboard');
      else if (user.role === 'STAFF') navigate('/staff/dashboard');
      else navigate('/user/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Quick Demo Auto-fill Helper
  const handleQuickFill = (roleType) => {
    setRole(roleType);
    if (roleType === 'ADMIN') {
      setEmail('admin@templedemo.com');
      setPassword('TemplePass@123');
    } else if (roleType === 'STAFF') {
      setEmail('staff@templedemo.com');
      setPassword('TemplePass@123');
    } else {
      setEmail('pilgrim@templedemo.com');
      setPassword('TemplePass@123');
    }
    setError('');
  };

  return (
    <div className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ maxWidth: '440px', width: '100%', padding: '0 1rem' }}>
        <div className="card" style={{ padding: '2rem' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <div style={{ display: 'inline-flex', background: '#fef3c7', color: '#b45309', padding: '10px', borderRadius: '50%', marginBottom: '0.5rem' }}>
              <Landmark size={28} />
            </div>
            <h2 style={{ fontSize: '1.35rem', marginBottom: '4px' }}>Temple Portal Login</h2>
            <p style={{ fontSize: '0.85rem' }}>Access your bookings, duty roster, or administrative tools</p>
          </div>

          {/* Role Switch Tabs */}
          <div style={{ display: 'flex', background: '#f1f5f9', padding: '4px', borderRadius: '6px', marginBottom: '1.5rem' }}>
            <button
              type="button"
              onClick={() => { setRole('PILGRIM'); setError(''); }}
              style={{
                flex: 1,
                padding: '6px 0',
                border: 'none',
                borderRadius: '4px',
                fontSize: '0.825rem',
                fontWeight: 600,
                cursor: 'pointer',
                background: role === 'PILGRIM' ? '#ffffff' : 'transparent',
                color: role === 'PILGRIM' ? '#b45309' : '#64748b',
                boxShadow: role === 'PILGRIM' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none'
              }}
            >
              Pilgrim
            </button>
            <button
              type="button"
              onClick={() => { setRole('STAFF'); setError(''); }}
              style={{
                flex: 1,
                padding: '6px 0',
                border: 'none',
                borderRadius: '4px',
                fontSize: '0.825rem',
                fontWeight: 600,
                cursor: 'pointer',
                background: role === 'STAFF' ? '#ffffff' : 'transparent',
                color: role === 'STAFF' ? '#b45309' : '#64748b',
                boxShadow: role === 'STAFF' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none'
              }}
            >
              Staff
            </button>
            <button
              type="button"
              onClick={() => { setRole('ADMIN'); setError(''); }}
              style={{
                flex: 1,
                padding: '6px 0',
                border: 'none',
                borderRadius: '4px',
                fontSize: '0.825rem',
                fontWeight: 600,
                cursor: 'pointer',
                background: role === 'ADMIN' ? '#ffffff' : 'transparent',
                color: role === 'ADMIN' ? '#b45309' : '#64748b',
                boxShadow: role === 'ADMIN' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none'
              }}
            >
              Admin
            </button>
          </div>

          {error && (
            <div className="alert alert-danger" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.75rem' }}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  className="form-input"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                <label className="form-label" style={{ margin: 0 }}>Password</label>
                <Link to="/forgot-password" style={{ fontSize: '0.775rem', color: '#b45309' }}>Forgot password?</Link>
              </div>
              <input
                type="password"
                className="form-input"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginBottom: '1.25rem' }} disabled={loading}>
              {loading ? 'Authenticating...' : `Log In as ${role}`}
            </button>
          </form>

          {/* 1-Click Evaluation Credentials for Evaluators */}
          <div style={{ background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '6px', padding: '0.75rem', marginBottom: '1.25rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '6px', textAlign: 'center' }}>
              QUICK DEMO LOGINS (Click to Auto-fill):
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px' }}>
              <button type="button" onClick={() => handleQuickFill('PILGRIM')} className="btn btn-secondary btn-sm" style={{ fontSize: '0.725rem', padding: '4px' }}>
                Pilgrim Demo
              </button>
              <button type="button" onClick={() => handleQuickFill('STAFF')} className="btn btn-secondary btn-sm" style={{ fontSize: '0.725rem', padding: '4px' }}>
                Staff Demo
              </button>
              <button type="button" onClick={() => handleQuickFill('ADMIN')} className="btn btn-secondary btn-sm" style={{ fontSize: '0.725rem', padding: '4px' }}>
                Admin Demo
              </button>
            </div>
          </div>

          <div style={{ textAlign: 'center', fontSize: '0.85rem', color: '#64748b' }}>
            Don't have a pilgrim account? <Link to="/register" style={{ fontWeight: 600 }}>Register here</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
