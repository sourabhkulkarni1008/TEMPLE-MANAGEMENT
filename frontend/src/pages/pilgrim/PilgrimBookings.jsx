import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import StatusBadge from '../../components/StatusBadge';
import { useDevice } from '../../utils/useDevice';
import { CalendarCheck, QrCode, Search, RefreshCw, Calendar, Clock, Users, ArrowRight } from 'lucide-react';

const PilgrimBookings = () => {
  const { isMobile } = useDevice();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [search, setSearch] = useState('');

  const fetchBookings = async () => {
    try {
      const res = await api.get('/bookings');
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

  const filtered = bookings.filter((b) => {
    const matchesStatus = filterStatus ? b.bookingStatus === filterStatus : true;
    const matchesSearch = search
      ? b.id.toLowerCase().includes(search.toLowerCase()) ||
        b.darshanType.toLowerCase().includes(search.toLowerCase()) ||
        b.bookingDate.includes(search)
      : true;
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="dashboard-content">
      <div style={{ maxWidth: '1050px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <h1 style={{ fontSize: isMobile ? '1.4rem' : '1.75rem', color: '#1c1917', marginBottom: '4px' }}>
              My Darshan Passes
            </h1>
            <p style={{ fontSize: '0.875rem', color: '#78716c' }}>
              View your active digital QR passes, slot timings, and entry tokens
            </p>
          </div>
          <Link to="/user/book-darshan" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CalendarCheck size={16} />
            <span>Book New Slot</span>
          </Link>
        </div>

        {/* Filters */}
        <div className="card" style={{ padding: '1rem', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Search by ID or Category..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div style={{ width: isMobile ? '100%' : '180px' }}>
              <select
                className="form-select"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="CONFIRMED">Confirmed (Upcoming)</option>
                <option value="CHECKED_IN">Checked In (Completed)</option>
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
          <div className="card" style={{ padding: '2.5rem', textAlign: 'center', color: '#78716c' }}>
            <p>Loading your darshan bookings...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="card" style={{ padding: '3rem 1.5rem', textAlign: 'center' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#fef3c7', color: '#b45309', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
              <QrCode size={28} />
            </div>
            <h3 style={{ fontSize: '1.15rem', color: '#1c1917', marginBottom: '0.5rem' }}>No Bookings Found</h3>
            <p style={{ fontSize: '0.875rem', color: '#78716c', marginBottom: '1.25rem', maxWidth: '380px', margin: '0 auto 1.25rem' }}>
              You do not have any bookings matching this filter. Reserve an auspicious slot for Lord Ganesha darshan today.
            </p>
            <Link to="/user/book-darshan" className="btn btn-primary btn-sm">
              Book a Darshan Slot
            </Link>
          </div>
        ) : isMobile ? (
          /* Mobile Friendly Card List */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {filtered.map((b) => (
              <div key={b.id} className="card" style={{ padding: '1.25rem', marginBottom: 0, border: '1px solid #f1e5d1' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#78716c', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Token ID
                    </span>
                    <div style={{ fontWeight: 800, fontFamily: 'monospace', color: '#1c1917', fontSize: '0.95rem' }}>
                      {b.id}
                    </div>
                  </div>
                  <StatusBadge status={b.bookingStatus} />
                </div>

                <div style={{ fontWeight: 700, fontSize: '1.05rem', color: '#b45309', marginBottom: '0.75rem' }}>
                  {b.darshanType.split('(')[0]}
                </div>

                <div style={{ background: '#fbf8f3', borderRadius: '8px', padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.85rem', color: '#57534e', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Calendar size={15} color="#b45309" />
                    <span><strong>Date:</strong> {b.bookingDate}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Clock size={15} color="#b45309" />
                    <span><strong>Slot:</strong> {b.slotTime}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Users size={15} color="#b45309" />
                    <span><strong>Devotees:</strong> {b.numberOfPeople} person(s)</span>
                  </div>
                </div>

                <Link
                  to={`/user/booking/${b.id}`}
                  className="btn btn-primary"
                  style={{ width: '100%', minHeight: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                  <QrCode size={16} />
                  <span>View &amp; Present QR Pass</span>
                  <ArrowRight size={16} />
                </Link>
              </div>
            ))}
          </div>
        ) : (
          /* Desktop Table View */
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="table-container" style={{ border: 'none' }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Booking ID</th>
                    <th>Darshan Category</th>
                    <th>Visit Date</th>
                    <th>Time Slot</th>
                    <th>Pilgrims</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((b) => (
                    <tr key={b.id}>
                      <td style={{ fontWeight: 600, fontFamily: 'monospace' }}>{b.id}</td>
                      <td>{b.darshanType.split('(')[0]}</td>
                      <td>{b.bookingDate}</td>
                      <td>{b.slotTime}</td>
                      <td>{b.numberOfPeople} person(s)</td>
                      <td><StatusBadge status={b.bookingStatus} /></td>
                      <td>
                        <Link to={`/user/booking/${b.id}`} className="btn btn-secondary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <QrCode size={13} />
                          <span>View QR Pass</span>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PilgrimBookings;
