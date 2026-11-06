import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Landmark, UserPlus, AlertCircle, Eye, EyeOff } from 'lucide-react';
import OtpVerificationModal from '../../components/OtpVerificationModal';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [devCode, setDevCode] = useState('');

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      const regRes = await register({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password
      });
      if (regRes?.devCode) {
        setDevCode(regRes.devCode);
      }
      // Show OTP verification modal immediately
      setShowOtpModal(true);
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerificationSuccess = () => {
    navigate('/user/book-darshan');
  };

  return (
    <div className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 180px)', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: '500px', width: '100%' }}>
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
              <UserPlus size={32} />
            </div>
            <h2 className="temple-gradient-text" style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '6px' }}>
              Create Pilgrim Account
            </h2>
            <p style={{ fontSize: '0.875rem', color: '#64748b', maxWidth: '380px', margin: '0 auto' }}>
              Register to book special darshan slots, receive instant e-passes, and access live temple crowd telemetry.
            </p>
          </div>

          {error && (
            <div className="alert alert-danger" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '0.85rem 1rem', borderRadius: '10px', marginBottom: '1.25rem' }}>
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group" style={{ marginBottom: '1.1rem' }}>
              <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>Full Devotee Name</label>
              <input
                type="text"
                name="name"
                className="form-input"
                required
                placeholder="e.g. Ramesh Kulkarni"
                value={formData.name}
                onChange={handleChange}
                style={{ borderRadius: '8px' }}
              />
            </div>

            <div className="form-group" style={{ marginBottom: '1.1rem' }}>
              <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>Email Address</label>
              <input
                type="email"
                name="email"
                className="form-input"
                required
                placeholder="ramesh@example.com"
                value={formData.email}
                onChange={handleChange}
                style={{ borderRadius: '8px' }}
              />
            </div>

            <div className="form-group" style={{ marginBottom: '1.1rem' }}>
              <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>Mobile Number</label>
              <input
                type="tel"
                name="phone"
                className="form-input"
                required
                placeholder="+91 98765 43210"
                value={formData.phone}
                onChange={handleChange}
                style={{ borderRadius: '8px' }}
              />
            </div>

            <div className="grid-2" style={{ gap: '1rem', marginBottom: '1.25rem' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>Password</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    className="form-input"
                    required
                    placeholder="Min 6 chars"
                    value={formData.password}
                    onChange={handleChange}
                    style={{ paddingRight: '40px', width: '100%', borderRadius: '8px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      background: 'none',
                      border: 'none',
                      color: '#94a3b8',
                      cursor: 'pointer',
                      padding: '4px',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>Confirm Password</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    className="form-input"
                    required
                    placeholder="Re-type password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    style={{ paddingRight: '40px', width: '100%', borderRadius: '8px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      background: 'none',
                      border: 'none',
                      color: '#94a3b8',
                      cursor: 'pointer',
                      padding: '4px',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ 
                width: '100%', 
                marginBottom: '1.5rem',
                padding: '0.85rem',
                fontSize: '0.95rem',
                fontWeight: 700,
                letterSpacing: '0.02em',
                borderRadius: '8px',
                boxShadow: '0 4px 14px rgba(217, 119, 6, 0.35)'
              }} 
              disabled={loading}
            >
              {loading ? 'Creating Devotee Account...' : 'Register Pilgrim Account'}
            </button>
          </form>

          <div style={{ textAlign: 'center', fontSize: '0.9rem', color: '#64748b', borderTop: '1px solid rgba(226, 232, 240, 0.8)', paddingTop: '1.25rem' }}>
            Already registered?{' '}
            <Link to="/login" style={{ fontWeight: 700, color: '#d97706', textDecoration: 'none' }}>
              Sign In to Your Account &rarr;
            </Link>
          </div>
        </div>
      </div>

      <OtpVerificationModal
        isOpen={showOtpModal}
        targetEmail={formData.email}
        devCode={devCode}
        title="Verify Email to Activate Account"
        subtitle="Enter the 6-digit code sent to your email to unlock Darshan booking"
        onClose={() => setShowOtpModal(false)}
        onSuccess={handleVerificationSuccess}
      />
    </div>
  );
};

export default Register;
