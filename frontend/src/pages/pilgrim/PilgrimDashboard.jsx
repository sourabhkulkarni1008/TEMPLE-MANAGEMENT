import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';
import StatCard from '../../components/StatCard';
import StatusBadge from '../../components/StatusBadge';
import CrowdHeatmap from '../../components/CrowdHeatmap';
import { CalendarCheck, QrCode, AlertTriangle, Eye, Clock, Users, ArrowRight } from 'lucide-react';

const PilgrimDashboard = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [crowdData, setCrowdData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [bookingsRes, crowdRes] = await Promise.all([
          api.get('/bookings?limit=5'),
          api.get('/crowd')
        ]);
        if (bookingsRes.success) setBookings(bookingsRes.bookings || []);
        if (crowdRes.success) setCrowdData(crowdRes);
      } catch (err) {
        console.warn('Dashboard load error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const activeBooking = bookings.find(b => b.bookingStatus === 'CONFIRMED');

  return (
    <div className="dashboard-layout">
      <div className="dashboard-content">
        {/* Welcome Banner */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '1.6rem', color: '#0f172a' }}>Welcome, {user?.name}!</h1>
          <p style={{ fontSize: '0.9rem', color: '#64748b' }}>
            Pilgrim ID: {user?.id} &bull; Manage your temple visits and digital QR passes
          </p>
        </div>

        {/* Top Metric Cards */}
        <div className="grid-4" style={{ marginBottom: '1.5rem' }}>
          <StatCard
            title="Total Bookings"
            value={bookings.length}
            icon={CalendarCheck}
            subtext="Lifetime visits registered"
          />
          <StatCard
            title="Next Active Visit"
            value={activeBooking ? activeBooking.bookingDate : 'None'}
            icon={QrCode}
            badgeText={activeBooking ? activeBooking.slotTime : 'No Active Slot'}
            badgeType={activeBooking ? 'confirmed' : 'low'}
          />
          <StatCard
            title="Current Crowd"
            value={crowdData?.summary?.overallOccupancyPct ? `${crowdData.summary.overallOccupancyPct}%` : '49%'}
            icon={Eye}
            badgeText={crowdData?.summary?.overallCrowdLevel || 'MODERATE'}
            badgeType={crowdData?.summary?.overallCrowdLevel?.toLowerCase() || 'moderate'}
          />
          <StatCard
            title="Estimated Waiting"
            value="15 - 20m"
            icon={Clock}
            subtext="At Queue Holding Bays"
          />
        </div>

        {/* Active Upcoming Booking Callout (if present) */}
        {activeBooking && (
          <div className="card" style={{ background: '#fffbeb', borderColor: '#fde68a', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <span className="badge badge-confirmed" style={{ marginBottom: '4px' }}>&bull; Active Upcoming Darshan</span>
                <h3 style={{ fontSize: '1.15rem', color: '#92400e', marginTop: '2px' }}>
                  {activeBooking.darshanType} ({activeBooking.id})
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#78350f', marginTop: '2px' }}>
                  Date: <strong>{activeBooking.bookingDate}</strong> &bull; Time: <strong>{activeBooking.slotTime}</strong> &bull; Pilgrims: <strong>{activeBooking.numberOfPeople} Person(s)</strong>
                </p>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <Link to={`/user/booking/${activeBooking.id}`} className="btn btn-primary btn-sm">
                  <QrCode size={15} />
                  <span>View Entry QR Code</span>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Live Temple Flow Heatmap */}
        <div style={{ marginBottom: '1.5rem' }}>
          <CrowdHeatmap areas={crowdData?.areas || []} />
        </div>

        {/* Quick Actions & Recent Bookings */}
        <div className="grid-2">
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Recent Darshan Bookings</h2>
              <Link to="/user/bookings" style={{ fontSize: '0.825rem' }}>View All</Link>
            </div>
            {bookings.length === 0 ? (
              <p style={{ fontSize: '0.85rem', color: '#64748b' }}>You have not booked any darshan slots yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {bookings.slice(0, 3).map((b) => (
                  <div
                    key={b.id}
                    style={{
                      border: '1px solid #f1f5f9',
                      borderRadius: '6px',
                      padding: '0.75rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{b.darshanType.split('(')[0]}</div>
                      <div style={{ fontSize: '0.775rem', color: '#64748b' }}>
                        {b.bookingDate} &bull; {b.slotTime} ({b.id})
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <StatusBadge status={b.bookingStatus} />
                      <Link to={`/user/booking/${b.id}`} className="btn btn-secondary btn-sm" style={{ padding: '2px 8px', fontSize: '0.75rem' }}>
                        QR
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Quick Pilgrim Actions</h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Link to="/user/book-darshan" className="btn btn-primary" style={{ justifyContent: 'flex-start' }}>
                <CalendarCheck size={16} />
                <span>Book a New Darshan Slot</span>
              </Link>
              <Link to="/crowd" className="btn btn-secondary" style={{ justifyContent: 'flex-start' }}>
                <Eye size={16} />
                <span>Check Real-Time Crowd Density Map</span>
              </Link>
              <Link to="/user/emergency" className="btn btn-danger" style={{ justifyContent: 'flex-start' }}>
                <AlertTriangle size={16} />
                <span>Request Emergency Ground Assistance (SOS)</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PilgrimDashboard;
