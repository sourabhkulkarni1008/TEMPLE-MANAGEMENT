import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import StatusBadge from '../../components/StatusBadge';
import { Package, Search, RefreshCw, CheckCircle2 } from 'lucide-react';

const AdminLostFound = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');

  const fetchItems = async () => {
    try {
      const res = await api.get('/lost-found');
      if (res.success) setItems(res.items || []);
    } catch (err) {
      console.warn('Failed to load lost items:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await api.put(`/lost-found/${id}`, { status: newStatus });
      fetchItems();
    } catch (err) {
      alert(err.message || 'Failed to update item status.');
    }
  };

  const filtered = filterStatus ? items.filter(i => i.status === filterStatus) : items;

  return (
    <div className="dashboard-layout">
      <div className="dashboard-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <h1 style={{ fontSize: '1.6rem', color: '#0f172a' }}>Lost &amp; Found Property Ledger</h1>
            <p style={{ fontSize: '0.9rem', color: '#64748b' }}>Manage misplaced belongings, claims verification, and security custody tracking</p>
          </div>
          <button onClick={fetchItems} className="btn btn-secondary btn-sm">
            <RefreshCw size={14} /> Refresh
          </button>
        </div>

        {/* Status Filter */}
        <div className="card" style={{ padding: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Filter by Property Status:</span>
            <select
              className="form-select"
              style={{ width: '220px' }}
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">All Properties ({items.length})</option>
              <option value="REPORTED">Reported by Pilgrim</option>
              <option value="FOUND_IN_CUSTODY">In Temple Custody</option>
              <option value="CLAIMED">Claimed &amp; Returned</option>
              <option value="CLOSED">Closed Case</option>
            </select>
          </div>
        </div>

        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-container" style={{ border: 'none' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Item Title</th>
                  <th>Category</th>
                  <th>Found Location</th>
                  <th>Contact Phone</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Change Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((it) => (
                  <tr key={it.id}>
                    <td>
                      <strong>{it.itemName}</strong>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', maxWidth: '240px' }}>{it.description}</div>
                    </td>
                    <td>{it.category}</td>
                    <td>{it.area}</td>
                    <td>{it.contactPhone}</td>
                    <td style={{ fontSize: '0.8rem' }}>{it.reportedDate}</td>
                    <td><StatusBadge status={it.status} /></td>
                    <td>
                      <select
                        className="form-select"
                        style={{ fontSize: '0.75rem', padding: '3px 6px', width: 'auto' }}
                        value={it.status}
                        onChange={(e) => handleUpdateStatus(it.id, e.target.value)}
                      >
                        <option value="REPORTED">REPORTED</option>
                        <option value="FOUND_IN_CUSTODY">FOUND_IN_CUSTODY</option>
                        <option value="CLAIMED">CLAIMED</option>
                        <option value="CLOSED">CLOSED</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLostFound;
