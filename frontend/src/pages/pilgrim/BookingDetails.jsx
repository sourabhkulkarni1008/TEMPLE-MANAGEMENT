import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/client';
import StatusBadge from '../../components/StatusBadge';
import { QrCode, Calendar, Clock, Users, Printer, XCircle, ArrowLeft, CheckCircle2 } from 'lucide-react';

const BookingDetails = () => {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelling, setCancelling] = useState(false);

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
    if (!window.confirm('Are you sure you want to cancel this darshan reservation?')) return;
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

  if (loading) {
    return (
      <div className="dashboard-layout">
        <div className="dashboard-content" style={{ textAlign: 'center', padding: '4rem' }}>
          <p>Retrieving booking token and security QR...</p>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="dashboard-layout">
        <div className="dashboard-content" style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
          <div className="alert alert-danger">{error || 'Booking not found'}</div>
          <Link to="/user/bookings" className="btn btn-secondary">
            Back to My Bookings
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <div className="dashboard-content" style={{ maxWidth: '680px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <Link to="/user/bookings" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.875rem', color: '#64748b' }}>
            <ArrowLeft size={16} /> Back to My Bookings
          </Link>
          <button onClick={handlePrint} className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Printer size={15} />
            <span>Print Pass</span>
          </button>
        </div>

        {/* Digital Pass Card */}
        <div className="card" style={{ padding: '2rem', border: '2px solid #b45309' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '1.25rem', marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: '#b45309', fontWeight: 600, letterSpacing: '0.05em' }}>
              Official Digital Darshan Entry Pass
            </div>
            <h1 style={{ fontSize: '1.4rem', color: '#0f172a', margin: '4px 0' }}>
              Sri Siddhivinayak &amp; Venkateswara Temple
            </h1>
            <div style={{ display: 'inline-block', marginTop: '6px' }}>
              <StatusBadge status={booking.bookingStatus} />
            </div>
          </div>

          {/* QR Code Container */}
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            {booking.qrDataUrl ? (
              <img
                src={booking.qrDataUrl}
                alt="Darshan QR Entry Pass"
                style={{
                  width: '200px',
                  height: '200px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '8px',
                  background: '#ffffff'
                }}
              />
            ) : (
              <div style={{ width: '180px', height: '180px', background: '#f1f5f9', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <QrCode size={64} color="#94a3b8" />
              </div>
            )}
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', marginTop: '6px', fontFamily: 'monospace' }}>
              {booking.id}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Present this secure token at Entry Gate scanner</div>
          </div>

          {/* Booking Data Grid */}
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', fontSize: '0.875rem' }}>
              <div>
                <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>PRIMARY PILGRIM</span>
                <strong>{booking.primaryPilgrimName}</strong>
              </div>
              <div>
                <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>CONTACT PHONE</span>
                <strong>{booking.primaryPilgrimPhone}</strong>
              </div>
              <div>
                <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>VISIT DATE</span>
                <strong>{booking.bookingDate}</strong>
              </div>
              <div>
                <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>TIME SLOT</span>
                <strong>{booking.slotTime}</strong>
              </div>
              <div>
                <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>DARSHAN CATEGORY</span>
                <strong>{booking.darshanType}</strong>
              </div>
              <div>
                <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>TOTAL PERSONS</span>
                <strong>{booking.numberOfPeople} Pilgrim(s)</strong>
              </div>
            </div>
          </div>

          {/* Check-in Timestamp Note if Checked In */}
          {booking.bookingStatus === 'CHECKED_IN' && (
            <div className="alert alert-success" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
              <CheckCircle2 size={18} />
              <span>
                <strong>Entry Completed:</strong> Verified on {new Date(booking.checkedInAt).toLocaleString()} by {booking.checkedInBy || 'Gate Staff'}.
              </span>
            </div>
          )}

          {/* Cancellation Option (if not yet checked in) */}
          {booking.bookingStatus === 'CONFIRMED' && (
            <div style={{ textAlign: 'center', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
              <button
                onClick={handleCancelBooking}
                disabled={cancelling}
                className="btn btn-danger btn-sm"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
              >
                <XCircle size={15} />
                <span>{cancelling ? 'Processing Cancellation...' : 'Cancel This Darshan Reservation'}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingDetails;
