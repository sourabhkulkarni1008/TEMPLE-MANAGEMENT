import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import StatusBadge from '../../components/StatusBadge';
import { useDevice } from '../../utils/useDevice';
import { 
  CalendarCheck, QrCode, Search, RefreshCw, Calendar, Clock, Users, 
  ArrowRight, FileText, Printer, XCircle, AlertCircle, CheckCircle2 
} from 'lucide-react';

const PilgrimBookings = () => {
  const { isMobile } = useDevice();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [search, setSearch] = useState('');

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

  // Status Alerts
  const [actionMessage, setActionMessage] = useState('');
  const [actionError, setActionError] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];

  const fetchBookings = async () => {
    try {
      const res = await api.get('/bookings?limit=50');
      if (res.success) setBookings(res.bookings || []);
    } catch (err) {
      console.warn('Failed to load bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm(`Are you sure you want to cancel booking #${bookingId}? Slot passes will be released.`)) return;
    setActionMessage('');
    setActionError('');
    try {
      const res = await api.delete(`/bookings/${bookingId}`);
      if (res.success) {
        setActionMessage(`Booking #${bookingId} has been successfully cancelled and quota released.`);
        fetchBookings();
      } else {
        setActionError(res.message || 'Failed to cancel booking.');
      }
    } catch (err) {
      setActionError(err.message || 'Error communicating with temple reservation server.');
    }
  };

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

  const handleRescheduleDateChange = async (newDate) => {
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
          fetchBookings();
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

  const filtered = bookings.filter((b) => {
    const matchesStatus = filterStatus ? b.bookingStatus === filterStatus : true;
    const matchesSearch = search
      ? b.id.toLowerCase().includes(search.toLowerCase()) ||
        b.darshanType.toLowerCase().includes(search.toLowerCase()) ||
        b.bookingDate.includes(search) ||
        (b.primaryPilgrimName && b.primaryPilgrimName.toLowerCase().includes(search.toLowerCase()))
      : true;
    return matchesStatus && matchesSearch;
  });

  const confirmedCount = bookings.filter(b => b.bookingStatus === 'CONFIRMED').length;
  const checkedInCount = bookings.filter(b => b.bookingStatus === 'CHECKED_IN').length;
  const cancelledCount = bookings.filter(b => b.bookingStatus === 'CANCELLED').length;

  return (
    <div className="dashboard-content">
      <div style={{ maxWidth: '1050px', margin: '0 auto' }}>
        
        {/* Header Title & CTA */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <h1 style={{ fontSize: isMobile ? '1.4rem' : '1.75rem', color: '#1c1917', marginBottom: '4px', fontWeight: 800 }}>
              My Darshan Passes &amp; Bookings
            </h1>
            <p style={{ fontSize: '0.875rem', color: '#78716c' }}>
              Access active digital gate passes, reschedule visit dates, download receipts, and view holy darshan history.
            </p>
          </div>
          <Link to="/user/book-darshan" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}>
            <CalendarCheck size={16} />
            <span>Book New Slot</span>
          </Link>
        </div>

        {/* Action Alerts */}
        {actionMessage && (
          <div className="alert alert-success" style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={16} color="#16a34a" />
            <span>{actionMessage}</span>
          </div>
        )}
        {actionError && (
          <div className="alert alert-danger" style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={16} color="#dc2626" />
            <span>{actionError}</span>
          </div>
        )}

        {/* Quick Filter Counts */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '1rem' }}>
          <button
            onClick={() => setFilterStatus('')}
            style={{
              padding: '6px 14px',
              borderRadius: '20px',
              border: '1px solid',
              borderColor: filterStatus === '' ? '#b45309' : '#e2e8f0',
              background: filterStatus === '' ? '#fef3c7' : '#ffffff',
              color: filterStatus === '' ? '#92400e' : '#475569',
              fontWeight: 700,
              fontSize: '0.8rem',
              cursor: 'pointer'
            }}
          >
            All Passes ({bookings.length})
          </button>
          <button
            onClick={() => setFilterStatus('CONFIRMED')}
            style={{
              padding: '6px 14px',
              borderRadius: '20px',
              border: '1px solid',
              borderColor: filterStatus === 'CONFIRMED' ? '#16a34a' : '#e2e8f0',
              background: filterStatus === 'CONFIRMED' ? '#dcfce7' : '#ffffff',
              color: filterStatus === 'CONFIRMED' ? '#166534' : '#475569',
              fontWeight: 700,
              fontSize: '0.8rem',
              cursor: 'pointer'
            }}
          >
            Confirmed Upcoming ({confirmedCount})
          </button>
          <button
            onClick={() => setFilterStatus('CHECKED_IN')}
            style={{
              padding: '6px 14px',
              borderRadius: '20px',
              border: '1px solid',
              borderColor: filterStatus === 'CHECKED_IN' ? '#2563eb' : '#e2e8f0',
              background: filterStatus === 'CHECKED_IN' ? '#dbeafe' : '#ffffff',
              color: filterStatus === 'CHECKED_IN' ? '#1e40af' : '#475569',
              fontWeight: 700,
              fontSize: '0.8rem',
              cursor: 'pointer'
            }}
          >
            Completed ({checkedInCount})
          </button>
          <button
            onClick={() => setFilterStatus('CANCELLED')}
            style={{
              padding: '6px 14px',
              borderRadius: '20px',
              border: '1px solid',
              borderColor: filterStatus === 'CANCELLED' ? '#dc2626' : '#e2e8f0',
              background: filterStatus === 'CANCELLED' ? '#fee2e2' : '#ffffff',
              color: filterStatus === 'CANCELLED' ? '#991b1b' : '#475569',
              fontWeight: 700,
              fontSize: '0.8rem',
              cursor: 'pointer'
            }}
          >
            Cancelled ({cancelledCount})
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="card card-gold-trim glass-card" style={{ padding: '1rem', marginBottom: '1.4rem' }}>
          <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '220px' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Search by ID, Category, Date, or Devotee Name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div style={{ width: isMobile ? '100%' : '200px' }}>
              <select
                className="form-select"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="CHECKED_IN">Checked In</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
            <button onClick={fetchBookings} className="btn btn-secondary btn-sm" title="Refresh">
              <RefreshCw size={14} />
            </button>
          </div>
        </div>

        {/* Content View: Mobile Cards or Desktop Table */}
        {loading ? (
          <div className="card glass-card" style={{ padding: '3rem', textAlign: 'center', color: '#78716c' }}>
            <p style={{ fontWeight: 600 }}>Loading your darshan bookings...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="card card-gold-trim glass-card" style={{ padding: '3.5rem 1.75rem', textAlign: 'center' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg, #fffbeb, #fef3c7)', color: '#b45309', border: '1px solid #fde68a', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem', boxShadow: '0 4px 12px rgba(245, 158, 11, 0.2)' }}>
              <QrCode size={32} />
            </div>
            <h3 style={{ fontSize: '1.25rem', color: '#0f172a', marginBottom: '0.5rem', fontWeight: 700 }}>No Bookings Found</h3>
            <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '1.5rem', maxWidth: '420px', margin: '0 auto 1.5rem', lineHeight: 1.6 }}>
              You do not have any darshan bookings matching this filter. Reserve an auspicious slot for Lord Siddhivinayak darshan today.
            </p>
            <Link to="/user/book-darshan" className="btn btn-primary" style={{ padding: '0.75rem 1.6rem' }}>
              Book Guaranteed Darshan Slot
            </Link>
          </div>
        ) : isMobile ? (
          /* Mobile Friendly Card List */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {filtered.map((b) => {
              const isPast = b.bookingDate < todayStr;
              const isConfirmed = b.bookingStatus === 'CONFIRMED';
              return (
                <div key={b.id} className="card card-gold-trim glass-card" style={{ padding: '1.35rem', marginBottom: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.85rem' }}>
                    <div>
                      <span style={{ fontSize: '0.72rem', color: '#78716c', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
                        Token Pass ID
                      </span>
                      <div style={{ fontWeight: 800, fontFamily: 'monospace', color: '#0f172a', fontSize: '1rem', letterSpacing: '0.04em' }}>
                        {b.id}
                      </div>
                    </div>
                    <StatusBadge status={b.bookingStatus} />
                  </div>

                  <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#c2410c', marginBottom: '0.85rem' }}>
                    {b.darshanType.split('(')[0]}
                  </div>

                  <div style={{ background: '#f8f4ec', border: '1px solid #ede4d3', borderRadius: '10px', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.86rem', color: '#475569', marginBottom: '1.15rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Calendar size={16} color="#c2410c" />
                      <span><strong>Date:</strong> {b.bookingDate}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Clock size={16} color="#c2410c" />
                      <span><strong>Slot:</strong> {b.slotTime}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Users size={16} color="#c2410c" />
                      <span><strong>Devotees:</strong> {b.numberOfPeople} person(s)</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <Link
                      to={`/user/booking/${b.id}`}
                      className="btn btn-primary"
                      style={{ width: '100%', minHeight: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                    >
                      <QrCode size={16} />
                      <span>View &amp; Present QR Pass</span>
                      <ArrowRight size={16} />
                    </Link>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => setReceiptBooking(b)}
                        className="btn btn-secondary btn-sm"
                        style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontSize: '0.78rem' }}
                      >
                        <FileText size={14} color="#b45309" />
                        <span>E-Receipt</span>
                      </button>

                      {isConfirmed && !isPast && (
                        <button
                          onClick={() => handleOpenReschedule(b)}
                          className="btn btn-secondary btn-sm"
                          style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontSize: '0.78rem', color: '#b45309' }}
                        >
                          <CalendarCheck size={14} />
                          <span>Reschedule</span>
                        </button>
                      )}

                      {isConfirmed && (
                        <button
                          onClick={() => handleCancelBooking(b.id)}
                          className="btn btn-secondary btn-sm"
                          style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontSize: '0.78rem', color: '#dc2626' }}
                        >
                          <XCircle size={14} />
                          <span>Cancel</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Desktop Table View */
          <div className="card card-gold-trim glass-card" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="table-container" style={{ border: 'none' }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Booking ID</th>
                    <th>Devotee</th>
                    <th>Darshan Category</th>
                    <th>Visit Date</th>
                    <th>Time Slot</th>
                    <th>Devotees</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((b) => {
                    const isPast = b.bookingDate < todayStr;
                    const isConfirmed = b.bookingStatus === 'CONFIRMED';
                    return (
                      <tr key={b.id}>
                        <td style={{ fontWeight: 700, fontFamily: 'monospace', color: '#c2410c' }}>{b.id}</td>
                        <td style={{ fontWeight: 600 }}>{b.primaryPilgrimName}</td>
                        <td>{b.darshanType.split('(')[0]}</td>
                        <td>{b.bookingDate}</td>
                        <td>{b.slotTime}</td>
                        <td>{b.numberOfPeople} person(s)</td>
                        <td><StatusBadge status={b.bookingStatus} /></td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '6px', alignItems: 'center' }}>
                            <Link to={`/user/booking/${b.id}`} className="btn btn-primary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 700, padding: '4px 8px', fontSize: '0.75rem' }}>
                              <QrCode size={13} />
                              <span>QR Pass</span>
                            </Link>

                            <button
                              onClick={() => setReceiptBooking(b)}
                              className="btn btn-secondary btn-sm"
                              title="Download E-Receipt"
                              style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                            >
                              <FileText size={13} color="#b45309" />
                            </button>

                            {isConfirmed && !isPast && (
                              <button
                                onClick={() => handleOpenReschedule(b)}
                                className="btn btn-secondary btn-sm"
                                title="Reschedule Slot"
                                style={{ padding: '4px 8px', fontSize: '0.75rem', color: '#b45309' }}
                              >
                                <CalendarCheck size={13} />
                              </button>
                            )}

                            {isConfirmed && (
                              <button
                                onClick={() => handleCancelBooking(b.id)}
                                className="btn btn-secondary btn-sm"
                                title="Cancel Reservation"
                                style={{ padding: '4px 8px', fontSize: '0.75rem', color: '#dc2626' }}
                              >
                                <XCircle size={13} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================
            RESCHEDULE MODAL
            ======================================================== */}
        {rescheduleBookingTarget && (
          <div className="modal-overlay" style={{ backdropFilter: 'blur(8px)', background: 'rgba(15, 23, 42, 0.65)' }}>
            <div className="modal-content glass-card" style={{ maxWidth: '500px', borderRadius: '16px', overflow: 'hidden' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', padding: '1.25rem 1.5rem', background: 'linear-gradient(135deg, #fffbeb, #fef3c7)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CalendarCheck size={20} color="#b45309" />
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#78350f', margin: 0 }}>
                    Reschedule Darshan Pass #{rescheduleBookingTarget.id}
                  </h3>
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
                      onChange={(e) => handleRescheduleDateChange(e.target.value)}
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
                        <span style={{ color: '#64748b' }}>{fam.idProofNumber || 'Pass Registered'}</span>
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

export default PilgrimBookings;
