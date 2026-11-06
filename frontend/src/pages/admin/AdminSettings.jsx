import React, { useState } from 'react';
import { Settings, Save, CheckCircle2, ShieldCheck, Video, Sliders } from 'lucide-react';

const AdminSettings = () => {
  const [settings, setSettings] = useState({
    templeName: 'Sri Siddhivinayak & Venkateswara Temple Complex',
    templeAddress: 'Temple Hill Shrine Campus, Devgiri Road',
    helplinePhone: '+91 98765 43210',
    helplineEmail: 'support@templedemo.com',
    darshanOpenTime: '05:00 AM',
    darshanCloseTime: '10:30 PM',
    highCrowdThresholdPct: 75.0,
    cameraStreamSimulated: true
  });

  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="dashboard-layout">
      <div className="dashboard-content" style={{ maxWidth: '800px', margin: '0 auto', padding: '1.5rem 1rem' }}>
        <div style={{ marginBottom: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <span style={{ 
              display: 'inline-flex', 
              background: 'rgba(217, 119, 6, 0.15)', 
              color: '#d97706', 
              padding: '8px', 
              borderRadius: '50%',
              border: '1px solid rgba(217, 119, 6, 0.3)'
            }}>
              <Settings size={24} />
            </span>
            <h1 className="temple-gradient-text" style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0 }}>
              Temple Parameters &amp; System Configuration
            </h1>
          </div>
          <p style={{ fontSize: '0.9rem', color: '#64748b', margin: 0 }}>
            Configure operational density thresholds, temple identity parameters, and vision simulation settings.
          </p>
        </div>

        {saved && (
          <div className="alert alert-success" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '0.85rem 1rem', borderRadius: '10px', marginBottom: '1.25rem' }}>
            <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
            <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>System settings saved successfully.</span>
          </div>
        )}

        <div className="card card-gold-trim glass-card" style={{ borderRadius: '16px', padding: '2rem' }}>
          <form onSubmit={handleSave}>
            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>Official Temple Complex Title</label>
              <input
                type="text"
                className="form-input"
                value={settings.templeName}
                onChange={(e) => setSettings({ ...settings, templeName: e.target.value })}
                style={{ borderRadius: '8px' }}
              />
            </div>

            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>Campus Physical Address</label>
              <input
                type="text"
                className="form-input"
                value={settings.templeAddress}
                onChange={(e) => setSettings({ ...settings, templeAddress: e.target.value })}
                style={{ borderRadius: '8px' }}
              />
            </div>

            <div className="grid-2" style={{ gap: '1.25rem', marginBottom: '1.25rem' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>24/7 Helpline Phone</label>
                <input
                  type="text"
                  className="form-input"
                  value={settings.helplinePhone}
                  onChange={(e) => setSettings({ ...settings, helplinePhone: e.target.value })}
                  style={{ borderRadius: '8px' }}
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>Support Email Address</label>
                <input
                  type="email"
                  className="form-input"
                  value={settings.helplineEmail}
                  onChange={(e) => setSettings({ ...settings, helplineEmail: e.target.value })}
                  style={{ borderRadius: '8px' }}
                />
              </div>
            </div>

            <div className="grid-2" style={{ gap: '1.25rem', marginBottom: '1.5rem' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>Daily Gate Opening Time</label>
                <input
                  type="text"
                  className="form-input"
                  value={settings.darshanOpenTime}
                  onChange={(e) => setSettings({ ...settings, darshanOpenTime: e.target.value })}
                  style={{ borderRadius: '8px' }}
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>Daily Gate Closing Time</label>
                <input
                  type="text"
                  className="form-input"
                  value={settings.darshanCloseTime}
                  onChange={(e) => setSettings({ ...settings, darshanCloseTime: e.target.value })}
                  style={{ borderRadius: '8px' }}
                />
              </div>
            </div>

            <div style={{ borderTop: '1px solid rgba(226, 232, 240, 0.8)', paddingTop: '1.5rem', marginTop: '1.5rem', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.5rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sliders size={18} style={{ color: '#d97706' }} /> AI Vision &amp; Crowd Thresholds
              </h3>
              <p style={{ fontSize: '0.825rem', color: '#64748b', marginBottom: '1.25rem' }}>
                Fine-tune automated triggers that escalate alerts to ground marshals.
              </p>

              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>High Crowd Surge Alarm Threshold (%)</label>
                <input
                  type="number"
                  className="form-input"
                  value={settings.highCrowdThresholdPct}
                  onChange={(e) => setSettings({ ...settings, highCrowdThresholdPct: parseFloat(e.target.value) })}
                  style={{ borderRadius: '8px' }}
                />
                <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
                  When area occupancy reaches this percentage, automated crowd alerts and queue throttle recommendations are dispatched.
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginTop: '1rem', background: 'rgba(248, 250, 252, 0.8)', padding: '1rem', borderRadius: '10px', border: '1px solid rgba(226, 232, 240, 0.9)' }}>
                <input
                  type="checkbox"
                  id="simCam"
                  checked={settings.cameraStreamSimulated}
                  onChange={(e) => setSettings({ ...settings, cameraStreamSimulated: e.target.checked })}
                  style={{ width: '18px', height: '18px', cursor: 'pointer', marginTop: '2px', accentColor: '#d97706' }}
                />
                <label htmlFor="simCam" style={{ fontSize: '0.875rem', cursor: 'pointer', fontWeight: 500, color: '#334155' }}>
                  <strong>Enable Prototype CCTV Stream Simulator</strong> (Allows running full AI flow, simulated YOLO bounding boxes, and camera telemetry without physical IP cameras)
                </label>
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ 
                width: '100%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: '8px',
                padding: '0.85rem',
                fontWeight: 700,
                borderRadius: '8px',
                boxShadow: '0 4px 14px rgba(217, 119, 6, 0.35)'
              }}
            >
              <Save size={18} />
              <span>Save System Settings &amp; Thresholds</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
