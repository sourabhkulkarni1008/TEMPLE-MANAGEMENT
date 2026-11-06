import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useDevice } from '../../utils/useDevice';
import { Landmark, AlertCircle, Eye, EyeOff, Monitor } from 'lucide-react';
import OtpVerificationModal from '../../components/OtpVerificationModal';

const Login = ({ defaultRole = 'PILGRIM' }) => {
  const { isMobile } = useDevice();
  const [role, setRole] = useState(defaultRole);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [devCode, setDevCode] = useState('');

  const { login, logout, sendOtp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Sync role state from URL if path is /staff/login or /admin/login
  React.useEffect(() => {
    if (location.pathname.includes('/admin')) setRole('ADMIN');
    else if (location.pathname.includes('/staff')) setRole('STAFF');
    else setRole(defaultRole || 'PILGRIM');
  }, [location.pathname, defaultRole]);

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
        // Pilgrim users enter the 6-digit email verification code
        setLoggedInUser(user);
        sendOtp(user.email)
          .then((otpRes) => {
            if (otpRes?.devCode) setDevCode(otpRes.devCode);
          })
          .catch(() => {});
        setShowOtpModal(true);
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerificationSuccess = () => {
    navigate('/user/dashboard');
  };

  return (
    <div className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 200px)' }}>
      <div style={{ maxWidth: '460px', width: '100%', padding: '0 1rem' }}>
        <div className="card card-gold-trim glass-card" style={{ padding: isMobile ? '1.75rem 1.25rem' : '2.25rem' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
            <div style={{ 
              display: 'inline-flex', 
              background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)', 
              border: '1px solid #fde68a',
              color: '#c2410c', 
              padding: '12px', 
              borderRadius: '50%', 
              marginBottom: '0.75rem',
              boxShadow: '0 4px 12px rgba(245, 158, 11, 0.2)'
            }}>
              <Landmark size={30} />
            </div>
            <h2 style={{ fontSize: isMobile ? '1.35rem' : '1.5rem', marginBottom: '4px', fontWeight: 800 }}>
              Temple Portal Access
            </h2>
            <p style={{ fontSize: '0.88rem', color: '#64748b' }}>
              Sign in to manage darshan passes, duty rosters, or administrative telemetry
            </p>
          </div>

          {/* Role Switch Tabs: Accessible on all devices (Mobile & Desktop) */}
          <div style={{ display: 'flex', background: '#f8f4ec', padding: '5px', borderRadius: '10px', marginBottom: '1.65rem', gap: '4px', border: '1px solid #ede4d3' }}>
              <button
                type="button"
                onClick={() => { setRole('PILGRIM'); setError(''); }}
                style={{
                  flex: 1,
                  padding: '7px 0',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '0.84rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  background: role === 'PILGRIM' ? '#ffffff' : 'transparent',
                  color: role === 'PILGRIM' ? '#c2410c' : '#64748b',
                  boxShadow: role === 'PILGRIM' ? '0 2px 6px rgba(15,23,42,0.08)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                Pilgrim
              </button>
              <button
                type="button"
                onClick={() => { setRole('STAFF'); setError(''); }}
                style={{
                  flex: 1,
                  padding: '7px 0',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '0.84rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  background: role === 'STAFF' ? '#ffffff' : 'transparent',
                  color: role === 'STAFF' ? '#c2410c' : '#64748b',
                  boxShadow: role === 'STAFF' ? '0 2px 6px rgba(15,23,42,0.08)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                Staff
              </button>
              <button
                type="button"
                onClick={() => { setRole('ADMIN'); setError(''); }}
                style={{
                  flex: 1,
                  padding: '7px 0',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '0.84rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  background: role === 'ADMIN' ? '#ffffff' : 'transparent',
                  color: role === 'ADMIN' ? '#c2410c' : '#64748b',
                  boxShadow: role === 'ADMIN' ? '0 2px 6px rgba(15,23,42,0.08)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                Admin
              </button>
            </div>

          {error && (
            <div className="alert alert-danger" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.75rem', marginBottom: '1.25rem' }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span style={{ fontSize: '0.85rem' }}>{error}</span>
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
              {loading ? 'Authenticating...' : (isMobile ? 'Log In as Pilgrim' : `Log In as ${role}`)}
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
        devCode={devCode}
        title="Email Verification Code"
        subtitle="Please enter the 6-digit code sent to your email to unlock Darshan ticket booking"
        onClose={() => setShowOtpModal(false)}
        onSuccess={handleVerificationSuccess}
      />
    </div>
  );
};

export default Login;
