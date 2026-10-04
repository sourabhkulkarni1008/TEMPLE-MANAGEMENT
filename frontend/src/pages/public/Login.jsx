import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Landmark, Lock, Mail, UserCheck, ShieldCheck, AlertCircle, Eye, EyeOff } from 'lucide-react';
import OtpVerificationModal from '../../components/OtpVerificationModal';

const Login = ({ defaultRole = 'PILGRIM' }) => {
  const [role, setRole] = useState(defaultRole);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState(null);

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
      const result = await login(email, password, role);
      const user = result.user || result;

      if (user.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else if (user.role === 'STAFF') {
        navigate('/staff/dashboard');
      } else {
        // Pilgrim users MUST enter the 6-digit email verification code sent to their email
        setLoggedInUser(user);
        setShowOtpModal(true);
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerificationSuccess = () => {
    navigate('/user/book-darshan');
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
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ paddingRight: '42px', width: '100%' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  title={showPassword ? 'Hide password' : 'Show password'}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    background: 'none',
                    border: 'none',
                    color: '#64748b',
                    cursor: 'pointer',
                    padding: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '4px'
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginBottom: '1.25rem' }} disabled={loading}>
              {loading ? 'Authenticating...' : `Log In as ${role}`}
            </button>
          </form>

          <div style={{ textAlign: 'center', fontSize: '0.85rem', color: '#64748b' }}>
            Don't have a pilgrim account? <Link to="/register" style={{ fontWeight: 600 }}>Register here</Link>
          </div>
        </div>
      </div>

      <OtpVerificationModal
        isOpen={showOtpModal}
        targetEmail={loggedInUser?.email || email}
        title="Email Verification Code"
        subtitle="Please enter the 6-digit code sent to your email to unlock Darshan ticket booking"
        onClose={() => setShowOtpModal(false)}
        onSuccess={handleVerificationSuccess}
      />
    </div>
  );
};

export default Login;
