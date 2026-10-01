import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';
import StatCard from '../../components/StatCard';
import StatusBadge from '../../components/StatusBadge';
import CrowdHeatmap from '../../components/CrowdHeatmap';
import { QrCode, ListOrdered, AlertTriangle, Users, CheckCircle2, Shield, Clock } from 'lucide-react';

const StaffDashboard = () => {
  const { user } = useAuth();
  const [crowdData, setCrowdData] = useState(null);
  const [queues, setQueues] = useState([]);
  const [emergencies, setEmergencies] = useState([]);
  const [recentScans, setRecentScans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStaffOverview = async () => {
      try {
        const [crowdRes, queueRes, emgRes, bookingsRes] = await Promise.all([
          api.get('/crowd'),
          api.get('/queue'),
          api.get('/emergency?status=PENDING'),
          api.get('/bookings?status=CHECKED_IN&limit=5')
        ]);

        if (crowdRes.success) setCrowdData(crowdRes);
        if (queueRes.success) setQueues(queueRes.queues || []);
        if (emgRes.success) setEmergencies(emgRes.emergencies || []);
        if (bookingsRes.success) setRecentScans(bookingsRes.bookings || []);
      } catch (err) {
        console.warn('Staff overview fetch failed:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStaffOverview();
    const interval = setInterval(fetchStaffOverview, 12000);
    return () => clearInterval(interval);
  }, []);

  const primaryQueue = queues[0] || { currentServingToken: 'A-142', waitingCount: 58, status: 'ACTIVE' };

  return (
    <div className="dashboard-layout">
      <div className="dashboard-content">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '1.6rem', color: '#0f172a', margin: 0 }}>Staff Duty Console</h1>
              <span className="badge badge-confirmed">On Duty</span>
            </div>
            <p style={{ fontSize: '0.9rem', color: '#64748b', marginTop: '2px' }}>
              Officer: <strong>{user?.name}</strong> &bull; Dept: <strong>{user?.staffProfile?.department || 'Entry Management'}</strong> &bull; Zone: <strong>{user?.staffProfile?.assignedArea || 'Main Entrance'}</strong>
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <Link to="/staff/qr-scanner" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <QrCode size={16} />
              <span>Launch QR Scanner</span>
            </Link>
          </div>
        </div>

        {/* Emergency Alert Notification (if active) */}
        {emergencies.length > 0 && (
          <div className="alert alert-danger" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={20} />
              <span>
                <strong>{emergencies.length} Active Emergency Alerts:</strong> Immediate assistance required in {emergencies[0].area} ({emergencies[0].emergencyType}).
              </span>
            </div>
            <Link to="/staff/emergency" className="btn btn-danger btn-sm" style={{ padding: '2px 10px' }}>
              Respond Now
            </Link>
          </div>
        )}

        {/* Top Operational Metrics */}
        <div className="grid-4" style={{ marginBottom: '1.5rem' }}>
          <StatCard
            title="Now Serving Token"
            value={primaryQueue.currentServingToken}
            icon={ListOrdered}
            badgeText={primaryQueue.status}
            badgeType={primaryQueue.status === 'ACTIVE' ? 'confirmed' : 'moderate'}
          />
          <StatCard
            title="Queue Waiting Count"
            value={`${primaryQueue.waitingCount} pilgrims`}
            icon={Users}
            subtext="Estimated wait ~25m"
          />
          <StatCard
            title="Gate Entry Crowd Level"
            value={crowdData?.summary?.overallCrowdLevel || 'LOW'}
            icon={Shield}
            badgeText={`${crowdData?.summary?.overallOccupancyPct || '45'}% Full`}
            badgeType={crowdData?.summary?.overallCrowdLevel?.toLowerCase() || 'low'}
          />
          <StatCard
            title="Open Incidents"
            value={emergencies.length}
            icon={AlertTriangle}
            badgeText={emergencies.length > 0 ? 'Requires Action' : 'All Clear'}
            badgeType={emergencies.length > 0 ? 'high' : 'confirmed'}
          />
        </div>

        {/* Live Crowd Heatmap */}
        <div style={{ marginBottom: '1.5rem' }}>
          <CrowdHeatmap areas={crowdData?.areas || []} />
        </div>

        {/* Operational Modules Grid */}
        <div className="grid-2">
          {/* Recent QR Verifications */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Recent Gate Check-Ins</h2>
              <Link to="/staff/qr-scanner" style={{ fontSize: '0.825rem' }}>Open Scanner</Link>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {recentScans.length === 0 ? (
                <p style={{ fontSize: '0.85rem', color: '#64748b' }}>No entries scanned during current shift yet.</p>
              ) : (
                recentScans.map((s) => (
                  <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid #f1f5f9' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{s.primaryPilgrimName}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{s.id} &bull; {s.numberOfPeople} person(s) &bull; {s.darshanType}</div>
                    </div>
                    <span className="badge badge-checked-in">Verified &check;</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Shift Tools */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Staff Shift Controls</h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Link to="/staff/qr-scanner" className="btn btn-primary" style={{ justifyContent: 'flex-start' }}>
                <QrCode size={16} />
                <span>Verify Pilgrim QR Token (Camera / Manual Entry)</span>
              </Link>
              <Link to="/staff/queue" className="btn btn-secondary" style={{ justifyContent: 'flex-start' }}>
                <ListOrdered size={16} />
                <span>Advance or Pause Queue Token Movement</span>
              </Link>
              <Link to="/staff/emergency" className="btn btn-secondary" style={{ justifyContent: 'flex-start' }}>
                <AlertTriangle size={16} />
                <span>View &amp; Resolve Active Ground Emergencies</span>
              </Link>
              <Link to="/staff/tasks" className="btn btn-secondary" style={{ justifyContent: 'flex-start' }}>
                <Clock size={16} />
                <span>View Shift Schedule &amp; Assigned Duties</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;
