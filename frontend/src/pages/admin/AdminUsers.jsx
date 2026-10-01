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
      <div className="dashboard-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <h1 style={{ fontSize: '1.6rem', color: '#0f172a' }}>Pilgrim Directory &amp; Bookings Registry</h1>
            <p style={{ fontSize: '0.9rem', color: '#64748b' }}>Search and manage registered pilgrims, verified tickets, and contact records</p>
          </div>
          <button onClick={fetchBookings} className="btn btn-secondary btn-sm">
            <RefreshCw size={14} /> Refresh Records
          </button>
        </div>

        {/* Filter Controls */}
        <div className="card" style={{ padding: '1rem', marginBottom: '1.5rem' }}>
          <div className="grid-3" style={{ gap: '10px' }}>
            <div>
              <input
                type="text"
                className="form-input"
                placeholder="Search Pilgrim Name, Phone, or Booking ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div>
              <select
                className="form-select"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
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
              />
            </div>
          </div>
        </div>

        {/* Pilgrims Table */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-container" style={{ border: 'none' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Booking ID</th>
                  <th>Pilgrim Name</th>
                  <th>Phone</th>
                  <th>Category</th>
                  <th>Visit Date &amp; Slot</th>
                  <th>Party</th>
                  <th>Entry Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b' }}>
                      {loading ? 'Retrieving pilgrim directory...' : 'No pilgrim records match your filters.'}
                    </td>
                  </tr>
                ) : (
                  filtered.map((b) => (
                    <tr key={b.id}>
                      <td style={{ fontWeight: 600, fontFamily: 'monospace' }}>{b.id}</td>
                      <td><strong>{b.primaryPilgrimName}</strong></td>
                      <td>{b.primaryPilgrimPhone}</td>
                      <td>{b.darshanType.split('(')[0]}</td>
                      <td>
                        {b.bookingDate} <span style={{ fontSize: '0.8rem', color: '#64748b' }}>({b.slotTime})</span>
                      </td>
                      <td>{b.numberOfPeople} Person(s)</td>
                      <td><StatusBadge status={b.bookingStatus} /></td>
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
