import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import StatusBadge from '../../components/StatusBadge';
import { Users, Search, RefreshCw, Calendar, Phone, Mail } from 'lucide-react';

const AdminUsers = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterDate, setFilterDate] = useState('');

  const fetchBookings = async () => {
    try {
      const res = await api.get('/bookings?limit=100');
      if (res.success) setBookings(res.bookings || []);
    } catch (err) {
      console.warn('Failed to load pilgrims/bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const filtered = bookings.filter((b) => {
    const matchesSearch = search
      ? b.primaryPilgrimName.toLowerCase().includes(search.toLowerCase()) ||
        b.primaryPilgrimPhone.includes(search) ||
        b.id.toLowerCase().includes(search.toLowerCase())
      : true;
    const matchesType = filterType ? b.darshanType.toLowerCase().includes(filterType.toLowerCase()) : true;
    const matchesDate = filterDate ? b.bookingDate === filterDate : true;
    return matchesSearch && matchesType && matchesDate;
  });

  return (
    <div className="dashboard-layout">
      <div className="dashboard-content" style={{ padding: '1.5rem 1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.75rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
              <span style={{ 
                display: 'inline-flex', 
                background: 'rgba(217, 119, 6, 0.15)', 
                color: '#d97706', 
                padding: '8px', 
                borderRadius: '50%',
                border: '1px solid rgba(217, 119, 6, 0.3)'
              }}>
                <Users size={24} />
              </span>
              <h1 className="temple-gradient-text" style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0 }}>
                Pilgrim Directory &amp; Bookings Registry
              </h1>
            </div>
            <p style={{ fontSize: '0.9rem', color: '#64748b', margin: 0 }}>
              Search registered devotees, verified entry passes, and contact history across all darshan streams.
            </p>
          </div>
          <button 
            onClick={fetchBookings} 
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', borderRadius: '8px', fontWeight: 600, padding: '0.5rem 0.9rem' }}
          >
            <RefreshCw size={14} /> Refresh Records
          </button>
        </div>

        {/* Filter Controls */}
        <div className="card card-gold-trim glass-card" style={{ padding: '1.25rem 1.5rem', marginBottom: '1.75rem', borderRadius: '14px' }}>
          <div className="grid-3" style={{ gap: '1rem' }}>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', color: '#94a3b8' }} />
              <input
                type="text"
                className="form-input"
                placeholder="Search Devotee Name, Phone, or Booking ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ paddingLeft: '38px', borderRadius: '8px' }}
              />
            </div>
            <div>
              <select
                className="form-select"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                style={{ borderRadius: '8px' }}
              >
                <option value="">All Darshan Categories</option>
                <option value="General">General Darshan</option>
                <option value="Special">Special Quick Darshan</option>
                <option value="Senior">Senior Citizen Darshan</option>
                <option value="Suprabhata">Suprabhata Ritual Entry</option>
              </select>
            </div>
            <div>
              <input
                type="date"
                className="form-input"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                style={{ borderRadius: '8px' }}
              />
            </div>
          </div>
        </div>

        {/* Pilgrims Table */}
        <div className="card card-gold-trim glass-card" style={{ padding: 0, overflow: 'hidden', borderRadius: '16px' }}>
          <div className="table-container" style={{ border: 'none', margin: 0 }}>
            <table className="table">
              <thead>
                <tr>
                  <th style={{ paddingLeft: '1.25rem' }}>Booking ID</th>
                  <th>Pilgrim Name</th>
                  <th>Contact Phone</th>
                  <th>Darshan Category</th>
                  <th>Visit Date &amp; Slot</th>
                  <th>Party Size</th>
                  <th style={{ paddingRight: '1.25rem' }}>Pass Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '3.5rem 1rem', color: '#64748b' }}>
                      <Users size={36} style={{ margin: '0 auto 8px', color: '#cbd5e1' }} />
                      <div style={{ fontWeight: 600 }}>{loading ? 'Retrieving pilgrim directory...' : 'No pilgrim records match your filters.'}</div>
                      <div style={{ fontSize: '0.825rem', marginTop: '4px' }}>Try clearing filters or search keywords.</div>
                    </td>
                  </tr>
                ) : (
                  filtered.map((b) => (
                    <tr key={b.id}>
                      <td style={{ fontWeight: 700, fontFamily: 'monospace', color: '#b45309', paddingLeft: '1.25rem' }}>{b.id}</td>
                      <td><strong style={{ color: '#0f172a' }}>{b.primaryPilgrimName}</strong></td>
                      <td style={{ fontSize: '0.85rem' }}>{b.primaryPilgrimPhone}</td>
                      <td>
                        <span style={{ fontSize: '0.8rem', fontWeight: 600, background: 'rgba(241, 245, 249, 0.9)', padding: '2px 8px', borderRadius: '6px' }}>
                          {b.darshanType.split('(')[0]}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.85rem' }}>
                        {b.bookingDate} <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>({b.slotTime})</span>
                      </td>
                      <td style={{ fontWeight: 600 }}>{b.numberOfPeople} Devotee(s)</td>
                      <td style={{ paddingRight: '1.25rem' }}><StatusBadge status={b.bookingStatus} /></td>
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

export default AdminUsers;
