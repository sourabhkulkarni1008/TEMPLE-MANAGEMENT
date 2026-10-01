import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import CrowdHeatmap from '../../components/CrowdHeatmap';
import StatusBadge from '../../components/StatusBadge';
import { Eye, RefreshCw, Radio, Sparkles, Users } from 'lucide-react';

const LiveCrowdPublic = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);

  const fetchCrowd = async () => {
    try {
      const res = await api.get('/crowd');
      if (res.success) setData(res);
    } catch (err) {
      console.warn('Failed to fetch crowd:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCrowd();
    const interval = setInterval(fetchCrowd, 10000); // 10s live poll
    return () => clearInterval(interval);
  }, []);

  const handleSimulateTick = async () => {
    setSimulating(true);
    try {
      await api.post('/crowd/demo-tick');
      await fetchCrowd();
    } catch (err) {
      console.warn('Simulate tick failed:', err);
    } finally {
      setSimulating(false);
    }
  };

  return (
    <div className="main-content">
      <div className="container">
        {/* Page Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <h1 style={{ fontSize: '1.8rem', margin: 0 }}>Live Temple Crowd Density</h1>
              <span className="demo-badge">
                <Radio size={12} style={{ marginRight: '4px', animation: 'pulse 1.5s infinite' }} /> Live Analytics
              </span>
            </div>
            <p style={{ fontSize: '0.9rem', color: '#64748b' }}>
              Real-time occupancy monitoring and flow analytics powered by Computer Vision &amp; IoT sensors
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handleSimulateTick}
              className="btn btn-secondary btn-sm"
              disabled={simulating}
              title="Simulates natural pilgrim movements across all holding bays"
            >
              <Sparkles size={14} />
              <span>{simulating ? 'Simulating...' : 'Simulate Demo Shift'}</span>
            </button>
            <button onClick={fetchCrowd} className="btn btn-primary btn-sm">
              <RefreshCw size={14} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Top Summary Bar */}
        <div className="grid-3" style={{ marginBottom: '2rem' }}>
          <div className="card" style={{ padding: '1.25rem' }}>
            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Total Pilgrims on Complex Grounds</span>
            <div style={{ fontSize: '1.8rem', fontWeight: 700, marginTop: '4px' }}>
              {data?.summary?.totalVisitorsInside || '730'} <span style={{ fontSize: '0.9rem', fontWeight: 400, color: '#64748b' }}>/ {data?.summary?.totalCapacity || '1480'} capacity</span>
            </div>
          </div>

          <div className="card" style={{ padding: '1.25rem' }}>
            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Overall Complex Density Level</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px' }}>
              <span style={{ fontSize: '1.6rem', fontWeight: 700 }}>{data?.summary?.overallOccupancyPct || '49.3'}%</span>
              <StatusBadge status={data?.summary?.overallCrowdLevel || 'MODERATE'} />
            </div>
          </div>

          <div className="card" style={{ padding: '1.25rem' }}>
            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Primary Vision Analytics Engine</span>
            <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#0f172a', marginTop: '4px' }}>
              YOLOv8 Person Detection
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
              {data?.summary?.isDemoMode ? 'Demo Computer Vision Stream Mode' : 'Connected RTSP / CCTV Feed'}
            </div>
          </div>
        </div>

        {/* Main Interactive Flow Map */}
        <div style={{ marginBottom: '2rem' }}>
          <CrowdHeatmap areas={data?.areas || []} />
        </div>

        {/* Detailed Area Occupancy Breakdown Table */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Detailed Temple Zone Capacity Breakdown</h2>
          </div>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Temple Zone</th>
                  <th>Current Headcount</th>
                  <th>Maximum Safe Capacity</th>
                  <th>Occupancy %</th>
                  <th>Crowd Level</th>
                  <th>Assigned Camera</th>
                </tr>
              </thead>
              <tbody>
                {data?.areas?.map((a) => (
                  <tr key={a.id}>
                    <td><strong>{a.name}</strong></td>
                    <td style={{ fontWeight: 600 }}>{a.currentCount} persons</td>
                    <td style={{ color: '#64748b' }}>{a.capacity} persons</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '80px', background: '#e2e8f0', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
                          <div
                            style={{
                              width: `${Math.min(100, a.occupancyPct)}%`,
                              height: '100%',
                              background: a.crowdLevel === 'HIGH' ? '#dc2626' : (a.crowdLevel === 'MODERATE' ? '#ca8a04' : '#16a34a')
                            }}
                          />
                        </div>
                        <span>{a.occupancyPct}%</span>
                      </div>
                    </td>
                    <td><StatusBadge status={a.crowdLevel} /></td>
                    <td style={{ fontSize: '0.8rem', color: '#64748b' }}>{a.cameraId || 'CAM-01'}</td>
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

export default LiveCrowdPublic;
