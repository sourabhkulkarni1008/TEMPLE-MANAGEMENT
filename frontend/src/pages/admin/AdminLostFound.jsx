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
                <Package size={24} />
              </span>
              <h1 className="temple-gradient-text" style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0 }}>
                Lost &amp; Found Property Ledger
              </h1>
            </div>
            <p style={{ fontSize: '0.9rem', color: '#64748b', margin: 0 }}>
              Audit misplaced belongings, verify claimant proofs, and update security custody status.
            </p>
          </div>
          <button 
            onClick={fetchItems} 
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', borderRadius: '8px', fontWeight: 600, padding: '0.5rem 0.9rem' }}
          >
            <RefreshCw size={14} /> Refresh Ledger
          </button>
        </div>

        {/* Status Filter */}
        <div className="card card-gold-trim glass-card" style={{ padding: '1.25rem 1.5rem', marginBottom: '1.75rem', borderRadius: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>Filter by Property Status:</span>
            <select
              className="form-select"
              style={{ width: '240px', borderRadius: '8px' }}
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

        <div className="card card-gold-trim glass-card" style={{ padding: 0, overflow: 'hidden', borderRadius: '16px' }}>
          <div className="table-container" style={{ border: 'none', margin: 0 }}>
            <table className="table">
              <thead>
                <tr>
                  <th style={{ paddingLeft: '1.25rem' }}>Item Title &amp; Description</th>
                  <th>Category</th>
                  <th>Found Location</th>
                  <th>Contact Phone</th>
                  <th>Date</th>
                  <th>Current Status</th>
                  <th style={{ paddingRight: '1.25rem' }}>Update Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '3.5rem 1rem', color: '#64748b' }}>
                      <Package size={36} style={{ margin: '0 auto 8px', color: '#cbd5e1' }} />
                      <div style={{ fontWeight: 600 }}>No property items found matching this filter.</div>
                    </td>
                  </tr>
                ) : (
                  filtered.map((it) => (
                    <tr key={it.id}>
                      <td style={{ paddingLeft: '1.25rem' }}>
                        <strong style={{ color: '#0f172a' }}>{it.itemName}</strong>
                        <div style={{ fontSize: '0.8rem', color: '#64748b', maxWidth: '260px', marginTop: '2px', lineHeight: 1.4 }}>{it.description}</div>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.8rem', fontWeight: 600, background: 'rgba(241, 245, 249, 0.9)', padding: '2px 8px', borderRadius: '6px' }}>
                          {it.category}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.85rem' }}>{it.area}</td>
                      <td style={{ fontSize: '0.85rem' }}>{it.contactPhone}</td>
                      <td style={{ fontSize: '0.8rem', color: '#64748b' }}>{it.reportedDate}</td>
                      <td><StatusBadge status={it.status} /></td>
                      <td style={{ paddingRight: '1.25rem' }}>
                        <select
                          className="form-select"
                          style={{ fontSize: '0.8rem', padding: '4px 8px', width: 'auto', borderRadius: '6px' }}
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

export default AdminLostFound;
