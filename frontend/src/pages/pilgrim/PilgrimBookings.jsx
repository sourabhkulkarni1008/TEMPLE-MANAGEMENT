import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import StatusBadge from '../../components/StatusBadge';
import { CalendarCheck, QrCode, Search, RefreshCw, XCircle } from 'lucide-react';

const PilgrimBookings = () => {
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
    <div className="dashboard-layout">
      <div className="dashboard-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <h1 style={{ fontSize: '1.6rem', color: '#0f172a' }}>My Darshan Bookings</h1>
            <p style={{ fontSize: '0.9rem', color: '#64748b' }}>View your active digital QR tokens, visit histories, and slot details</p>
          </div>
          <Link to="/user/book-darshan" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CalendarCheck size={16} />
            <span>Book New Slot</span>
          </Link>
        </div>

        {/* Filters */}
        <div className="card" style={{ padding: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '220px' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Search by Booking ID (e.g. DAR-2026-000101)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div style={{ width: '180px' }}>
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

        {/* Bookings List Table */}
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
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b' }}>
                      {loading ? 'Loading your bookings...' : 'No bookings found matching your search.'}
                    </td>
                  </tr>
                ) : (
                  filtered.map((b) => (
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
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PilgrimBookings;
