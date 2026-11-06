import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';
import StatCard from '../../components/StatCard';
import StatusBadge from '../../components/StatusBadge';
import CrowdHeatmap from '../../components/CrowdHeatmap';
import { 
  CalendarCheck, QrCode, AlertTriangle, Eye, Clock, Users, ArrowRight, 
  RefreshCw, Calendar, CheckCircle2, XCircle, Printer, Download, Sparkles, 
  Shield, Phone, Mail, FileText, Bell, AlertCircle, Edit3, Check, X
} from 'lucide-react';

const PilgrimDashboard = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [crowdData, setCrowdData] = useState(null);
  const [queues, setQueues] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('passes'); // 'passes' | 'crowd' | 'notices' | 'services'

  // Reschedule Modal State
  const [rescheduleBookingTarget, setRescheduleBookingTarget] = useState(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [rescheduleLoading, setRescheduleLoading] = useState(false);
  const [rescheduleError, setRescheduleError] = useState('');
  const [rescheduleSuccess, setRescheduleSuccess] = useState('');

  // Receipt Modal State
  const [receiptBooking, setReceiptBooking] = useState(null);

  // Status Message
  const [actionMessage, setActionMessage] = useState('');
  const [actionError, setActionError] = useState('');

  const fetchDashboardData = async () => {
    try {
      const [bookingsRes, crowdRes, queueRes, notifRes] = await Promise.all([
        api.get('/bookings?limit=50'),
        api.get('/crowd'),
        api.get('/queue'),
        api.get('/notifications')
      ]);
      if (bookingsRes.success) setBookings(bookingsRes.bookings || []);
      if (crowdRes.success) setCrowdData(crowdRes);
      if (queueRes.success) setQueues(queueRes.queues || []);
      if (notifRes.success) setNotifications(notifRes.notifications || []);
    } catch (err) {
      console.warn('Dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 12000);
    return () => clearInterval(interval);
  }, []);

  // Compute Booking Metrics
  const todayStr = new Date().toISOString().split('T')[0];
  
  const upcomingBookings = bookings.filter(b => 
    b.bookingStatus === 'CONFIRMED' && (b.bookingDate >= todayStr)
  );

  const completedBookings = bookings.filter(b => 
    b.bookingStatus === 'CHECKED_IN' || (b.bookingStatus === 'CONFIRMED' && b.bookingDate < todayStr)
  );

  const cancelledBookings = bookings.filter(b => 
    b.bookingStatus === 'CANCELLED'
  );

  // Next Upcoming Confirmed Booking
  const nextBooking = [...upcomingBookings].sort((a, b) => 
    new Date(a.bookingDate) - new Date(b.bookingDate)
  )[0] || null;

  // Real-time Countdown Timer to Next Booking
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, isPassed: false });

  useEffect(() => {
    if (!nextBooking) return;

    const calculateTimeLeft = () => {
      // Parse slot start time if available
      let targetDateTimeStr = `${nextBooking.bookingDate}T08:00:00`;
      if (nextBooking.slotTime) {
        const timePart = nextBooking.slotTime.split('-')[0].trim(); // e.g. "09:00 AM"
        const match = timePart.match(/(\d+):(\d+)\s*(AM|PM)/i);
        if (match) {
          let hours = parseInt(match[1], 10);
          const minutes = parseInt(match[2], 10);
          const meridian = match[3].toUpperCase();
          if (meridian === 'PM' && hours < 12) hours += 12;
          if (meridian === 'AM' && hours === 12) hours = 0;
          const hStr = String(hours).padStart(2, '0');
          const mStr = String(minutes).padStart(2, '0');
          targetDateTimeStr = `${nextBooking.bookingDate}T${hStr}:${mStr}:00`;
        }
      }

      const target = new Date(targetDateTimeStr).getTime();
      const now = new Date().getTime();
      const diff = target - now;

      if (diff <= 0) {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0, isPassed: true });
      } else {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setCountdown({ days, hours, minutes, seconds, isPassed: false });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [nextBooking]);

  // Handle Booking Cancellation with Slot Release
  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm(`Are you sure you want to cancel booking #${bookingId}? Your reserved slot passes will be released back to other waiting devotees.`)) {
      return;
    }

    setActionMessage('');
    setActionError('');

    try {
      const res = await api.delete(`/bookings/${bookingId}`);
      if (res.success) {
        setActionMessage(`Booking #${bookingId} has been successfully cancelled and quota released.`);
        fetchDashboardData();
      } else {
        setActionError(res.message || 'Failed to cancel booking.');
      }
    } catch (err) {
      setActionError(err.message || 'Error communicating with temple reservation server.');
    }
  };

  // Open Reschedule Modal & Fetch Slots
  const handleOpenReschedule = async (booking) => {
    setRescheduleBookingTarget(booking);
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

  // On Reschedule Date Change
  const handleDateChange = async (newDate) => {
    setRescheduleDate(newDate);
    setSelectedSlot(null);
    if (!rescheduleBookingTarget) return;

    try {
      const res = await api.get(`/darshan/slots?date=${newDate}&darshanType=${encodeURIComponent(rescheduleBookingTarget.darshanType)}`);
      if (res.success) {
        setAvailableSlots(res.slots || []);
        if (res.slots?.length > 0) setSelectedSlot(res.slots[0]);
      }
    } catch (err) {
      console.warn('Slot load error:', err);
    }
  };

  // Submit Reschedule
  const handleSubmitReschedule = async (e) => {
    e.preventDefault();
    if (!rescheduleBookingTarget || !rescheduleDate) return;

    setRescheduleLoading(true);
    setRescheduleError('');
    setRescheduleSuccess('');

    try {
      const payload = {
        newDate: rescheduleDate,
        newSlotId: selectedSlot?.id || null,
        newSlotTime: selectedSlot ? `${selectedSlot.startTime} - ${selectedSlot.endTime}` : rescheduleBookingTarget.slotTime
      };

      const res = await api.put(`/bookings/${rescheduleBookingTarget.id}/reschedule`, payload);
      if (res.success) {
        setRescheduleSuccess(`Pass #${rescheduleBookingTarget.id} successfully rescheduled to ${rescheduleDate}!`);
        setTimeout(() => {
          setRescheduleBookingTarget(null);
          fetchDashboardData();
        }, 1500);
      } else {
        setRescheduleError(res.message || 'Failed to reschedule booking.');
      }
    } catch (err) {
      setRescheduleError(err.message || 'Rescheduling request failed.');
    } finally {
      setRescheduleLoading(false);
    }
  };

  // Primary Sanctum Queue Metric
  const sanctumQueue = queues.find(q => q.areaName?.toLowerCase().includes('sanctum') || q.areaName?.toLowerCase().includes('darshan')) || queues[0] || null;

  return (
    <div className="dashboard-layout">
      <div className="dashboard-content" style={{ padding: '1.5rem 1rem', maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* ========================================================
            PERSONALIZED DEVOTEE IDENTITY & PROFILE HEADER
            ======================================================== */}
        <div 
          className="card card-gold-trim glass-card"
          style={{ 
            padding: '1.75rem', 
            borderRadius: '18px', 
            marginBottom: '1.75rem',
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.85) 0%, rgba(254, 243, 199, 0.4) 100%)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
              {/* Devotee Avatar with Golden Ring */}
              <div style={{ 
                width: '68px', 
                height: '68px', 
                borderRadius: '50%', 
                background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', 
                color: '#f59e0b', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                fontSize: '1.75rem',
                fontWeight: 900,
                border: '2px solid rgba(217, 119, 6, 0.5)',
                boxShadow: '0 6px 18px rgba(217, 119, 6, 0.25)',
                flexShrink: 0
              }}>
                {user?.name ? user.name.charAt(0).toUpperCase() : 'P'}
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                  <h1 className="temple-gradient-text" style={{ fontSize: '1.85rem', fontWeight: 900, margin: 0 }}>
                    Namaste, {user?.name || 'Devotee'}!
                  </h1>
                  <span className="badge badge-low" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '0.72rem', fontWeight: 700 }}>
                    <span className="pulse-dot" style={{ width: '6px', height: '6px', background: '#10b981' }} />
                    VERIFIED PILGRIM
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', fontSize: '0.85rem', color: '#64748b' }}>
                  <span>Devotee ID: <strong style={{ color: '#0f172a', fontFamily: 'monospace' }}>#{user?.id || 'DEV-88219'}</strong></span>
                  <span>&bull;</span>
                  <span>Mobile: <strong style={{ color: '#0f172a' }}>{user?.phone || '+91 98765 43210'}</strong></span>
                  <span>&bull;</span>
                  <span>Email: <strong style={{ color: '#0f172a' }}>{user?.email || 'devotee@temple.org'}</strong></span>
                </div>
              </div>
            </div>

            {/* Quick CTAs */}
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button 
                onClick={fetchDashboardData} 
                className="btn btn-secondary btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: '6px', borderRadius: '8px', fontWeight: 600, padding: '0.6rem 0.9rem' }}
                title="Refresh Telemetry"
              >
                <RefreshCw size={14} /> Refresh
              </button>
              <Link 
                to="/user/book-darshan" 
                className="btn btn-primary" 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  padding: '0.65rem 1.35rem', 
                  borderRadius: '8px', 
                  fontWeight: 800,
                  boxShadow: '0 4px 14px rgba(217, 119, 6, 0.35)'
                }}
              >
                <CalendarCheck size={18} />
                <span>Book Guaranteed Slot &rarr;</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Global Feedback Banners */}
        {actionMessage && (
          <div className="alert alert-success" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '0.85rem 1.25rem', borderRadius: '12px', marginBottom: '1.5rem' }}>
            <CheckCircle2 size={18} style={{ flexShrink: 0, color: '#16a34a' }} />
            <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{actionMessage}</span>
          </div>
        )}
        {actionError && (
          <div className="alert alert-danger" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '0.85rem 1.25rem', borderRadius: '12px', marginBottom: '1.5rem' }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{actionError}</span>
          </div>
        )}

        {/* ========================================================
            PORTAL STATISTICAL KPI CARDS (TOTAL, UPCOMING, COMPLETED, CANCELLED)
            ======================================================== */}
        <div className="grid-4" style={{ gap: '1.25rem', marginBottom: '1.75rem' }}>
          <StatCard
            title="Total Registered Bookings"
            value={bookings.length}
            icon={CalendarCheck}
            subtext="Lifetime passes under this account"
          />
          <StatCard
            title="Upcoming Darshan Passes"
            value={upcomingBookings.length}
            icon={QrCode}
            badgeText={upcomingBookings.length > 0 ? `${upcomingBookings.length} Active` : 'No Active Pass'}
            badgeType={upcomingBookings.length > 0 ? 'confirmed' : 'low'}
          />
          <StatCard
            title="Completed Sanctum Visits"
            value={completedBookings.length}
            icon={CheckCircle2}
            subtext="Verified gate entries completed"
          />
          <StatCard
            title="Cancelled Reservations"
            value={cancelledBookings.length}
            icon={XCircle}
            subtext="Released slots returned to queue"
          />
        </div>

        {/* ========================================================
            NEXT UPCOMING DARSHAN SPOTLIGHT WITH LIVE COUNTDOWN
            ======================================================== */}
        {nextBooking ? (
          <div 
            className="card card-gold-trim glass-card"
            style={{ 
              borderRadius: '18px', 
              padding: '1.75rem', 
              marginBottom: '1.75rem',
              background: 'linear-gradient(135deg, rgba(254, 243, 199, 0.6) 0%, rgba(253, 230, 138, 0.3) 50%, rgba(255, 255, 255, 0.8) 100%)',
              border: '1.5px solid rgba(245, 158, 11, 0.45)',
              boxShadow: '0 8px 30px rgba(217, 119, 6, 0.12)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem' }}>
              <div style={{ flex: '1 1 340px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span className="badge badge-confirmed" style={{ fontSize: '0.75rem', fontWeight: 800 }}>
                    ★ NEXT UPCOMING DARSHAN
                  </span>
                  <span style={{ fontSize: '0.8rem', color: '#92400e', fontWeight: 700 }}>
                    Booking Pass ID: <code style={{ color: '#b45309', fontWeight: 800 }}>{nextBooking.id}</code>
                  </span>
                </div>

                <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0f172a', margin: '4px 0 8px 0' }}>
                  {nextBooking.darshanType}
                </h2>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px', marginTop: '12px' }}>
                  <div style={{ background: 'rgba(255, 255, 255, 0.8)', padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(245, 158, 11, 0.25)' }}>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Visit Date</div>
                    <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>{nextBooking.bookingDate}</div>
                  </div>
                  <div style={{ background: 'rgba(255, 255, 255, 0.8)', padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(245, 158, 11, 0.25)' }}>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Assigned Slot</div>
                    <div style={{ fontSize: '1rem', fontWeight: 800, color: '#b45309', marginTop: '2px' }}>{nextBooking.slotTime}</div>
                  </div>
                  <div style={{ background: 'rgba(255, 255, 255, 0.8)', padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(245, 158, 11, 0.25)' }}>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Devotee Party</div>
                    <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>{nextBooking.numberOfPeople} Person(s)</div>
                  </div>
                  <div style={{ background: 'rgba(255, 255, 255, 0.8)', padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(245, 158, 11, 0.25)' }}>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Entry Arcade</div>
                    <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>Gate 1 (East VIP Arcade)</div>
                  </div>
                </div>

                {/* Accompanying Family Members Preview */}
                {nextBooking.familyMembers && nextBooking.familyMembers.length > 0 && (
                  <div style={{ marginTop: '12px', background: 'rgba(255, 255, 255, 0.7)', padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(226, 232, 240, 0.8)' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                      Accompanying Family Devotees ({nextBooking.familyMembers.length}):
                    </span>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '6px' }}>
                      {nextBooking.familyMembers.map((fam, idx) => (
                        <span key={idx} style={{ fontSize: '0.8rem', background: '#fef3c7', color: '#92400e', padding: '3px 10px', borderRadius: '16px', fontWeight: 600, border: '1px solid #fde68a' }}>
                          {fam.name} ({fam.age}y, {fam.gender})
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Countdown Clock Box & Action Buttons */}
              <div style={{ flex: '1 1 300px', textAlign: 'center', background: 'rgba(255, 255, 255, 0.9)', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(245, 158, 11, 0.3)', boxShadow: '0 4px 16px rgba(0,0,0,0.05)' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#b45309', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Sanctum Entry Countdown
                </span>

                {countdown.isPassed ? (
                  <div style={{ padding: '1rem 0' }}>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#16a34a' }}>Your Darshan Window is Active!</div>
                    <div style={{ fontSize: '0.85rem', color: '#475569', marginTop: '4px' }}>Please proceed directly to Gate 1 security scanner.</div>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', margin: '12px 0 16px 0' }}>
                    <div style={{ background: '#0f172a', color: '#ffffff', padding: '10px 4px', borderRadius: '8px' }}>
                      <div style={{ fontSize: '1.6rem', fontWeight: 900, fontFamily: 'monospace', color: '#fbbf24' }}>{countdown.days}</div>
                      <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', opacity: 0.8 }}>Days</div>
                    </div>
                    <div style={{ background: '#0f172a', color: '#ffffff', padding: '10px 4px', borderRadius: '8px' }}>
                      <div style={{ fontSize: '1.6rem', fontWeight: 900, fontFamily: 'monospace', color: '#fbbf24' }}>{countdown.hours}</div>
                      <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', opacity: 0.8 }}>Hours</div>
                    </div>
                    <div style={{ background: '#0f172a', color: '#ffffff', padding: '10px 4px', borderRadius: '8px' }}>
                      <div style={{ fontSize: '1.6rem', fontWeight: 900, fontFamily: 'monospace', color: '#fbbf24' }}>{countdown.minutes}</div>
                      <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', opacity: 0.8 }}>Mins</div>
                    </div>
                    <div style={{ background: '#0f172a', color: '#ffffff', padding: '10px 4px', borderRadius: '8px' }}>
                      <div style={{ fontSize: '1.6rem', fontWeight: 900, fontFamily: 'monospace', color: '#fbbf24' }}>{countdown.seconds}</div>
                      <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', opacity: 0.8 }}>Secs</div>
                    </div>
                  </div>
                )}

                {/* Management Action Buttons */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <Link 
                    to={`/user/booking/${nextBooking.id}`}
                    className="btn btn-primary"
                    style={{ width: '100%', padding: '0.75rem', fontWeight: 800, borderRadius: '8px', boxShadow: '0 4px 14px rgba(217, 119, 6, 0.35)' }}
                  >
                    <QrCode size={16} />
                    <span>Open Digital Pass &amp; QR Code</span>
                  </Link>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <button 
                      onClick={() => handleOpenReschedule(nextBooking)}
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '0.6rem', fontWeight: 700, borderRadius: '8px', color: '#b45309', borderColor: '#fde68a' }}
                    >
                      <Edit3 size={14} /> Reschedule
                    </button>
                    <button 
                      onClick={() => setReceiptBooking(nextBooking)}
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '0.6rem', fontWeight: 700, borderRadius: '8px' }}
                    >
                      <Download size={14} /> E-Receipt
                    </button>
                  </div>

                  <button 
                    onClick={() => handleCancelBooking(nextBooking.id)}
                    className="btn btn-danger btn-sm"
                    style={{ width: '100%', padding: '0.5rem', fontWeight: 600, borderRadius: '8px' }}
                  >
                    <X size={14} /> Cancel Pass
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div 
            className="card card-gold-trim glass-card"
            style={{ 
              borderRadius: '16px', 
              padding: '2rem', 
              textAlign: 'center', 
              marginBottom: '1.75rem',
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(254, 243, 199, 0.3) 100%)'
            }}
          >
            <div style={{ 
              width: '56px', 
              height: '56px', 
              borderRadius: '50%', 
              background: '#fef3c7', 
              color: '#d97706', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              margin: '0 auto 1rem auto',
              border: '1px solid #fde68a' 
            }}>
              <CalendarCheck size={28} />
            </div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>No Active Upcoming Darshan Pass</h3>
            <p style={{ fontSize: '0.9rem', color: '#64748b', maxWidth: '440px', margin: '0 auto 1.25rem auto' }}>
              You do not have any confirmed darshan slots reserved. Book online in advance to skip physical queue tokens and enjoy guaranteed entry.
            </p>
            <Link to="/user/book-darshan" className="btn btn-primary" style={{ padding: '0.75rem 1.6rem', fontWeight: 800 }}>
              Reserve Holy Darshan Slot Now &rarr;
            </Link>
          </div>
        )}

        {/* ========================================================
            LIVE SANCTUM QUEUE & CROWD TELEMETRY MODULE
            ======================================================== */}
        <div 
          className="card card-gold-trim glass-card" 
          style={{ 
            borderRadius: '18px', 
            padding: '1.75rem', 
            marginBottom: '1.75rem' 
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '1.25rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>
                  Live Sanctum Queue &amp; Crowd Telemetry
                </h2>
                <span className="badge badge-low" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem' }}>
                  <span className="pulse-dot" style={{ width: '6px', height: '6px', background: '#10b981' }} />
                  YOLOv8 Vision Active
                </span>
              </div>
              <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '4px 0 0 0' }}>
                Verified telemetry from temple entrance CCTV optical counters and holding day batch monitors.
              </p>
            </div>

            <div style={{ fontSize: '0.75rem', color: '#92400e', background: '#fef3c7', padding: '4px 10px', borderRadius: '6px', border: '1px solid #fde68a', fontWeight: 600 }}>
              Official Telemetry &bull; Real-Time Sync
            </div>
          </div>

          <div className="grid-4" style={{ gap: '1rem' }}>
            {/* Now Serving Token */}
            <div style={{ background: 'rgba(254, 243, 199, 0.5)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '12px', padding: '1.25rem', textAlign: 'center' }}>
              <span style={{ fontSize: '0.72rem', color: '#92400e', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Sanctum Token Serving
              </span>
              <div style={{ fontSize: '2.4rem', fontWeight: 900, color: '#b45309', fontFamily: 'monospace', margin: '4px 0' }}>
                {sanctumQueue ? sanctumQueue.currentServingToken : '#142'}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#78350f' }}>Active Passage Lane</div>
            </div>

            {/* Pilgrims in Holding Bays */}
            <div style={{ background: 'rgba(248, 250, 252, 0.8)', border: '1px solid rgba(226, 232, 240, 0.9)', borderRadius: '12px', padding: '1.25rem', textAlign: 'center' }}>
              <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Holding Bay Queue
              </span>
              <div style={{ fontSize: '2.4rem', fontWeight: 900, color: '#0f172a', margin: '4px 0' }}>
                {sanctumQueue ? sanctumQueue.waitingCount : '185'}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Pilgrims Paced in Bays</div>
            </div>

            {/* Estimated Wait Time */}
            <div style={{ background: 'rgba(248, 250, 252, 0.8)', border: '1px solid rgba(226, 232, 240, 0.9)', borderRadius: '12px', padding: '1.25rem', textAlign: 'center' }}>
              <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Dynamic Wait Time
              </span>
              <div style={{ fontSize: '2.4rem', fontWeight: 900, color: '#0f172a', margin: '4px 0' }}>
                {sanctumQueue ? `${sanctumQueue.estimatedWaitTimeMins}m` : '15m'}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Estimated Sanctum Delay</div>
            </div>

            {/* Overall Temple Crowd Density */}
            <div style={{ background: 'rgba(248, 250, 252, 0.8)', border: '1px solid rgba(226, 232, 240, 0.9)', borderRadius: '12px', padding: '1.25rem', textAlign: 'center' }}>
              <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Overall Campus Density
              </span>
              <div style={{ fontSize: '2.4rem', fontWeight: 900, color: crowdData?.summary?.overallOccupancyPct > 75 ? '#dc2626' : '#16a34a', margin: '4px 0' }}>
                {crowdData?.summary?.overallOccupancyPct ? `${crowdData.summary.overallOccupancyPct}%` : '48%'}
              </div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: crowdData?.summary?.overallOccupancyPct > 75 ? '#dc2626' : '#16a34a' }}>
                {crowdData?.summary?.overallCrowdLevel || 'MODERATE'} FLOW
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================
            TABBED INTERACTIVE PILGRIM PORTAL SECTIONS
            ======================================================== */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '1.5rem', flexWrap: 'wrap', borderBottom: '2px solid rgba(226, 232, 240, 0.8)', paddingBottom: '8px' }}>
          <button
            onClick={() => setActiveTab('passes')}
            className={`btn btn-sm ${activeTab === 'passes' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ borderRadius: '8px', fontWeight: 700, padding: '0.6rem 1.25rem' }}
          >
            <QrCode size={15} />
            <span>My Bookings &amp; Passes ({bookings.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('crowd')}
            className={`btn btn-sm ${activeTab === 'crowd' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ borderRadius: '8px', fontWeight: 700, padding: '0.6rem 1.25rem' }}
          >
            <Eye size={15} />
            <span>Temple Zone Heatmap</span>
          </button>
          <button
            onClick={() => setActiveTab('notices')}
            className={`btn btn-sm ${activeTab === 'notices' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ borderRadius: '8px', fontWeight: 700, padding: '0.6rem 1.25rem' }}
          >
            <Bell size={15} />
            <span>Notices &amp; Announcements ({notifications.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('services')}
            className={`btn btn-sm ${activeTab === 'services' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ borderRadius: '8px', fontWeight: 700, padding: '0.6rem 1.25rem' }}
          >
            <Shield size={15} />
            <span>Emergency &amp; Pilgrim Help</span>
          </button>
        </div>

        {/* TAB 1: PASSES & BOOKINGS LIST */}
        {activeTab === 'passes' && (
          <div className="card card-gold-trim glass-card" style={{ padding: 0, overflow: 'hidden', borderRadius: '16px' }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(226, 232, 240, 0.8)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Devotee Passes &amp; Booking History
                </h3>
                <p style={{ fontSize: '0.825rem', color: '#64748b', margin: '2px 0 0 0' }}>
                  Manage reservations, reschedule dates, cancel slots, and download official e-receipts.
                </p>
              </div>
              <Link to="/user/book-darshan" className="btn btn-primary btn-sm" style={{ fontWeight: 700 }}>
                + Book Another Pass
              </Link>
            </div>

            <div className="table-container" style={{ border: 'none', margin: 0 }}>
              <table className="table">
                <thead>
                  <tr>
                    <th style={{ paddingLeft: '1.5rem' }}>Pass ID</th>
                    <th>Darshan Category</th>
                    <th>Visit Date</th>
                    <th>Slot Window</th>
                    <th>Devotees</th>
                    <th>Status</th>
                    <th style={{ paddingRight: '1.5rem' }}>Pass Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '3.5rem 1rem', color: '#64748b' }}>
                        <QrCode size={36} style={{ margin: '0 auto 8px', color: '#cbd5e1' }} />
                        <div style={{ fontWeight: 700 }}>No darshan passes registered under this account yet.</div>
                        <div style={{ fontSize: '0.825rem', marginTop: '4px' }}>Reserve a special slot to receive an instant QR code entry pass.</div>
                      </td>
                    </tr>
                  ) : (
                    bookings.map((b) => (
                      <tr key={b.id}>
                        <td style={{ paddingLeft: '1.5rem', fontWeight: 800, fontFamily: 'monospace', color: '#b45309' }}>
                          {b.id}
                        </td>
                        <td>
                          <strong style={{ color: '#0f172a' }}>{b.darshanType.split('(')[0]}</strong>
                          {b.familyMembers && b.familyMembers.length > 0 && (
                            <div style={{ fontSize: '0.75rem', color: '#b45309', fontWeight: 600 }}>
                              +{b.familyMembers.length} Family Member(s)
                            </div>
                          )}
                        </td>
                        <td style={{ fontSize: '0.85rem' }}>{b.bookingDate}</td>
                        <td style={{ fontSize: '0.85rem', fontWeight: 600 }}>{b.slotTime}</td>
                        <td style={{ fontWeight: 600 }}>{b.numberOfPeople} Person(s)</td>
                        <td><StatusBadge status={b.bookingStatus} /></td>
                        <td style={{ paddingRight: '1.5rem' }}>
                          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                            <Link 
                              to={`/user/booking/${b.id}`} 
                              className="btn btn-secondary btn-sm"
                              style={{ padding: '4px 8px', fontSize: '0.75rem', fontWeight: 700 }}
                              title="View Full Pass QR"
                            >
                              <QrCode size={13} color="#b45309" /> Pass
                            </Link>

                            <button
                              onClick={() => setReceiptBooking(b)}
                              className="btn btn-secondary btn-sm"
                              style={{ padding: '4px 8px', fontSize: '0.75rem', fontWeight: 700 }}
                              title="Download E-Receipt"
                            >
                              <FileText size={13} /> Receipt
                            </button>

                            {b.bookingStatus === 'CONFIRMED' && (
                              <>
                                <button
                                  onClick={() => handleOpenReschedule(b)}
                                  className="btn btn-secondary btn-sm"
                                  style={{ padding: '4px 8px', fontSize: '0.75rem', fontWeight: 700, color: '#d97706', borderColor: '#fde68a' }}
                                  title="Reschedule Date & Slot"
                                >
                                  <Edit3 size={13} /> Reschedule
                                </button>
                                <button
                                  onClick={() => handleCancelBooking(b.id)}
                                  className="btn btn-danger btn-sm"
                                  style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                                  title="Cancel Pass"
                                >
                                  <X size={13} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: LIVE CROWD HEATMAP */}
        {activeTab === 'crowd' && (
          <div style={{ marginBottom: '1.75rem' }}>
            <CrowdHeatmap areas={crowdData?.areas || []} />
          </div>
        )}

        {/* TAB 3: NOTICES & ANNOUNCEMENTS */}
        {activeTab === 'notices' && (
          <div className="card card-gold-trim glass-card" style={{ padding: '1.75rem', borderRadius: '16px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.25rem' }}>
              Official Temple Announcements &amp; Reminders
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {notifications.length === 0 ? (
                <p style={{ color: '#64748b', fontSize: '0.9rem', textAlign: 'center', padding: '2rem 0' }}>
                  No active notices or reminders for your account.
                </p>
              ) : (
                notifications.map((n) => (
                  <div 
                    key={n.id}
                    style={{ 
                      padding: '1rem 1.25rem', 
                      borderRadius: '10px', 
                      border: '1px solid rgba(226, 232, 240, 0.9)',
                      background: n.type === 'EMERGENCY' ? 'rgba(254, 242, 242, 0.8)' : (n.type === 'BOOKING' ? 'rgba(254, 243, 199, 0.5)' : 'rgba(255, 255, 255, 0.7)'),
                      borderLeft: n.type === 'EMERGENCY' ? '4px solid #ef4444' : (n.type === 'BOOKING' ? '4px solid #f59e0b' : '4px solid #3b82f6')
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>{n.title}</strong>
                      <span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>{n.type}</span>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: '#475569', margin: '4px 0', lineHeight: 1.5 }}>{n.message}</p>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{new Date(n.createdAt).toLocaleString()}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 4: PILGRIM HELP & GROUND SERVICES */}
        {activeTab === 'services' && (
          <div className="grid-2" style={{ gap: '1.5rem' }}>
            <div className="card card-gold-trim glass-card" style={{ padding: '1.75rem', borderRadius: '16px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem' }}>
                Emergency Ground SOS
              </h3>
              <p style={{ fontSize: '0.875rem', color: '#64748b', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                Immediate dispatch to temple paramedics, queue marshals, and security control if you or a family member need urgent help.
              </p>
              <Link to="/user/emergency" className="btn btn-danger" style={{ width: '100%', padding: '0.85rem', fontWeight: 800, borderRadius: '8px' }}>
                <AlertTriangle size={18} />
                <span>Transmit High-Priority SOS Alert</span>
              </Link>
            </div>

            <div className="card card-gold-trim glass-card" style={{ padding: '1.75rem', borderRadius: '16px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem' }}>
                Lost &amp; Found Assistance
              </h3>
              <p style={{ fontSize: '0.875rem', color: '#64748b', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                Check items securely turned over to temple security custody or report misplaced bags, wallets, or documents.
              </p>
              <Link to="/user/lost-found" className="btn btn-secondary" style={{ width: '100%', padding: '0.85rem', fontWeight: 700, borderRadius: '8px' }}>
                <span>Access Lost &amp; Found Desk &rarr;</span>
              </Link>
            </div>
          </div>
        )}

        {/* ========================================================
            INTERACTIVE RESCHEDULE MODAL
            ======================================================== */}
        {rescheduleBookingTarget && (
          <div className="modal-overlay" style={{ backdropFilter: 'blur(8px)', background: 'rgba(15, 23, 42, 0.65)' }}>
            <div className="modal-content glass-card card-gold-trim" style={{ padding: 0, borderRadius: '18px', maxWidth: '540px', overflow: 'hidden' }}>
              <div style={{ 
                background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', 
                color: '#ffffff', 
                padding: '1.25rem 1.5rem', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                borderBottom: '2px solid rgba(245, 158, 11, 0.4)'
              }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Edit3 size={18} style={{ color: '#f59e0b' }} /> Reschedule Darshan Pass
                  </h3>
                  <span style={{ fontSize: '0.78rem', color: '#fbbf24' }}>Pass ID: #{rescheduleBookingTarget.id}</span>
                </div>
                <button 
                  onClick={() => setRescheduleBookingTarget(null)} 
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
                      onChange={(e) => handleDateChange(e.target.value)}
                      style={{ borderRadius: '8px' }}
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                    <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                      Select Available Time Window ({rescheduleBookingTarget.darshanType.split('(')[0]})
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
                          const isFull = remaining < (rescheduleBookingTarget.numberOfPeople || 1);

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
                      onClick={() => setRescheduleBookingTarget(null)} 
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
                      {rescheduleLoading ? 'Updating Pass...' : 'Confirm New Rescheduled Slot'}
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
        {receiptBooking && (
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
                    onClick={() => setReceiptBooking(null)}
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
                    Smart Pilgrim Flow Management &bull; Pass #{receiptBooking.id}
                  </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
                  <div>
                    <span style={{ color: '#64748b', fontSize: '0.75rem', display: 'block' }}>PRIMARY DEVOTEE</span>
                    <strong>{receiptBooking.primaryPilgrimName}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', fontSize: '0.75rem', display: 'block' }}>REGISTERED CONTACT</span>
                    <strong>{receiptBooking.primaryPilgrimPhone}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', fontSize: '0.75rem', display: 'block' }}>VISIT DATE</span>
                    <strong>{receiptBooking.bookingDate}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', fontSize: '0.75rem', display: 'block' }}>TIME WINDOW</span>
                    <strong>{receiptBooking.slotTime}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', fontSize: '0.75rem', display: 'block' }}>DARSHAN CATEGORY</span>
                    <strong style={{ color: '#b45309' }}>{receiptBooking.darshanType}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', fontSize: '0.75rem', display: 'block' }}>VISITOR COUNT</span>
                    <strong>{receiptBooking.numberOfPeople} Person(s)</strong>
                  </div>
                </div>

                {/* Family Members Breakdown in Receipt */}
                {receiptBooking.familyMembers && receiptBooking.familyMembers.length > 0 && (
                  <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '1.25rem' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '6px' }}>
                      Accompanying Family Members:
                    </div>
                    {receiptBooking.familyMembers.map((fam, i) => (
                      <div key={i} style={{ fontSize: '0.825rem', display: 'flex', justifyContent: 'space-between', padding: '3px 0' }}>
                        <span>&bull; {fam.name} ({fam.age} yrs, {fam.gender})</span>
                        <span style={{ color: '#64748b' }}>{fam.idProofNumber || 'ID Verified'}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fffbeb', border: '1px solid #fde68a', padding: '12px 16px', borderRadius: '8px', marginBottom: '1.25rem' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#92400e', fontWeight: 700 }}>PAYMENT &amp; VALIDITY</span>
                    <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
                      {receiptBooking.totalAmount === 0 ? 'FREE SEVA PASS' : `₹${receiptBooking.totalAmount} (PAID)`}
                    </div>
                  </div>
                  <StatusBadge status={receiptBooking.bookingStatus} />
                </div>

                <div style={{ textAlign: 'center', fontSize: '0.75rem', color: '#64748b', borderTop: '1px solid #e2e8f0', paddingTop: '10px' }}>
                  Please present your QR code pass directly at Gate 1 Turnstiles. May Lord Siddhivinayak bless your holy visit.
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default PilgrimDashboard;
