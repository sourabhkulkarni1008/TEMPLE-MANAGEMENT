import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import CrowdHeatmap from '../../components/CrowdHeatmap';
import StatusBadge from '../../components/StatusBadge';
import Temple3DViewer from '../../components/Temple3DViewer';
import CctvMatrix from '../../components/CctvMatrix';
import { Eye, RefreshCw, Radio, Sparkles, Users, Box, Layers, ShieldCheck, Activity, Video } from 'lucide-react';
import { audioService } from '../../utils/audioService';

const LiveCrowdPublic = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);
  const [viewTab, setViewTab] = useState('3D'); // '3D' or '2D_HEATMAP'
  const [selectedZone, setSelectedZone] = useState(null);

  const fetchCrowd = async () => {
    try {
      const res = await api.get('/crowd');
      if (res.success) setData(res);
    } catch (err) {
      // Fallback sample data if backend is offline
      setData({
        summary: {
          totalVisitorsInside: 745,
          totalCapacity: 1480,
          overallOccupancyPct: 50.3,
          overallCrowdLevel: 'MODERATE',
          isDemoMode: true
        },
        areas: [
          { id: '1', name: 'Garbhagriha (Sanctum)', currentCount: 142, capacity: 200, occupancyPct: 71, crowdLevel: 'MODERATE', cameraId: 'CAM-01 (Sanctum)' },
          { id: '2', name: 'Gate 1 (East Entry)', currentCount: 210, capacity: 350, occupancyPct: 60, crowdLevel: 'MODERATE', cameraId: 'CAM-02 (East Arch)' },
          { id: '3', name: 'Sabha Mandap Queue', currentCount: 220, capacity: 400, occupancyPct: 55, crowdLevel: 'MODERATE', cameraId: 'CAM-03 (Mandap)' },
          { id: '4', name: 'VIP Fast-Track Corridor', currentCount: 45, capacity: 150, occupancyPct: 30, crowdLevel: 'LOW', cameraId: 'CAM-04 (VIP Arcade)' },
          { id: '5', name: 'Maha Prasad Distribution', currentCount: 98, capacity: 250, occupancyPct: 39, crowdLevel: 'LOW', cameraId: 'CAM-05 (Prasad Hall)' },
          { id: '6', name: 'Outer Parikrama Grounds', currentCount: 30, capacity: 130, occupancyPct: 23, crowdLevel: 'LOW', cameraId: 'CAM-06 (Perimeter)' }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCrowd();
    const interval = setInterval(fetchCrowd, 6000); // 6s poll
    return () => clearInterval(interval);
  }, []);

  const handleSimulateTick = async () => {
    setSimulating(true);
    audioService.playAartiChime();
    try {
      await api.post('/crowd/demo-tick');
      await fetchCrowd();
    } catch (err) {
      // Mock simulation shift
      if (data && data.areas) {
        const updatedAreas = data.areas.map(a => {
          const shift = Math.floor((Math.random() - 0.45) * 15);
          const newCount = Math.max(10, Math.min(a.capacity, a.currentCount + shift));
          const pct = Math.round((newCount / a.capacity) * 100);
          return {
            ...a,
            currentCount: newCount,
            occupancyPct: pct,
            crowdLevel: pct > 80 ? 'HIGH' : (pct > 45 ? 'MODERATE' : 'LOW')
          };
        });
        const total = updatedAreas.reduce((s, a) => s + a.currentCount, 0);
        setData({
          ...data,
          summary: {
            ...data.summary,
            totalVisitorsInside: total,
            overallOccupancyPct: Math.round((total / (data.summary?.totalCapacity || 1480)) * 100)
          },
          areas: updatedAreas
        });
      }
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
              <h1 style={{ fontSize: '1.8rem', margin: 0, fontWeight: 800 }}>Live Temple Crowd &amp; Queue Vision</h1>
              <span className="demo-badge" style={{ background: '#dcfce7', color: '#166534', border: '1px solid #86efac', padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center' }}>
                <Radio size={12} style={{ marginRight: '4px', animation: 'pulse 1.5s infinite' }} /> 3D Digital Twin Active
              </span>
            </div>
            <p style={{ fontSize: '0.9rem', color: '#64748b' }}>
              Real-time 3D diorama, animated queue flow, and Computer Vision density matrix.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handleSimulateTick}
              className="btn btn-secondary btn-sm"
              disabled={simulating}
              title="Simulates natural pilgrim movements across all holding areas"
            >
              <Sparkles size={14} />
              <span>{simulating ? 'Simulating...' : 'Simulate Crowd Shift'}</span>
            </button>
            <button onClick={fetchCrowd} className="btn btn-primary btn-sm" style={{ background: 'linear-gradient(135deg, #b45309, #78350f)' }}>
              <RefreshCw size={14} />
              <span>Live Refresh</span>
            </button>
          </div>
        </div>

        {/* Top Summary Bar */}
        <div className="grid-3" style={{ marginBottom: '1.75rem' }}>
          <div className="card card-gold-trim glass-card" style={{ padding: '1.4rem' }}>
            <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Total Devotees on Complex Grounds</span>
            <div style={{ fontSize: '1.9rem', fontWeight: 800, marginTop: '4px', color: '#0f172a', fontFamily: 'Outfit, sans-serif' }}>
              {data?.summary?.totalVisitorsInside || '745'} <span style={{ fontSize: '0.9rem', fontWeight: 500, color: '#64748b' }}>/ {data?.summary?.totalCapacity || '1480'} capacity</span>
            </div>
          </div>

          <div className="card card-gold-trim glass-card" style={{ padding: '1.4rem' }}>
            <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Overall Complex Density Level</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px' }}>
              <span style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'Outfit, sans-serif' }}>{data?.summary?.overallOccupancyPct || '50.3'}%</span>
              <StatusBadge status={data?.summary?.overallCrowdLevel || 'MODERATE'} />
            </div>
          </div>

          <div className="card card-gold-trim glass-card" style={{ padding: '1.4rem' }}>
            <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Computer Vision Engine</span>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginTop: '4px', fontFamily: 'Outfit, sans-serif' }}>
              YOLOv8 Real-Time Detection
            </div>
            <div style={{ fontSize: '0.78rem', color: '#16a34a', marginTop: '6px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className="pulse-dot" style={{ width: '7px', height: '7px', background: '#10b981' }} />
              6 Active High-Definition Stream Feeds
            </div>
          </div>
        </div>

        {/* View Switcher: 3D Living Model vs 2D Heatmap */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.15rem', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', gap: '6px', background: 'rgba(255, 255, 255, 0.9)', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '5px', borderRadius: '12px', boxShadow: '0 2px 6px rgba(15, 23, 42, 0.04)' }}>
            <button
              onClick={() => {
                setViewTab('3D');
                audioService.playTempleBell(1.1);
              }}
              style={{
                background: viewTab === '3D' ? 'var(--saffron-gradient)' : 'transparent',
                color: viewTab === '3D' ? '#ffffff' : '#475569',
                border: 'none',
                padding: '7px 16px',
                borderRadius: '8px',
                fontSize: '0.86rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: viewTab === '3D' ? '0 2px 8px rgba(249, 115, 22, 0.3)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              <Box size={16} />
              <span>3D Live Crowd Flow</span>
            </button>
            <button
              onClick={() => setViewTab('2D_HEATMAP')}
              style={{
                background: viewTab === '2D_HEATMAP' ? 'var(--saffron-gradient)' : 'transparent',
                color: viewTab === '2D_HEATMAP' ? '#ffffff' : '#475569',
                border: 'none',
                padding: '7px 16px',
                borderRadius: '8px',
                fontSize: '0.86rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: viewTab === '2D_HEATMAP' ? '0 2px 8px rgba(249, 115, 22, 0.3)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              <Layers size={16} />
              <span>2D Density Heatmap</span>
            </button>
          </div>

          <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span className="pulse-dot" style={{ width: '6px', height: '6px', background: '#0284c7' }} />
            Auto-refreshing every 6 seconds
          </span>
        </div>

        {/* Display Active Visualization */}
        <div style={{ marginBottom: '2.5rem' }}>
          {viewTab === '3D' ? (
            <Temple3DViewer
              height="520px"
              realtimeDensity={data?.summary?.totalVisitorsInside || 745}
              onSelectZone={z => setSelectedZone(z)}
            />
          ) : (
            <CrowdHeatmap areas={data?.areas || []} />
          )}
        </div>

        {/* Live CCTV 6-Camera Vision Feeds Matrix */}
        <div style={{ marginBottom: '2.5rem' }}>
          <CctvMatrix showFullControls={true} />
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
