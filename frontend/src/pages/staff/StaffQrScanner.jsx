import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import api from '../../api/client';
import StatusBadge from '../../components/StatusBadge';
import { QrCode, CheckCircle2, XCircle, AlertTriangle, Search, Camera, ShieldCheck, Image, Volume2, VideoOff } from 'lucide-react';

const StaffQrScanner = () => {
  const [tokenInput, setTokenInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [scanHistory, setScanHistory] = useState([]);
  
  // Camera Scanner States
  const [isScanning, setIsScanning] = useState(false);
  const [cameras, setCameras] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState('');
  const [continuousMode, setContinuousMode] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const scannerRef = useRef(null);
  const fileInputRef = useRef(null);

  const playAudioFeedback = (type) => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'VALID') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(587.33, ctx.currentTime);
        osc.frequency.setValueAtTime(880, ctx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.28);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.28);
      } else {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(320, ctx.currentTime);
        osc.frequency.setValueAtTime(200, ctx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.3);
      }
    } catch (e) {
      console.warn('Audio tone unavailable');
    }
  };

  const handleVerify = async (tokenToVerify = null) => {
    const rawToken = (tokenToVerify || tokenInput).trim();
    if (!rawToken) return;

    setLoading(true);
    setResult(null);

    try {
      const res = await api.post('/bookings/verify-qr', { qrToken: rawToken });
      setResult(res);
      playAudioFeedback(res.status);

      if (res.status === 'VALID' && res.booking) {
        setScanHistory((prev) => [
          {
            id: res.booking.id,
            name: res.booking.primaryPilgrimName,
            time: new Date().toLocaleTimeString(),
            status: 'VALID',
            people: res.booking.numberOfPeople
          },
          ...prev.slice(0, 7)
        ]);
      }
    } catch (err) {
      playAudioFeedback('ERROR');
      setResult({
        status: 'ERROR',
        message: err.message || 'Network error occurred while contacting gate verification server.'
      });
    } finally {
      setLoading(false);
    }
  };

  const startCamera = async (cameraId = selectedCamera) => {
    setCameraError(null);
    try {
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode('staff-qr-reader');
      }

      // Enumerate cameras
      const devices = await Html5Qrcode.getCameras();
      if (devices && devices.length) {
        setCameras(devices);
        if (!selectedCamera) {
          setSelectedCamera(devices[0].id);
        }
      }

      const cameraConfig = cameraId ? cameraId : { facingMode: 'environment' };
      const config = {
        fps: 15,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.33
      };

      await scannerRef.current.start(
        cameraConfig,
        config,
        (decodedText) => {
          setTokenInput(decodedText);
          handleVerify(decodedText);
          if (!continuousMode) {
            stopCamera();
          }
        },
        () => {}
      );
      setIsScanning(true);
    } catch (err) {
      console.error('Camera failed to start:', err);
      setCameraError('Camera access denied or device not found. Please allow permissions.');
      setIsScanning(false);
    }
  };

  const stopCamera = async () => {
    if (scannerRef.current && isScanning) {
      try {
        await scannerRef.current.stop();
      } catch (e) {
        console.warn('Camera stop error:', e);
      }
    }
    setIsScanning(false);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode('staff-qr-reader');
      }
      const decoded = await scannerRef.current.scanFile(file, true);
      setTokenInput(decoded);
      handleVerify(decoded);
    } catch (err) {
      alert('Could not decode QR code from this image. Please upload a clearer photo.');
    }
    e.target.value = '';
  };

  useEffect(() => {
    return () => {
      if (scannerRef.current && isScanning) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, [isScanning]);

  // Quick Demo Tokens for live evaluation
  const sampleTokens = [
    { label: 'Sample Valid Token (DAR-2026-000101)', token: 'QR-DAR-2026-000101-SECURE-TOKEN-X79' },
    { label: 'Sample Already Checked In Token', token: 'QR-DAR-2026-000104-SECURE-TOKEN-T28' },
    { label: 'Sample Non-Existent Token', token: 'QR-INVALID-UNKNOWN-999' }
  ];

  return (
    <div className="dashboard-layout">
      <div className="dashboard-content" style={{ maxWidth: '820px', margin: '0 auto' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '1.6rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <QrCode color="#b45309" /> Gate Entry QR Verification Console
          </h1>
          <p style={{ fontSize: '0.9rem', color: '#64748b' }}>
            Verify pilgrim darshan tokens at Entry Gate, validate quota, and mark entries as completed.
          </p>
        </div>

        {/* Verification Card with Live Camera Controls */}
        <div className="card" style={{ padding: '1.75rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '1.25rem' }}>
            <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>Scan Pilgrim QR Pass</span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={() => (isScanning ? stopCamera() : startCamera())}
                className="btn btn-primary btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                {isScanning ? <VideoOff size={15} /> : <Camera size={15} />}
                {isScanning ? 'Stop Camera' : 'Open Live Camera Scanner'}
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="btn btn-secondary btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Image size={15} /> Scan Image File
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
            </div>
          </div>

          {/* Camera Scanner Viewport */}
          <div
            style={{
              display: isScanning || cameraError ? 'block' : 'none',
              background: '#0f172a',
              borderRadius: '8px',
              padding: '1rem',
              marginBottom: '1.25rem',
              color: '#fff',
              border: '2px solid #b45309'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '10px', height: '10px', background: '#22c55e', borderRadius: '50%', display: 'inline-block' }}></span>
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Camera Scanning Active</span>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                {cameras.length > 1 && (
                  <select
                    value={selectedCamera}
                    onChange={(e) => {
                      setSelectedCamera(e.target.value);
                      stopCamera().then(() => startCamera(e.target.value));
                    }}
                    style={{ background: '#1e293b', color: '#fff', border: '1px solid #475569', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem' }}
                  >
                    {cameras.map((c) => (
                      <option key={c.id} value={c.id}>{c.label || `Camera ${c.id}`}</option>
                    ))}
                  </select>
                )}
                <button
                  type="button"
                  onClick={() => setContinuousMode(!continuousMode)}
                  className="btn btn-sm"
                  style={{ background: continuousMode ? '#166534' : '#334155', color: '#fff', fontSize: '0.75rem', padding: '4px 8px' }}
                >
                  {continuousMode ? 'Mode: Continuous' : 'Mode: Single Scan'}
                </button>
                <button
                  type="button"
                  onClick={stopCamera}
                  className="btn btn-danger btn-sm"
                  style={{ fontSize: '0.75rem', padding: '4px 8px' }}
                >
                  ✕ Close
                </button>
              </div>
            </div>

            {cameraError && (
              <div style={{ background: '#7f1d1d', color: '#fecaca', padding: '8px 12px', borderRadius: '4px', fontSize: '0.85rem', marginBottom: '8px' }}>
                {cameraError}
              </div>
            )}

            <div style={{ width: '100%', maxWidth: '440px', margin: '0 auto', background: '#000', borderRadius: '6px', overflow: 'hidden' }}>
              <div id="staff-qr-reader" style={{ width: '100%' }}></div>
            </div>
            <p style={{ textAlign: 'center', fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.5rem', marginBottom: 0 }}>
              Align the QR code inside the viewfinder box to auto-verify
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleVerify();
            }}
          >
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600 }}>
                Scan or Enter QR Token / Booking ID
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Paste or scan QR Token (e.g. DAR-2026-000101 or token string)..."
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  style={{ fontSize: '1rem', fontFamily: 'monospace' }}
                  autoFocus
                />
                <button type="submit" className="btn btn-primary" disabled={loading || !tokenInput.trim()}>
                  {loading ? 'Verifying...' : 'Verify Entry'}
                </button>
              </div>
            </div>
          </form>

          {/* 1-Click Evaluation Fast Test Tokens */}
          <div style={{ background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '6px', padding: '0.75rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
              DEMO EVALUATION TOKENS (Click to Test Response):
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {sampleTokens.map((st, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setTokenInput(st.token);
                    handleVerify(st.token);
                  }}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.75rem', padding: '4px 8px' }}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Verification Result Feedback Box */}
        {result && (
          <div
            className="card"
            style={{
              borderColor:
                result.status === 'VALID'
                  ? '#86efac'
                  : result.status === 'ALREADY_USED'
                  ? '#fde047'
                  : '#fca5a5',
              background:
                result.status === 'VALID'
                  ? '#f0fdf4'
                  : result.status === 'ALREADY_USED'
                  ? '#fefce8'
                  : '#fef2f2',
              marginBottom: '1.5rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
              <div style={{ marginTop: '2px' }}>
                {result.status === 'VALID' && <CheckCircle2 size={36} color="#16a34a" />}
                {result.status === 'ALREADY_USED' && <AlertTriangle size={36} color="#ca8a04" />}
                {(result.status === 'INVALID' || result.status === 'EXPIRED' || result.status === 'CANCELLED' || result.status === 'ERROR') && (
                  <XCircle size={36} color="#dc2626" />
                )}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3
                    style={{
                      fontSize: '1.2rem',
                      color:
                        result.status === 'VALID'
                          ? '#166534'
                          : result.status === 'ALREADY_USED'
                          ? '#854d0e'
                          : '#991b1b'
                    }}
                  >
                    {result.status === 'VALID' && '✓ ENTRY PERMITTED - VALID PASS'}
                    {result.status === 'ALREADY_USED' && '⚠️ TOKEN ALREADY CHECKED IN'}
                    {result.status === 'INVALID' && '✕ INVALID TOKEN - REJECT ENTRY'}
                    {result.status === 'EXPIRED' && '✕ EXPIRED TOKEN - REJECT ENTRY'}
                    {result.status === 'CANCELLED' && '✕ BOOKING WAS CANCELLED'}
                  </h3>
                  <span
                    className="badge"
                    style={{
                      background: result.status === 'VALID' ? '#dcfce7' : '#fee2e2',
                      color: result.status === 'VALID' ? '#166534' : '#991b1b'
                    }}
                  >
                    {result.status}
                  </span>
                </div>

                <p style={{ fontSize: '0.9rem', margin: '4px 0 10px', color: '#334155' }}>{result.message}</p>

                {/* Booking Verified Details */}
                {result.booking && (
                  <div style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '6px', padding: '0.85rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', fontSize: '0.85rem' }}>
                      <div><strong>Booking ID:</strong> {result.booking.id}</div>
                      <div><strong>Primary Pilgrim:</strong> {result.booking.primaryPilgrimName}</div>
                      <div><strong>Darshan Type:</strong> {result.booking.darshanType}</div>
                      <div><strong>Slot Time:</strong> {result.booking.slotTime} ({result.booking.bookingDate})</div>
                      <div><strong>Party Size:</strong> {result.booking.numberOfPeople} Person(s)</div>
                      <div><strong>Govt ID Proof:</strong> {result.booking.primaryPilgrimIdProof || 'Provided'}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Scan Log Table */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Recent Gate Verification Logs</h2>
          </div>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Booking ID</th>
                  <th>Pilgrim Name</th>
                  <th>People</th>
                  <th>Verification Status</th>
                </tr>
              </thead>
              <tbody>
                {scanHistory.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '1.5rem', color: '#64748b' }}>
                      No verifications performed during this session yet.
                    </td>
                  </tr>
                ) : (
                  scanHistory.map((h, i) => (
                    <tr key={i}>
                      <td>{h.time}</td>
                      <td style={{ fontWeight: 600, fontFamily: 'monospace' }}>{h.id}</td>
                      <td>{h.name}</td>
                      <td>{h.people} person(s)</td>
                      <td><StatusBadge status="CHECKED_IN" /></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffQrScanner;
