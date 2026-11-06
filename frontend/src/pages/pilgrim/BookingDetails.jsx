import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useDevice } from '../../utils/useDevice';
import api from '../../api/client';
import StatusBadge from '../../components/StatusBadge';
import { 
  QrCode, Calendar, Clock, Users, Printer, XCircle, ArrowLeft, 
  CheckCircle2, Mail, Check, ShieldCheck, AlertCircle, 
  CalendarCheck, FileText, AlertTriangle, Sparkles, Shield
} from 'lucide-react';

const BookingDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { isMobile } = useDevice();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailStatus, setEmailStatus] = useState('');
  const [emailSuccess, setEmailSuccess] = useState(false);

  // Reschedule Modal State
  const [showReschedule, setShowReschedule] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [rescheduleLoading, setRescheduleLoading] = useState(false);
  const [rescheduleError, setRescheduleError] = useState('');
  const [rescheduleSuccess, setRescheduleSuccess] = useState('');

  // Receipt Modal State
  const [showReceipt, setShowReceipt] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];

  const fetchBooking = async () => {
    try {
      const res = await api.get(`/bookings/${id}`);
      if (res.success && res.booking) {
        setBooking(res.booking);
      } else {
        setError('Booking details could not be found.');
      }
    } catch (err) {
      setError(err.message || 'Failed to load booking.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooking();
  }, [id]);

  const handleCancelBooking = async () => {
    if (!window.confirm('Are you sure you want to cancel this darshan reservation? Quota passes will be released to other pilgrims.')) return;
    setCancelling(true);
    try {
      const res = await api.delete(`/bookings/${id}`);
      if (res.success) {
        await fetchBooking();
      }
    } catch (err) {
      alert(err.message || 'Failed to cancel booking.');
    } finally {
      setCancelling(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleEmailPass = async () => {
    const recipientEmail = user?.email || booking?.primaryPilgrimEmail;
    if (!recipientEmail) {
      setEmailStatus('No valid email address found to send the pass.');
      return;
    }

    setSendingEmail(true);
    setEmailStatus('');
    setEmailSuccess(false);

    try {
      const data = await api.post('/email/send-pass', {
        to: recipientEmail,
        pilgrimName: booking.primaryPilgrimName,
        bookingId: booking.id,
        bookingDate: booking.bookingDate,
        slotTime: booking.slotTime,
        darshanType: booking.darshanType,
        numberOfPeople: booking.numberOfPeople,
        qrToken: booking.qrToken || booking.id,
        idProof: booking.primaryPilgrimIdProof
      });

      if (data.success) {
        setEmailSuccess(true);
        setEmailStatus(`✓ Digital Pass with QR Code has been directly sent to ${recipientEmail}!`);
      } else if (data.error) {
        setEmailStatus(`Notice: ${data.error}`);
      } else {
        setEmailSuccess(true);
        setEmailStatus(`Pass notification sent directly to ${recipientEmail}.`);
      }
    } catch (err) {
      setEmailStatus(err.message || 'Could not connect to backend email service.');
    } finally {
      setSendingEmail(false);
    }
  };

  // Open Reschedule Modal & Fetch Slots
  const handleOpenReschedule = async () => {
    if (!booking) return;
    setShowReschedule(true);
    setRescheduleDate(booking.bookingDate);
    setRescheduleError('');
    setRescheduleSuccess('');
    setSelectedSlot(null);

    try {
      const res = await api.get(`/darshan/slots?date=${booking.bookingDate}&darshanType=${encodeURIComponent(booking.darshanType)}`);
      if (res.success) {
        setAvailableSlots(res.slots || []);
        if (res.slots?.length > 0) setSelectedSlot(res.slots[0]);
      }
    } catch (err) {
      console.warn('Slot load error:', err);
    }
  };

  const handleRescheduleDateChange = async (newDate) => {
    setRescheduleDate(newDate);
    setSelectedSlot(null);
    if (!booking) return;

    try {
      const res = await api.get(`/darshan/slots?date=${newDate}&darshanType=${encodeURIComponent(booking.darshanType)}`);
      if (res.success) {
        setAvailableSlots(res.slots || []);
        if (res.slots?.length > 0) setSelectedSlot(res.slots[0]);
      }
    } catch (err) {
      console.warn('Slot load error:', err);
    }
  };

  const handleSubmitReschedule = async (e) => {
    e.preventDefault();
    if (!booking || !rescheduleDate) return;

    setRescheduleLoading(true);
    setRescheduleError('');
    setRescheduleSuccess('');

    try {
      const payload = {
        newDate: rescheduleDate,
        newSlotId: selectedSlot?.id || null,
        newSlotTime: selectedSlot ? `${selectedSlot.startTime} - ${selectedSlot.endTime}` : booking.slotTime
      };

      const res = await api.put(`/bookings/${booking.id}/reschedule`, payload);
      if (res.success) {
        setRescheduleSuccess(`Darshan Pass successfully rescheduled to ${rescheduleDate}!`);
        setTimeout(async () => {
          setShowReschedule(false);
          await fetchBooking();
        }, 1200);
      } else {
        setRescheduleError(res.message || 'Failed to reschedule booking.');
      }
    } catch (err) {
      setRescheduleError(err.message || 'Rescheduling request failed.');
    } finally {
      setRescheduleLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-content" style={{ textAlign: 'center', padding: '4rem 1rem' }}>
        <p>Loading digital pass details...</p>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="dashboard-content" style={{ maxWidth: '600px', margin: '2rem auto', padding: '1rem' }}>
        <div className="alert alert-danger">{error || 'Booking not found.'}</div>
        <Link to="/user/bookings" className="btn btn-secondary">Back to My Bookings</Link>
      </div>
    );
  }

  const isExpired = booking.bookingStatus === 'CONFIRMED' && booking.bookingDate < todayStr;
  const isPassActive = booking.bookingStatus === 'CONFIRMED' && !isExpired;

  return (
    <div className="dashboard-content" style={{ padding: isMobile ? '1rem' : '2rem' }}>
      <div style={{ maxWidth: '680px', margin: '0 auto' }}>
        
        {/* Top Action Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <Link to="/user/bookings" className="btn btn-secondary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <ArrowLeft size={15} />
            <span>All Bookings</span>
          </Link>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setShowReceipt(true)}
              className="btn btn-secondary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}
            >
              <FileText size={15} color="#b45309" />
              <span>E-Receipt</span>
            </button>
            <button
              onClick={handleEmailPass}
              disabled={sendingEmail}
              className="btn btn-primary btn-sm"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: emailSuccess ? 'linear-gradient(135deg, #16a34a, #15803d)' : 'linear-gradient(135deg, #d97706, #b45309)',
                border: 'none',
                cursor: sendingEmail ? 'not-allowed' : 'pointer'
              }}
            >
              {emailSuccess ? <Check size={15} /> : <Mail size={15} />}
              <span>
                {sendingEmail ? 'Dispatching...' : (emailSuccess ? 'Pass Sent!' : 'Email QR Pass')}
              </span>
            </button>
            <button onClick={handlePrint} className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Printer size={15} />
              <span>Print Pass</span>
            </button>
          </div>
        </div>

        {emailStatus && (
          <div
            className={emailSuccess ? "alert alert-success" : "alert alert-info"}
            style={{
              marginBottom: '1rem',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              borderLeft: emailSuccess ? '4px solid #16a34a' : '4px solid #0284c7'
            }}
          >
            {emailSuccess ? <CheckCircle2 size={16} color="#16a34a" /> : <Mail size={16} color="#0284c7" />}
            <span>{emailStatus}</span>
          </div>
        )}

        {/* Dynamic QR Validity Banner */}
        <div 
          style={{
            borderRadius: '12px',
            padding: '12px 18px',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            border: isPassActive 
              ? '1.5px solid #86efac' 
              : booking.bookingStatus === 'CHECKED_IN' 
                ? '1.5px solid #93c5fd'
                : booking.bookingStatus === 'CANCELLED' 
                  ? '1.5px solid #fca5a5' 
                  : '1.5px solid #fde68a',
            background: isPassActive 
              ? 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)' 
              : booking.bookingStatus === 'CHECKED_IN' 
                ? 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)'
                : booking.bookingStatus === 'CANCELLED' 
                  ? 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)' 
                  : 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
          }}
        >
          {isPassActive && (
            <>
              <div style={{ background: '#16a34a', color: '#ffffff', padding: '8px', borderRadius: '50%', display: 'flex' }}>
                <ShieldCheck size={20} />
              </div>
              <div>
                <strong style={{ color: '#166534', fontSize: '0.9rem', display: 'block' }}>
                  ACTIVE &amp; VALID GATE PASS
                </strong>
                <span style={{ fontSize: '0.8rem', color: '#14532d' }}>
                  Pass authorized for entry at Gate 1 Turnstiles on {booking.bookingDate} ({booking.slotTime}).
                </span>
              </div>
            </>
          )}

          {booking.bookingStatus === 'CHECKED_IN' && (
            <>
              <div style={{ background: '#2563eb', color: '#ffffff', padding: '8px', borderRadius: '50%', display: 'flex' }}>
                <CheckCircle2 size={20} />
              </div>
              <div>
                <strong style={{ color: '#1e40af', fontSize: '0.9rem', display: 'block' }}>
                  DARSHAN ENTRY COMPLETED
                </strong>
                <span style={{ fontSize: '0.8rem', color: '#1e3a8a' }}>
                  Pass scanned and verified at Temple Gate on {new Date(booking.checkedInAt).toLocaleString()} by {booking.checkedInBy || 'Gate Staff'}.
                </span>
              </div>
            </>
          )}

          {booking.bookingStatus === 'CANCELLED' && (
            <>
              <div style={{ background: '#dc2626', color: '#ffffff', padding: '8px', borderRadius: '50%', display: 'flex' }}>
                <XCircle size={20} />
              </div>
              <div>
                <strong style={{ color: '#991b1b', fontSize: '0.9rem', display: 'block' }}>
                  PASS CANCELLED &amp; INVALIDATED
                </strong>
                <span style={{ fontSize: '0.8rem', color: '#7f1d1d' }}>
                  This pass was cancelled. The QR barcode token has been revoked and slot quota released. Entry will be denied.
                </span>
              </div>
            </>
          )}

          {isExpired && (
            <>
              <div style={{ background: '#d97706', color: '#ffffff', padding: '8px', borderRadius: '50%', display: 'flex' }}>
                <AlertTriangle size={20} />
              </div>
              <div>
                <strong style={{ color: '#92400e', fontSize: '0.9rem', display: 'block' }}>
                  PASS EXPIRED
                </strong>
                <span style={{ fontSize: '0.8rem', color: '#78350f' }}>
                  The scheduled date for this darshan ({booking.bookingDate}) has passed. Expired passes cannot be scanned.
                </span>
              </div>
            </>
          )}
        </div>

        {/* Digital Pass Card */}
        <div className="digital-pass-card" style={{ padding: isMobile ? '1.5rem 1.15rem' : '2.25rem', position: 'relative' }}>
          <div className="pass-watermark" />
          
          {/* Header */}
          <div style={{ textAlign: 'center', borderBottom: '1px solid rgba(245, 158, 11, 0.25)', paddingBottom: '1.4rem', marginBottom: '1.75rem', position: 'relative', zIndex: 2 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'linear-gradient(135deg, #fffbeb, #fef3c7)', border: '1px solid #fde68a', color: '#92400e', padding: '3px 12px', borderRadius: '20px', fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>
              Official Digital Darshan Entry Pass
            </div>
            <h1 style={{ fontSize: isMobile ? '1.35rem' : '1.65rem', color: '#0f172a', margin: '4px 0', fontWeight: 800, fontFamily: 'Outfit, sans-serif' }}>
              Shree Siddhivinayak Temple
            </h1>
            <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '2px 0 8px' }}>Prabhadevi, Mumbai &bull; Verified Biometric Gate Token</p>
            <div style={{ display: 'inline-block' }}>
              <StatusBadge status={booking.bookingStatus} />
            </div>
          </div>

          {/* QR Code Container */}
          <div style={{ textAlign: 'center', marginBottom: '1.75rem', position: 'relative', zIndex: 2 }}>
            {booking.qrDataUrl ? (
              <div style={{ display: 'inline-block', padding: '10px', background: '#ffffff', border: '2px solid rgba(245, 158, 11, 0.4)', borderRadius: '14px', boxShadow: '0 8px 24px rgba(245, 158, 11, 0.2)' }}>
                <img
                  src={booking.qrDataUrl}
                  alt="Darshan QR Entry Pass"
                  style={{
                    width: '190px',
                    height: '190px',
                    display: 'block',
                    filter: booking.bookingStatus === 'CANCELLED' ? 'grayscale(100%) opacity(40%)' : 'none'
                  }}
                />
              </div>
            ) : (
              <div style={{ width: '180px', height: '180px', background: '#f8f4ec', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '12px', border: '1px dashed #ca8a04' }}>
                <QrCode size={64} color="#ca8a04" />
              </div>
            )}
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#c2410c', marginTop: '10px', fontFamily: 'monospace', letterSpacing: '0.05em' }}>
              Pass #{booking.id}
            </div>
            {booking.qrToken && (
              <div style={{ fontSize: '0.82rem', color: '#0f172a', fontWeight: 700, marginTop: '6px', fontFamily: 'monospace', background: 'linear-gradient(135deg, #fffbeb, #fef3c7)', padding: '5px 12px', borderRadius: '8px', display: 'inline-block', border: '1px dashed #d97706' }}>
                Turnstile Gate Key: {booking.qrToken}
              </div>
            )}
            <div style={{ fontSize: '0.78rem', color: isPassActive ? '#166534' : '#64748b', fontWeight: 700, marginTop: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
              <CheckCircle2 size={14} color={isPassActive ? '#16a34a' : '#94a3b8'} /> 
              {isPassActive ? 'Ready for Scanning at Gate 1 Turnstiles' : 'Turnstile Barcode Inactive'}
            </div>
          </div>

          {/* Booking Data Grid */}
          <div style={{ background: '#fcfbf8', border: '1px solid rgba(245, 158, 11, 0.2)', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.25rem', position: 'relative', zIndex: 2 }}>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '1rem', fontSize: '0.88rem' }}>
              <div>
                <span style={{ color: '#78716c', display: 'block', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>PRIMARY DEVOTEE</span>
                <strong style={{ color: '#0f172a', fontSize: '0.95rem' }}>{booking.primaryPilgrimName}</strong>
              </div>
              <div>
                <span style={{ color: '#78716c', display: 'block', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>CONTACT PHONE</span>
                <strong style={{ color: '#0f172a', fontSize: '0.95rem' }}>{booking.primaryPilgrimPhone}</strong>
              </div>
              <div>
                <span style={{ color: '#78716c', display: 'block', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>VISITING DATE</span>
                <strong style={{ color: '#c2410c', fontSize: '0.95rem' }}>{booking.bookingDate}</strong>
              </div>
              <div>
                <span style={{ color: '#78716c', display: 'block', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>TIME SLOT</span>
                <strong style={{ color: '#c2410c', fontSize: '0.95rem' }}>{booking.slotTime}</strong>
              </div>
              <div>
                <span style={{ color: '#78716c', display: 'block', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>DARSHAN CATEGORY</span>
                <strong style={{ color: '#0f172a', fontSize: '0.95rem' }}>{booking.darshanType}</strong>
              </div>
              <div>
                <span style={{ color: '#78716c', display: 'block', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>TOTAL DEVOTEES</span>
                <strong style={{ color: '#0f172a', fontSize: '0.95rem' }}>{booking.numberOfPeople} Devotee(s)</strong>
              </div>
            </div>
          </div>

          {/* Accompanying Family Members Table / List */}
          {booking.familyMembers && booking.familyMembers.length > 0 && (
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1rem 1.25rem', marginBottom: '1.25rem', position: 'relative', zIndex: 2 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.75rem' }}>
                <Users size={16} color="#b45309" />
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Accompanying Family Members ({booking.familyMembers.length})
                </h4>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {booking.familyMembers.map((fam, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '8px 12px', fontSize: '0.825rem' }}>
                    <div>
                      <strong style={{ color: '#0f172a' }}>{idx + 2}. {fam.name}</strong>
                      <span style={{ color: '#64748b', marginLeft: '6px' }}>({fam.age} yrs, {fam.gender})</span>
                    </div>
                    {fam.idProofNumber ? (
                      <span style={{ fontSize: '0.75rem', background: '#f1f5f9', color: '#475569', padding: '2px 8px', borderRadius: '6px' }}>
                        ID: {fam.idProofNumber}
                      </span>
                    ) : (
                      <span style={{ fontSize: '0.72rem', color: '#166534', fontWeight: 600 }}>
                        Pass Registered
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Row for Confirmed Bookings: Reschedule or Cancel */}
          {booking.bookingStatus === 'CONFIRMED' && !isExpired && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', borderTop: '1px solid #e2e8f0', paddingTop: '1.25rem', position: 'relative', zIndex: 2, flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={handleOpenReschedule}
                className="btn btn-secondary btn-sm"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: '#b45309', borderColor: '#fde68a' }}
              >
                <CalendarCheck size={16} />
                <span>Reschedule Slot</span>
              </button>
              <button
                type="button"
                onClick={handleCancelBooking}
                disabled={cancelling}
                className="btn btn-danger btn-sm"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <XCircle size={15} />
                <span>{cancelling ? 'Cancelling...' : 'Cancel Reservation'}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================
          RESCHEDULE MODAL
          ======================================================== */}
      {showReschedule && (
        <div className="modal-overlay" style={{ backdropFilter: 'blur(8px)', background: 'rgba(15, 23, 42, 0.65)' }}>
          <div className="modal-content glass-card" style={{ maxWidth: '500px', borderRadius: '16px', overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', padding: '1.25rem 1.5rem', background: 'linear-gradient(135deg, #fffbeb, #fef3c7)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CalendarCheck size={20} color="#b45309" />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#78350f', margin: 0 }}>
                  Reschedule Darshan Pass
                </h3>
              </div>
              <button 
                onClick={() => setShowReschedule(false)} 
                aria-label="Close dialog"
                style={{ background: 'none', border: 'none', fontSize: '1.4rem', color: '#94a3b8', cursor: 'pointer' }}
              >
                &times;
              </button>
            </div>

            <div style={{ padding: '1.75rem 1.5rem' }}>
              {rescheduleError && (
                <div className="alert alert-danger" style={{ marginBottom: '1rem', padding: '0.75rem 1rem', borderRadius: '8px', fontSize: '0.85rem' }}>
                  {rescheduleError}
                </div>
              )}
              {rescheduleSuccess && (
                <div className="alert alert-success" style={{ marginBottom: '1rem', padding: '0.75rem 1rem', borderRadius: '8px', fontSize: '0.85rem' }}>
                  {rescheduleSuccess}
                </div>
              )}

              <form onSubmit={handleSubmitReschedule}>
                <div className="form-group" style={{ marginBottom: '1.1rem' }}>
                  <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>Select New Darshan Date</label>
                  <input
                    type="date"
                    className="form-input"
                    required
                    min={todayStr}
                    value={rescheduleDate}
                    onChange={(e) => handleRescheduleDateChange(e.target.value)}
                    style={{ borderRadius: '8px' }}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                  <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                    Select Available Time Window ({booking.darshanType.split('(')[0]})
                  </label>

                  {availableSlots.length === 0 ? (
                    <div style={{ fontSize: '0.85rem', color: '#64748b', padding: '0.75rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      Loading available quotas for {rescheduleDate}...
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {availableSlots.map((slot) => {
                        const remaining = Math.max(0, slot.capacity - slot.bookedCount);
                        const isSelected = selectedSlot?.id === slot.id;
                        const isFull = remaining < (booking.numberOfPeople || 1);

                        return (
                          <div
                            key={slot.id}
                            onClick={() => !isFull && setSelectedSlot(slot)}
                            style={{
                              padding: '10px 14px',
                              borderRadius: '8px',
                              border: isSelected ? '2px solid #d97706' : '1px solid #e2e8f0',
                              background: isSelected ? '#fffbeb' : (isFull ? '#f1f5f9' : '#ffffff'),
                              cursor: isFull ? 'not-allowed' : 'pointer',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              opacity: isFull ? 0.6 : 1
                            }}
                          >
                            <div>
                              <strong style={{ fontSize: '0.9rem', color: '#0f172a' }}>{slot.startTime} - {slot.endTime}</strong>
                              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Capacity: {slot.capacity} pilgrims</div>
                            </div>
                            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: isFull ? '#dc2626' : '#16a34a' }}>
                              {isFull ? 'Full' : `${remaining} passes remaining`}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <button 
                    type="button" 
                    onClick={() => setShowReschedule(false)} 
                    className="btn btn-secondary"
                    style={{ borderRadius: '8px' }}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary" 
                    disabled={rescheduleLoading || !selectedSlot}
                    style={{ borderRadius: '8px', fontWeight: 800 }}
                  >
                    {rescheduleLoading ? 'Updating Pass...' : 'Confirm Rescheduled Slot'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          DOWNLOADABLE & PRINTABLE OFFICIAL BOOKING RECEIPT MODAL
          ======================================================== */}
      {showReceipt && (
        <div className="modal-overlay" style={{ backdropFilter: 'blur(8px)', background: 'rgba(15, 23, 42, 0.7)' }}>
          <div className="modal-content glass-card card-gold-trim" style={{ padding: 0, borderRadius: '18px', maxWidth: '600px', overflow: 'hidden' }}>
            
            {/* Receipt Action Bar */}
            <div style={{ background: '#0f172a', padding: '12px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#fbbf24', fontSize: '0.85rem', fontWeight: 700 }}>
                Official Temple Pass Receipt
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  onClick={() => window.print()}
                  className="btn btn-primary btn-sm"
                  style={{ fontWeight: 700, padding: '4px 10px', fontSize: '0.78rem' }}
                >
                  <Printer size={13} /> Print / Save PDF
                </button>
                <button 
                  onClick={() => setShowReceipt(false)}
                  style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '1.2rem' }}
                >
                  &times;
                </button>
              </div>
            </div>

            {/* Printable Receipt Paper Body */}
            <div id="temple-receipt-paper" style={{ padding: '2rem', background: '#ffffff', color: '#0f172a' }}>
              <div style={{ textAlign: 'center', borderBottom: '2px dashed #e2e8f0', paddingBottom: '1.25rem', marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#b45309', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Shree Siddhivinayak Temple Trust (Prabhadevi, Mumbai)
                </div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0f172a', margin: '4px 0' }}>
                  Official Darshan E-Receipt &amp; Gate Token
                </h2>
                <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>
                  Smart Pilgrim Flow Management &bull; Pass #{booking.id}
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
                <div>
                  <span style={{ color: '#64748b', fontSize: '0.75rem', display: 'block' }}>PRIMARY DEVOTEE</span>
                  <strong>{booking.primaryPilgrimName}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b', fontSize: '0.75rem', display: 'block' }}>REGISTERED CONTACT</span>
                  <strong>{booking.primaryPilgrimPhone}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b', fontSize: '0.75rem', display: 'block' }}>VISIT DATE</span>
                  <strong>{booking.bookingDate}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b', fontSize: '0.75rem', display: 'block' }}>TIME WINDOW</span>
                  <strong>{booking.slotTime}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b', fontSize: '0.75rem', display: 'block' }}>DARSHAN CATEGORY</span>
                  <strong style={{ color: '#b45309' }}>{booking.darshanType}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b', fontSize: '0.75rem', display: 'block' }}>VISITOR COUNT</span>
                  <strong>{booking.numberOfPeople} Person(s)</strong>
                </div>
              </div>

              {/* Family Members Breakdown in Receipt */}
              {booking.familyMembers && booking.familyMembers.length > 0 && (
                <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '1.25rem' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Accompanying Family Members:
                  </div>
                  {booking.familyMembers.map((fam, i) => (
                    <div key={i} style={{ fontSize: '0.825rem', display: 'flex', justifyContent: 'space-between', padding: '3px 0' }}>
                      <span>&bull; {fam.name} ({fam.age} yrs, {fam.gender})</span>
                      <span style={{ color: '#64748b' }}>{fam.idProofNumber || 'Pass Registered'}</span>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fffbeb', border: '1px solid #fde68a', padding: '12px 16px', borderRadius: '8px', marginBottom: '1.25rem' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#92400e', fontWeight: 700 }}>PAYMENT &amp; VALIDITY</span>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
                    {booking.totalAmount === 0 ? 'FREE SEVA PASS' : `₹${booking.totalAmount} (PAID)`}
                  </div>
                </div>
                <StatusBadge status={booking.bookingStatus} />
              </div>

              <div style={{ textAlign: 'center', fontSize: '0.75rem', color: '#64748b', borderTop: '1px solid #e2e8f0', paddingTop: '10px' }}>
                Please present your QR code pass directly at Gate 1 Turnstiles. May Lord Siddhivinayak bless your holy visit.
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default BookingDetails;
