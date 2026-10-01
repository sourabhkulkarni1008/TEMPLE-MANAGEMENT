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
      <div className="dashboard-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '1.6rem', color: '#0f172a', margin: 0 }}>CCTV Vision &amp; Crowd Density Monitor</h1>
              <span className="demo-badge"><Radio size={12} style={{ marginRight: '4px' }} /> YOLOv8 Live Inference</span>
            </div>
            <p style={{ fontSize: '0.9rem', color: '#64748b' }}>
              Real-time Computer Vision feed stream, person detection bounding boxes, and density threshold alerts
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={handleSimulateShift} className="btn btn-secondary btn-sm" title="Simulates realistic random crowd shifts across zones">
              <Sparkles size={14} /> Simulate Shift
            </button>
            <button onClick={fetchCrowd} className="btn btn-primary btn-sm">
              <RefreshCw size={14} /> Refresh
            </button>
          </div>
        </div>

        {/* Heatmap Flow Map */}
        <div style={{ marginBottom: '1.5rem' }}>
          <CrowdHeatmap
            areas={crowdData?.areas || []}
            onAreaClick={handleAreaSelect}
            selectedAreaId={selectedArea?.id}
          />
        </div>

        {/* Vision Analytics & Manual Sensor Control Console */}
        {selectedArea && (
          <div className="grid-2">
            {/* Camera Simulated Stream Box */}
            <div className="card">
              <div className="card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Video size={18} color="#b45309" />
                  <h2 className="card-title">{selectedArea.name} &bull; Stream {selectedArea.cameraId || 'CAM-01'}</h2>
                </div>
                <StatusBadge status={selectedArea.crowdLevel} />
              </div>

              {/* Simulated Camera Viewfinder with YOLO Bounding Boxes */}
              <div
                style={{
                  height: '240px',
                  background: '#0f172a',
                  borderRadius: '6px',
                  position: 'relative',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  marginBottom: '1rem'
                }}
              >
                {/* Simulated Grid overlay */}
                <div style={{ position: 'absolute', inset: 0, opacity: 0.15, backgroundImage: 'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

                {/* Simulated Bounding Boxes */}
                <div style={{ position: 'absolute', top: '25%', left: '30%', width: '45px', height: '80px', border: '2px solid #22c55e', borderRadius: '2px' }}>
                  <span style={{ position: 'absolute', top: '-14px', left: '0', background: '#22c55e', color: '#000', fontSize: '0.65rem', padding: '0 2px', fontWeight: 700 }}>person 0.94</span>
                </div>
                <div style={{ position: 'absolute', top: '35%', left: '48%', width: '50px', height: '85px', border: '2px solid #22c55e', borderRadius: '2px' }}>
                  <span style={{ position: 'absolute', top: '-14px', left: '0', background: '#22c55e', color: '#000', fontSize: '0.65rem', padding: '0 2px', fontWeight: 700 }}>person 0.89</span>
                </div>
                <div style={{ position: 'absolute', top: '28%', left: '65%', width: '48px', height: '82px', border: '2px solid #22c55e', borderRadius: '2px' }}>
                  <span style={{ position: 'absolute', top: '-14px', left: '0', background: '#22c55e', color: '#000', fontSize: '0.65rem', padding: '0 2px', fontWeight: 700 }}>person 0.91</span>
                </div>

                {/* Live Stream Watermark */}
                <div style={{ position: 'absolute', top: '10px', left: '10px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', background: 'rgba(0,0,0,0.6)', padding: '2px 8px', borderRadius: '4px' }}>
                  <span style={{ width: 8, height: 8, background: '#ef4444', borderRadius: '50%', animation: 'pulse 1s infinite' }}></span>
                  <span>LIVE CCTV &bull; {selectedArea.cameraId || 'CAM-01'}</span>
                </div>

                <div style={{ position: 'absolute', bottom: '10px', right: '10px', fontSize: '0.75rem', background: 'rgba(0,0,0,0.6)', padding: '2px 8px', borderRadius: '4px' }}>
                  Detected Headcount: {selectedArea.currentCount} persons
                </div>
              </div>

              <div style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', justifyContent: 'space-between' }}>
                <span>Safe Max Capacity: {selectedArea.capacity} pilgrims</span>
                <span>Calculated Density: {selectedArea.occupancyPct}%</span>
              </div>
            </div>

            {/* Manual Sensor / Count Override Console */}
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Sensor Calibration &amp; Test Override</h2>
              </div>

              {message && <div className="alert alert-success" style={{ padding: '0.6rem' }}>{message}</div>}

              <p style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '1rem', lineHeight: 1.5 }}>
                Allows adjusting or testing crowd values for <strong>{selectedArea.name}</strong> to evaluate automated queue alerts and high crowd triggers.
              </p>

              <form onSubmit={handleUpdateManual}>
                <div className="form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                    <label className="form-label" style={{ margin: 0 }}>Adjust Pilgrim Count ({manualCount} people)</label>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#b45309' }}>
                      {Math.round((manualCount / selectedArea.capacity) * 100)}% Occupancy
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max={selectedArea.capacity * 1.1}
                    value={manualCount}
                    onChange={(e) => setManualCount(e.target.value)}
                    style={{ width: '100%', cursor: 'pointer' }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Or Direct Numerical Input</label>
                  <input
                    type="number"
                    className="form-input"
                    value={manualCount}
                    onChange={(e) => setManualCount(e.target.value)}
                  />
                </div>

                <button type="submit" className="btn btn-primary" disabled={updating} style={{ width: '100%' }}>
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
