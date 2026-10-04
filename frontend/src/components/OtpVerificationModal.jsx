import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Mail, CheckCircle2, AlertCircle, RefreshCw, X, Lock } from 'lucide-react';

const OtpVerificationModal = ({ isOpen, onClose, onSuccess, targetEmail, title = 'Verify Email Code', subtitle }) => {
  const { verifyOtp, sendOtp, user } = useAuth();
  const email = targetEmail || user?.email || '';

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const inputRefs = useRef([]);

  // Timer countdown
  useEffect(() => {
    if (!isOpen) return;
    setCountdown(60);
    setCanResend(false);
    setError('');
    setSuccessMsg('');
    setOtp(['', '', '', '', '', '']);

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Auto-focus first input
    setTimeout(() => {
      if (inputRefs.current[0]) {
        inputRefs.current[0].focus();
      }
    }, 150);

    return () => clearInterval(timer);
  }, [isOpen, email]);

  if (!isOpen) return null;

  const handleInputChange = (index, value) => {
    // Only accept numeric character
    const val = value.replace(/\D/g, '');
    if (!val && value !== '') return;

    const newOtp = [...otp];

    if (val.length > 1) {
      // User pasted or typed multiple digits
      const pastedDigits = val.slice(0, 6).split('');
      pastedDigits.forEach((d, i) => {
        if (index + i < 6) newOtp[index + i] = d;
      });
      setOtp(newOtp);
      const nextFocus = Math.min(index + pastedDigits.length, 5);
      if (inputRefs.current[nextFocus]) inputRefs.current[nextFocus].focus();
      return;
    }

    newOtp[index] = val;
    setOtp(newOtp);

    // Auto-focus next input
    if (val && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0 && inputRefs.current[index - 1]) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleVerify = async (e) => {
    if (e) e.preventDefault();
    const fullCode = otp.join('');
    if (fullCode.length !== 6) {
      setError('Please enter all 6 digits of the verification code.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await verifyOtp(fullCode, email);
      setSuccessMsg('Email verified successfully! Darshan ticket booking is now unlocked.');
      setTimeout(() => {
        if (onSuccess) onSuccess(res);
        if (onClose) onClose();
      }, 1000);
    } catch (err) {
      setError(err.message || 'Invalid verification code. Please check your email and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend || resending) return;
    setResending(true);
    setError('');
    setSuccessMsg('');

    try {
      await sendOtp(email);
      setSuccessMsg(`A fresh 6-digit code has been sent to ${email}`);
      setCountdown(60);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
      if (inputRefs.current[0]) inputRefs.current[0].focus();
    } catch (err) {
      setError(err.message || 'Failed to resend code. Please try again.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        animation: 'fadeIn 0.2s ease-out'
      }}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          maxWidth: '460px',
          width: '100%',
          overflow: 'hidden',
          boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
          border: '1.5px solid #d97706',
          position: 'relative'
        }}
      >
        {/* Close Button if dismissible */}
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '14px',
              right: '14px',
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={20} />
          </button>
        )}

        {/* Header Ribbon */}
        <div
          style={{
            background: 'linear-gradient(135deg, #0f172a 0%, #311302 50%, #b45309 100%)',
            color: '#ffffff',
            padding: '24px 20px 20px',
            textAlign: 'center',
            borderBottom: '3px solid #f59e0b'
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              background: '#fef3c7',
              color: '#b45309',
              padding: '10px',
              borderRadius: '50%',
              marginBottom: '10px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }}
          >
            <ShieldCheck size={28} />
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 4px 0', color: '#ffffff' }}>
            {title}
          </h2>
          <p style={{ fontSize: '0.825rem', color: '#fef08a', margin: 0, opacity: 0.95 }}>
            {subtitle || 'Required to unlock temple ticket reservations and digital QR passes'}
          </p>
        </div>

        <div style={{ padding: '24px 22px' }}>
          {/* Target Email Info Badge */}
          <div
            style={{
              background: '#fffbeb',
              border: '1px solid #fde68a',
              borderRadius: '8px',
              padding: '10px 14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '10px',
              marginBottom: '1rem',
              fontSize: '0.85rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
              <Mail size={18} color="#b45309" />
              <div style={{ color: '#78350f', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                Code sent to: <strong>{email}</strong> <span style={{ opacity: 0.8, fontSize: '0.8rem' }}>(Valid for 5 mins)</span>
              </div>
            </div>
          </div>

          <div
            style={{
              fontSize: '0.78rem',
              color: '#64748b',
              marginBottom: '1rem',
              textAlign: 'center',
              background: '#f8fafc',
              border: '1px dashed #cbd5e1',
              borderRadius: '6px',
              padding: '6px 10px'
            }}
          >
            💡 <em>Check your <strong>Spam / Junk</strong> or <strong>Promotions</strong> folder if not seen in your main inbox.</em>
          </div>

          {error && (
            <div
              className="alert alert-danger"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '1.25rem',
                fontSize: '0.85rem',
                padding: '10px 12px'
              }}
            >
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div
              className="alert alert-success"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '1.25rem',
                fontSize: '0.85rem',
                padding: '10px 12px',
                background: '#dcfce7',
                color: '#166534',
                borderColor: '#86efac'
              }}
            >
              <CheckCircle2 size={18} />
              <span>{successMsg}</span>
            </div>
          )}

          {/* 6 Digit Input Boxes */}
          <form onSubmit={handleVerify}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '1.5rem' }}>
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => (inputRefs.current[idx] = el)}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleInputChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  style={{
                    width: '46px',
                    height: '52px',
                    fontSize: '1.4rem',
                    fontWeight: '800',
                    textAlign: 'center',
                    border: digit ? '2px solid #b45309' : '1.5px solid #cbd5e1',
                    background: digit ? '#fffbeb' : '#f8fafc',
                    color: '#0f172a',
                    borderRadius: '8px',
                    outline: 'none',
                    transition: 'all 0.15s ease',
                    boxShadow: digit ? '0 0 0 3px rgba(180, 83, 9, 0.15)' : 'none'
                  }}
                />
              ))}
            </div>

            {/* Verify Button */}
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || otp.join('').length !== 6}
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '0.95rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #b45309, #92400e)'
              }}
            >
              {loading ? (
                <>
                  <RefreshCw size={18} className="spin-slow" />
                  <span>Verifying Code...</span>
                </>
              ) : (
                <>
                  <Lock size={18} />
                  <span>Verify Code &amp; Unlock Booking</span>
                </>
              )}
            </button>
          </form>

          {/* Resend Code Section */}
          <div
            style={{
              marginTop: '1.25rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '0.825rem',
              color: '#64748b',
              borderTop: '1px solid #f1f5f9',
              paddingTop: '1rem'
            }}
          >
            <span>Didn't receive code?</span>
            {canResend ? (
              <button
                type="button"
                onClick={handleResend}
                disabled={resending}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#b45309',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: 0
                }}
              >
                <RefreshCw size={14} className={resending ? 'spin-slow' : ''} />
                <span>{resending ? 'Sending...' : 'Resend Code'}</span>
              </button>
            ) : (
              <span style={{ color: '#94a3b8' }}>
                Resend in <strong>{countdown}s</strong>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OtpVerificationModal;
