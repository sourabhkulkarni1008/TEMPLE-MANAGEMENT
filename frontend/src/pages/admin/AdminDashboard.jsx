import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import StatCard from '../../components/StatCard';
import StatusBadge from '../../components/StatusBadge';
import CrowdHeatmap from '../../components/CrowdHeatmap';
import {
  Users,
  CalendarCheck,
  Eye,
  UserCheck,
  AlertTriangle,
  Sparkles,
  RefreshCw,
  ArrowRight,
  Shield,
  FileText
} from 'lucide-react';

const AdminDashboard = () => {
  const [report, setReport] = useState(null);
  const [crowdData, setCrowdData] = useState(null);
  const [festivals, setFestivals] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const [repRes, crowdRes, festRes] = await Promise.all([
        api.get('/reports/daily'),
        api.get('/crowd'),
        api.get('/festivals')
      ]);

      if (repRes.success) setReport(repRes);
      if (crowdRes.success) setCrowdData(crowdRes);
      if (festRes.success) setFestivals(festRes.festivals || []);
    } catch (err) {
      console.warn('Failed to load admin dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 15000);
    return () => clearInterval(interval);
  }, []);

  const activeFestival = festivals.find(f => f.status === 'ACTIVE');

  return (
    <div className="dashboard-layout">
      <div className="dashboard-content">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <h1 style={{ fontSize: '1.6rem', color: '#0f172a' }}>Executive Temple Administration Console</h1>
            <p style={{ fontSize: '0.9rem', color: '#64748b' }}>
              Real-time pilgrim footfall, slot occupancy, staff allocation, and flow management
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Link to="/admin/reports" className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <FileText size={14} />
              <span>Full Reports &amp; CSV</span>
            </Link>
            <button onClick={fetchDashboardData} className="btn btn-primary btn-sm">
              <RefreshCw size={14} /> Refresh
            </button>
          </div>
        </div>

        {/* Festival Mode Indicator Banner */}
        {activeFestival ? (
          <div className="alert alert-warning" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={18} color="#b45309" />
              <span>
                <strong>Festival Mode Active: {activeFestival.name}</strong> &bull; Extended Darshan Hours: {activeFestival.extendedDarshanHours} &bull; +{activeFestival.extraStaffAllocated} extra staff deployed
              </span>
            </div>
            <Link to="/admin/festivals" className="btn btn-secondary btn-sm" style={{ padding: '2px 8px' }}>
              Manage Festival Mode
            </Link>
          </div>
        ) : (
          <div className="alert alert-info" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <span>Standard operating procedures active. No special festival mode overrides.</span>
            <Link to="/admin/festivals" className="btn btn-secondary btn-sm" style={{ padding: '2px 8px' }}>
              Activate Festival Mode
            </Link>
          </div>
        )}

        {/* Top 5 Executive Metric Cards */}
        <div className="grid-4" style={{ marginBottom: '1.5rem' }}>
          <StatCard
            title="Today's Pilgrims"
            value={report?.metrics?.totalPilgrimsExpectedToday || '840'}
            icon={Users}
            subtext="Estimated total daily footfall"
          />
          <StatCard
            title="Today's Bookings"
            value={report?.metrics?.todayBookingsCount || '42'}
            icon={CalendarCheck}
            badgeText={`${report?.metrics?.checkedInCount || '28'} Verified Entry`}
            badgeType="confirmed"
          />
          <StatCard
            title="Live Inside Crowd"
            value={crowdData?.summary?.totalVisitorsInside || '730'}
            icon={Eye}
            badgeText={crowdData?.summary?.overallCrowdLevel || 'MODERATE'}
            badgeType={crowdData?.summary?.overallCrowdLevel?.toLowerCase() || 'moderate'}
          />
          <StatCard
            title="Active Staff on Duty"
            value={report?.metrics?.activeStaffCount || '18'}
            icon={UserCheck}
            subtext="Across 6 temple zones"
          />
        </div>

        {/* Live Crowd Heatmap */}
        <div style={{ marginBottom: '1.5rem' }}>
          <CrowdHeatmap areas={crowdData?.areas || []} />
        </div>

        {/* Analytics & Distribution Grid */}
        <div className="grid-2" style={{ marginBottom: '1.5rem' }}>
          {/* Hourly Visitor Distribution Simple Chart */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Peak Visiting Hours Footfall Profile</h2>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Today's Distribution</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '180px', paddingTop: '20px', gap: '6px' }}>
              {report?.hourlyDistribution?.map((h, i) => {
                const heightPct = Math.min(100, Math.round((h.visitors / 600) * 100));
                return (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                    <div style={{ fontSize: '0.7rem', color: '#64748b', marginBottom: '2px' }}>{h.visitors}</div>
                    <div
                      style={{
                        width: '100%',
                        maxWidth: '28px',
                        height: `${heightPct}%`,
                        background: heightPct > 75 ? '#b45309' : '#f59e0b',
                        borderRadius: '4px 4px 0 0'
                      }}
                      title={`${h.hour}: ${h.visitors} pilgrims`}
                    />
                    <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '6px' }}>{h.hour}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Darshan Breakdown */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Bookings by Darshan Category</h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {report?.darshanBreakdown?.map((db, i) => (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '3px' }}>
                    <span>{db.type.split('(')[0]}</span>
                    <strong>{db.count} pilgrims</strong>
                  </div>
                  <div style={{ width: '100%', background: '#f1f5f9', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${Math.min(100, db.count * 1.5)}%`, background: '#b45309', height: '100%' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Fast Admin Navigation Tiles */}
        <div className="grid-3">
          <Link to="/admin/crowd" className="card" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <Eye size={18} color="#b45309" />
              <h3 style={{ fontSize: '1.05rem', margin: 0 }}>CCTV Crowd Vision Monitor</h3>
            </div>
            <p style={{ fontSize: '0.825rem', color: '#64748b' }}>
              View live AI vision detections, occupancy analytics, and trigger density simulations.
            </p>
          </Link>

          <Link to="/admin/darshan" className="card" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <CalendarCheck size={18} color="#b45309" />
              <h3 style={{ fontSize: '1.05rem', margin: 0 }}>Slot Quota Management</h3>
            </div>
            <p style={{ fontSize: '0.825rem', color: '#64748b' }}>
              Configure daily time slots, capacity limits, and emergency overflow quotas.
            </p>
          </Link>

          <Link to="/admin/staff" className="card" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <UserCheck size={18} color="#b45309" />
              <h3 style={{ fontSize: '1.05rem', margin: 0 }}>Staff Roster &amp; Zones</h3>
            </div>
            <p style={{ fontSize: '0.825rem', color: '#64748b' }}>
              Assign marshals, entry scanners, first-aid responders, and manage shift rosters.
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
