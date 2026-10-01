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
      <div className="dashboard-content" style={{ maxWidth: '760px', margin: '0 auto' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '1.6rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Settings color="#b45309" /> Temple Parameters &amp; System Configuration
          </h1>
          <p style={{ fontSize: '0.9rem', color: '#64748b' }}>Configure operational thresholds, temple identity parameters, and vision simulation settings</p>
        </div>

        {saved && (
          <div className="alert alert-success" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={16} />
            <span>Settings saved successfully.</span>
          </div>
        )}

        <div className="card">
          <form onSubmit={handleSave}>
            <div className="form-group">
              <label className="form-label">Official Temple Name</label>
              <input
                type="text"
                className="form-input"
                value={settings.templeName}
                onChange={(e) => setSettings({ ...settings, templeName: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Campus Physical Address</label>
              <input
                type="text"
                className="form-input"
                value={settings.templeAddress}
                onChange={(e) => setSettings({ ...settings, templeAddress: e.target.value })}
              />
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">24/7 Helpline Phone</label>
                <input
                  type="text"
                  className="form-input"
                  value={settings.helplinePhone}
                  onChange={(e) => setSettings({ ...settings, helplinePhone: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Support Email Address</label>
                <input
                  type="email"
                  className="form-input"
                  value={settings.helplineEmail}
                  onChange={(e) => setSettings({ ...settings, helplineEmail: e.target.value })}
                />
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Daily Gate Opening Time</label>
                <input
                  type="text"
                  className="form-input"
                  value={settings.darshanOpenTime}
                  onChange={(e) => setSettings({ ...settings, darshanOpenTime: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Daily Gate Closing Time</label>
                <input
                  type="text"
                  className="form-input"
                  value={settings.darshanCloseTime}
                  onChange={(e) => setSettings({ ...settings, darshanCloseTime: e.target.value })}
                />
              </div>
            </div>

            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1.25rem', marginTop: '1rem', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '0.75rem', color: '#0f172a' }}>AI Vision &amp; Crowd Thresholds</h3>

              <div className="form-group">
                <label className="form-label">High Crowd Alarm Threshold (%)</label>
                <input
                  type="number"
                  className="form-input"
                  value={settings.highCrowdThresholdPct}
                  onChange={(e) => setSettings({ ...settings, highCrowdThresholdPct: parseFloat(e.target.value) })}
                />
                <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
                  When area occupancy reaches this percentage, automated crowd alerts and queue throttle recommendations are dispatched.
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '1rem' }}>
                <input
                  type="checkbox"
                  id="simCam"
                  checked={settings.cameraStreamSimulated}
                  onChange={(e) => setSettings({ ...settings, cameraStreamSimulated: e.target.checked })}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <label htmlFor="simCam" style={{ fontSize: '0.875rem', cursor: 'pointer', fontWeight: 500 }}>
                  Enable Prototype CCTV Stream Simulator (Allows running full AI flow without physical IP cameras)
                </label>
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
              <Save size={16} />
              <span>Save System Settings</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
