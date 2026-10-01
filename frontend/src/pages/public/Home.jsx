import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import CrowdHeatmap from '../../components/CrowdHeatmap';
import StatusBadge from '../../components/StatusBadge';
import { CalendarCheck, Eye, Clock, ShieldCheck, Sparkles, MapPin, Users, Phone } from 'lucide-react';

const Home = () => {
  const [crowdData, setCrowdData] = useState(null);
  const [darshanTypes, setDarshanTypes] = useState([]);
  const [activeFestival, setActiveFestival] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        const [crowdRes, typesRes, festRes] = await Promise.all([
          api.get('/crowd'),
          api.get('/darshan/types'),
          api.get('/festivals?status=ACTIVE')
        ]);

        if (crowdRes.success) setCrowdData(crowdRes);
        if (typesRes.success) setDarshanTypes(typesRes.types || []);
        if (festRes.success && festRes.festivals?.length > 0) {
          setActiveFestival(festRes.festivals[0]);
        }
      } catch (err) {
        console.warn('Failed loading home data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadHomeData();
  }, []);

  return (
    <div className="main-content">
      <div className="container">
        {/* Active Festival Banner (if active) */}
        {activeFestival && (
          <div className="alert alert-warning" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={18} color="#b45309" />
              <span>
                <strong>Festival Mode Active: {activeFestival.name}</strong> &bull; {activeFestival.specialAnnouncement || 'Extended darshan timings in effect.'}
              </span>
            </div>
            <Link to="/darshan" className="btn btn-primary btn-sm" style={{ padding: '2px 10px' }}>
              Reserve Festival Slot
            </Link>
          </div>
        )}

        {/* Hero Section */}
        <section className="card" style={{ background: '#ffffff', padding: '2.5rem 2rem', marginBottom: '2rem' }}>
          <div style={{ maxWidth: '780px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#fef3c7', color: '#b45309', padding: '4px 10px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600, marginBottom: '1rem' }}>
              <ShieldCheck size={14} /> Official Pilgrim Management Portal
            </div>
            <h1 style={{ fontSize: '2.2rem', color: '#0f172a', marginBottom: '0.75rem', fontWeight: 700 }}>
              Plan your temple visit with ease.
            </h1>
            <p style={{ fontSize: '1.05rem', lineHeight: 1.6, color: '#475569', marginBottom: '1.75rem' }}>
              Reserve darshan time slots online, generate digital QR entry passes, check real-time crowd density across sanctum holding bays, and minimize queue waiting time.
            </p>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <Link to="/darshan" className="btn btn-primary btn-lg" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CalendarCheck size={18} />
                <span>Book Darshan Slot</span>
              </Link>
              <Link to="/crowd" className="btn btn-secondary btn-lg" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Eye size={18} />
                <span>Check Live Crowd</span>
              </Link>
            </div>
          </div>
        </section>

        {/* Summary Metrics Bar */}
        <div className="grid-4" style={{ marginBottom: '2rem' }}>
          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Current Inside Crowd</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', marginTop: '4px' }}>
              {crowdData?.summary?.totalVisitorsInside || '730'} <span style={{ fontSize: '0.85rem', fontWeight: 400, color: '#64748b' }}>pilgrims</span>
            </div>
            <div style={{ marginTop: '6px' }}>
              <StatusBadge status={crowdData?.summary?.overallCrowdLevel || 'LOW'} />
            </div>
          </div>

          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Queue Waiting Time</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', marginTop: '4px' }}>
              15 - 25 <span style={{ fontSize: '0.85rem', fontWeight: 400, color: '#64748b' }}>minutes</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#166534', marginTop: '6px' }}>
              &check; Steady queue flow
            </div>
          </div>

          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Temple Gate Timings</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginTop: '4px' }}>
              05:00 AM - 10:30 PM
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '6px' }}>
              Maha Aarti at 07:00 PM
            </div>
          </div>

          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>24/7 Pilgrim Helpline</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginTop: '4px' }}>
              +91 98765 43210
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '6px' }}>
              First-aid &amp; Help Desk Active
            </div>
          </div>
        </div>

        {/* Live Crowd Density Map Section */}
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <div>
              <h2 style={{ fontSize: '1.35rem' }}>Real-Time Temple Area Crowd Density</h2>
              <p style={{ fontSize: '0.875rem' }}>CCTV vision stream analytics for crowd flow and bottleneck management</p>
            </div>
            <Link to="/crowd" className="btn btn-secondary btn-sm">
              View Detailed Analytics &rarr;
            </Link>
          </div>

          <CrowdHeatmap areas={crowdData?.areas || []} />
        </div>

        {/* Available Darshan Categories */}
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{ marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.35rem' }}>Darshan Booking Categories</h2>
            <p style={{ fontSize: '0.875rem' }}>Select a darshan category to view quotas and proceed with slot reservation</p>
          </div>

          <div className="grid-2">
            {darshanTypes.map((dt) => (
              <div key={dt.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <h3 style={{ fontSize: '1.1rem', color: '#0f172a' }}>{dt.name}</h3>
                    <span style={{ fontWeight: 700, color: dt.price === 0 ? '#166534' : '#b45309', fontSize: '1.1rem' }}>
                      {dt.price === 0 ? 'Free' : `₹${dt.price}`}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.875rem', marginBottom: '1rem', lineHeight: 1.5 }}>{dt.description}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', fontSize: '0.8rem', color: '#64748b', marginBottom: '1rem', background: '#f8fafc', padding: '8px 12px', borderRadius: '6px' }}>
                    <span><strong>Duration:</strong> {dt.approxDuration}</span>
                    <span>
                      <strong style={{ color: dt.availablePasses > 0 ? (dt.price === 0 ? '#166534' : '#b45309') : '#991b1b' }}>
                        {dt.price === 0 ? 'Free Passes Left:' : 'Passes Available:'} {dt.availablePasses ?? dt.quotaPerSlot}
                      </strong>
                    </span>
                  </div>
                </div>
                <Link to={`/user/book-darshan?type=${encodeURIComponent(dt.name)}`} className="btn btn-primary" style={{ width: '100%' }}>
                  {dt.price === 0 ? 'Book Free Pass' : 'Reserve Paid Slot'}
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Essential Pilgrim Guidelines Banner */}
        <div className="card" style={{ background: '#fffbeb', borderColor: '#fde68a', padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', color: '#92400e', marginBottom: '0.5rem' }}>Visiting Guidelines &amp; Protocol</h3>
          <ul style={{ paddingLeft: '1.25rem', fontSize: '0.875rem', color: '#78350f', lineHeight: 1.7 }}>
            <li>Pilgrims must arrive at the entry gate 15 minutes before the scheduled booking time slot.</li>
            <li>Digital QR pass generated after booking must be presented on mobile or physical printout.</li>
            <li>Free footwear storage and purified drinking water stations are available across all holding bays.</li>
            <li>Traditional dress code is encouraged inside the temple premises.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Home;
