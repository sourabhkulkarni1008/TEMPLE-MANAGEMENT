import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import CrowdHeatmap from '../../components/CrowdHeatmap';
import StatusBadge from '../../components/StatusBadge';
import { Eye, Video, Sparkles, RefreshCw, Sliders, Radio, AlertCircle } from 'lucide-react';

const AdminCrowdMonitoring = () => {
  const [crowdData, setCrowdData] = useState(null);
  const [selectedArea, setSelectedArea] = useState(null);
  const [manualCount, setManualCount] = useState(100);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState('');

  const fetchCrowd = async () => {
    try {
      const res = await api.get('/crowd');
      if (res.success) {
        setCrowdData(res);
        if (!selectedArea && res.areas?.length > 0) {
          setSelectedArea(res.areas[0]);
          setManualCount(res.areas[0].currentCount);
        } else if (selectedArea) {
          const updated = res.areas.find(a => a.id === selectedArea.id);
          if (updated) setSelectedArea(updated);
        }
      }
    } catch (err) {
      console.warn('Failed to load crowd:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCrowd();
    const interval = setInterval(fetchCrowd, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleAreaSelect = (area) => {
    setSelectedArea(area);
    setManualCount(area.currentCount);
    setMessage('');
  };

  const handleUpdateManual = async (e) => {
    e.preventDefault();
    if (!selectedArea) return;
    setUpdating(true);
    setMessage('');

    try {
      const res = await api.post('/crowd/update', {
        area: selectedArea.id,
        peopleCount: parseInt(manualCount, 10),
        source: 'MANUAL_ADMIN_OVERRIDE',
        deviceId: selectedArea.cameraId || 'CAM-01'
      });
      if (res.success) {
        setMessage(`Crowd count updated for ${selectedArea.name}.`);
        fetchCrowd();
      }
    } catch (err) {
      alert(err.message || 'Failed to update crowd.');
    } finally {
      setUpdating(false);
    }
  };

  const handleSimulateShift = async () => {
    try {
      await api.post('/crowd/demo-tick');
      fetchCrowd();
    } catch (err) {
      console.warn('Simulation tick failed:', err);
    }
  };

  return (
    <div className="dashboard-layout">
      <div className="dashboard-content" style={{ padding: '1.5rem 1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.75rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
              <h1 className="temple-gradient-text" style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0 }}>
                CCTV Vision &amp; Crowd Density Telemetry
              </h1>
              <span className="badge badge-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', padding: '3px 8px' }}>
                <Radio size={12} /> YOLOv8 Live Inference
              </span>
            </div>
            <p style={{ fontSize: '0.9rem', color: '#64748b', margin: 0 }}>
              Real-time Computer Vision feed stream, pedestrian bounding box tracking, and intelligent queue bottleneck mitigation.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              onClick={handleSimulateShift} 
              className="btn btn-secondary btn-sm" 
              title="Simulates realistic random crowd shifts across zones"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', borderRadius: '8px', fontWeight: 600 }}
            >
              <Sparkles size={14} /> Simulate Shift
            </button>
            <button 
              onClick={fetchCrowd} 
              className="btn btn-primary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', borderRadius: '8px', fontWeight: 700 }}
            >
              <RefreshCw size={14} /> Refresh Sensors
            </button>
          </div>
        </div>

        {/* Heatmap Flow Map */}
        <div style={{ marginBottom: '1.75rem' }}>
          <CrowdHeatmap
            areas={crowdData?.areas || []}
            onAreaClick={handleAreaSelect}
            selectedAreaId={selectedArea?.id}
          />
        </div>

        {/* Vision Analytics & Manual Sensor Control Console */}
        {selectedArea && (
          <div className="grid-2" style={{ gap: '1.5rem' }}>
            {/* Camera Simulated Stream Box */}
            <div className="card card-gold-trim glass-card" style={{ borderRadius: '16px', padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Video size={20} style={{ color: '#d97706' }} />
                  <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    {selectedArea.name} &bull; Stream {selectedArea.cameraId || 'CAM-01'}
                  </h2>
                </div>
                <StatusBadge status={selectedArea.crowdLevel} />
              </div>

              {/* Simulated Camera Viewfinder with YOLO Bounding Boxes */}
              <div
                style={{
                  height: '240px',
                  background: 'linear-gradient(135deg, #020617 0%, #0f172a 100%)',
                  borderRadius: '12px',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  position: 'relative',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  marginBottom: '1.25rem',
                  boxShadow: 'inset 0 0 30px rgba(0,0,0,0.8)'
                }}
              >
                {/* Simulated Grid overlay */}
                <div style={{ position: 'absolute', inset: 0, opacity: 0.12, backgroundImage: 'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

                {/* Corner reticle marks */}
                <div style={{ position: 'absolute', top: 12, left: 12, width: 14, height: 14, borderLeft: '2px solid #f59e0b', borderTop: '2px solid #f59e0b' }} />
                <div style={{ position: 'absolute', top: 12, right: 12, width: 14, height: 14, borderRight: '2px solid #f59e0b', borderTop: '2px solid #f59e0b' }} />
                <div style={{ position: 'absolute', bottom: 12, left: 12, width: 14, height: 14, borderLeft: '2px solid #f59e0b', borderBottom: '2px solid #f59e0b' }} />
                <div style={{ position: 'absolute', bottom: 12, right: 12, width: 14, height: 14, borderRight: '2px solid #f59e0b', borderBottom: '2px solid #f59e0b' }} />

                {/* Simulated Bounding Boxes */}
                <div style={{ position: 'absolute', top: '25%', left: '30%', width: '45px', height: '80px', border: '2px solid #10b981', borderRadius: '3px', boxShadow: '0 0 10px rgba(16, 185, 129, 0.4)' }}>
                  <span style={{ position: 'absolute', top: '-15px', left: '-1px', background: '#10b981', color: '#000', fontSize: '0.65rem', padding: '1px 4px', fontWeight: 800, borderRadius: '2px' }}>person 0.94</span>
                </div>
                <div style={{ position: 'absolute', top: '35%', left: '48%', width: '50px', height: '85px', border: '2px solid #10b981', borderRadius: '3px', boxShadow: '0 0 10px rgba(16, 185, 129, 0.4)' }}>
                  <span style={{ position: 'absolute', top: '-15px', left: '-1px', background: '#10b981', color: '#000', fontSize: '0.65rem', padding: '1px 4px', fontWeight: 800, borderRadius: '2px' }}>person 0.89</span>
                </div>
                <div style={{ position: 'absolute', top: '28%', left: '65%', width: '48px', height: '82px', border: '2px solid #10b981', borderRadius: '3px', boxShadow: '0 0 10px rgba(16, 185, 129, 0.4)' }}>
                  <span style={{ position: 'absolute', top: '-15px', left: '-1px', background: '#10b981', color: '#000', fontSize: '0.65rem', padding: '1px 4px', fontWeight: 800, borderRadius: '2px' }}>person 0.91</span>
                </div>

                {/* Live Stream Watermark */}
                <div style={{ position: 'absolute', top: '12px', left: '14px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', background: 'rgba(15, 23, 42, 0.75)', padding: '3px 9px', borderRadius: '6px', border: '1px solid rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(4px)' }}>
                  <span className="pulse-dot" style={{ background: '#ef4444' }} />
                  <span style={{ fontWeight: 700, letterSpacing: '0.04em' }}>LIVE OPTICS &bull; {selectedArea.cameraId || 'CAM-01'}</span>
                </div>

                <div style={{ position: 'absolute', bottom: '12px', right: '14px', fontSize: '0.75rem', background: 'rgba(15, 23, 42, 0.75)', padding: '3px 9px', borderRadius: '6px', border: '1px solid rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(4px)', fontWeight: 600 }}>
                  Detected Headcount: <strong style={{ color: '#fbbf24' }}>{selectedArea.currentCount} pilgrims</strong>
                </div>
              </div>

              <div style={{ fontSize: '0.85rem', color: '#64748b', display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(226, 232, 240, 0.8)', paddingTop: '0.85rem' }}>
                <span>Safe Max Capacity: <strong style={{ color: '#0f172a' }}>{selectedArea.capacity}</strong></span>
                <span>Calculated Density: <strong style={{ color: selectedArea.occupancyPct > 80 ? '#dc2626' : '#16a34a' }}>{selectedArea.occupancyPct}%</strong></span>
              </div>
            </div>

            {/* Manual Sensor / Count Override Console */}
            <div className="card glass-card" style={{ borderRadius: '16px', padding: '1.5rem' }}>
              <div style={{ marginBottom: '1.25rem' }}>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Sensor Calibration &amp; Test Override
                </h2>
                <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>
                  Target Zone: <strong style={{ color: '#d97706' }}>{selectedArea.name}</strong>
                </div>
              </div>

              {message && (
                <div className="alert alert-success" style={{ padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1.25rem', fontSize: '0.875rem' }}>
                  {message}
                </div>
              )}

              <p style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '1.25rem', lineHeight: 1.5 }}>
                Allows adjusting or testing crowd values for <strong>{selectedArea.name}</strong> to evaluate automated queue alerts and high crowd triggers.
              </p>

              <form onSubmit={handleUpdateManual}>
                <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <label className="form-label" style={{ margin: 0, fontWeight: 600, fontSize: '0.85rem' }}>Adjust Pilgrim Count ({manualCount} people)</label>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#d97706' }}>
                      {Math.round((manualCount / selectedArea.capacity) * 100)}% Occupancy
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max={selectedArea.capacity * 1.1}
                    value={manualCount}
                    onChange={(e) => setManualCount(e.target.value)}
                    style={{ width: '100%', cursor: 'pointer', accentColor: '#d97706' }}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                  <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>Or Direct Numerical Input</label>
                  <input
                    type="number"
                    className="form-input"
                    value={manualCount}
                    onChange={(e) => setManualCount(e.target.value)}
                    style={{ borderRadius: '8px' }}
                  />
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  disabled={updating} 
                  style={{ width: '100%', padding: '0.85rem', fontWeight: 700, borderRadius: '8px', boxShadow: '0 4px 14px rgba(217, 119, 6, 0.35)' }}
                >
                  {updating ? 'Updating Sensor Value...' : 'Apply Count to Live System'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCrowdMonitoring;
