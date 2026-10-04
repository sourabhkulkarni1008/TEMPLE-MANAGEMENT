import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import api from '../../api/client';
import StatusBadge from '../../components/StatusBadge';
import { QrCode, CheckCircle2, XCircle, AlertTriangle, Search, Camera, ShieldCheck, Image, Volume2, VideoOff, Sparkles, Keyboard, ScanLine, Check, Clock, Timer, ShieldAlert, KeyRound, X, RefreshCw, Settings } from 'lucide-react';

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

  const [stats, setStats] = useState({
    scanned: 428,
    admitted: 419,
    denied: 9
  });

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
      } else if (type === 'TOO_EARLY') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.setValueAtTime(554.37, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.18, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.3);
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

  const handleVerify = async (tokenToVerify = null, allowOverride = false) => {
    const rawToken = (tokenToVerify || tokenInput).trim();
    if (!rawToken) return;

    setLoading(true);
    setResult(null);

    if (!allowOverride) {
      setStats(prev => ({ ...prev, scanned: prev.scanned + 1 }));
    }

    try {
      const res = await api.post('/bookings/verify-qr', {
        qrToken: rawToken,
        override: allowOverride
      });
      setResult(res);
      playAudioFeedback(res.status);

      if (res.status === 'VALID') {
        setStats(prev => ({ ...prev, admitted: prev.admitted + 1 }));
        if (res.booking) {
          setScanHistory((prev) => [
            {
              id: res.booking.id,
              name: res.booking.primaryPilgrimName,
              time: new Date().toLocaleTimeString(),
              status: allowOverride ? 'OVERRIDE_ADMITTED' : 'VALID',
              slot: res.booking.slotTime || res.booking.slot || 'General Slot',
              people: res.booking.numberOfPeople
            },
            ...prev.slice(0, 7)
          ]);
        }
      } else {
        setStats(prev => ({ ...prev, denied: prev.denied + 1 }));
      }
    } catch (err) {
      playAudioFeedback('ERROR');
      setStats(prev => ({ ...prev, denied: prev.denied + 1 }));
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
    setIsScanning(false);

    try {
      // 1. Check if browser supports mediaDevices
      if (navigator?.mediaDevices?.getUserMedia) {
        try {
          const testStream = await navigator.mediaDevices.getUserMedia({ video: true });
          // Release test stream tracks immediately
          testStream.getTracks().forEach(track => track.stop());
        } catch (permErr) {
          if (permErr.name === 'NotAllowedError' || permErr.name === 'PermissionDeniedError') {
            setCameraError({
              type: 'PERMISSION_DENIED',
              title: 'Camera Permission Blocked',
              message: 'Chrome blocked camera access for this tab. Click the 🔒 or 📷 icon in your browser address bar, set Camera to "Allow", and click Retry.'
            });
            return;
          }
          if (permErr.name === 'NotFoundError' || permErr.name === 'DevicesNotFoundError') {
            setCameraError({
              type: 'NO_DEVICE',
              title: 'No Webcam Detected',
              message: 'No physical webcam hardware was found on this computer. You can upload a QR image or click "Test Camera Detect" for instant simulation.'
            });
            return;
          }
          if (permErr.name === 'NotReadableError' || permErr.name === 'TrackStartError') {
            setCameraError({
              type: 'DEVICE_BUSY',
              title: 'Webcam In Use',
              message: 'Your camera is currently in use by another application or browser tab. Please close other camera apps and retry.'
            });
            return;
          }
        }
      }

      // 2. Clean up previous scanner instance safely
      if (scannerRef.current) {
        try {
          await scannerRef.current.stop();
        } catch (e) {}
        try {
          scannerRef.current.clear();
        } catch (e) {}
        scannerRef.current = null;
      }

      scannerRef.current = new Html5Qrcode('staff-qr-reader');

      // 3. Enumerate cameras
      let availableCameras = [];
      try {
        const devices = await Html5Qrcode.getCameras();
        if (devices && devices.length) {
          availableCameras = devices;
          setCameras(devices);
          if (!selectedCamera) {
            setSelectedCamera(devices[0].id);
          }
        }
      } catch (camErr) {
        console.warn('Camera enumeration note:', camErr);
      }

      const cameraConfig = cameraId || (availableCameras.length > 0 ? availableCameras[0].id : { facingMode: 'user' });
      const config = {
        fps: 15,
        qrbox: { width: 220, height: 220 },
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
      setCameraError(null);
    } catch (err) {
      console.error('Camera failed to start:', err);
      const isPerm = err.name === 'NotAllowedError' || (typeof err?.message === 'string' && err.message.includes('Permission'));
      setCameraError({
        type: isPerm ? 'PERMISSION_DENIED' : 'START_ERROR',
        title: isPerm ? 'Camera Permission Required' : 'Webcam Standby',
        message: isPerm 
          ? 'Browser camera permission was denied. Click the 🔒 or 📷 icon in the Chrome URL bar to Allow camera, then click Retry.'
          : (err.message || 'Webcam could not be started. You can use manual code typing, sample 1-click test tokens, or image upload.')
      });
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

  const simulateCameraDetection = () => {
    const simToken = 'QR-DAR-2026-000101-SECURE-TOKEN-X79';
    setTokenInput(simToken);
    handleVerify(simToken);
    if (!continuousMode && isScanning) {
      stopCamera();
    }
  };

  useEffect(() => {
    return () => {
      if (scannerRef.current && isScanning) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, [isScanning]);

  const sampleTokens = [
    { label: '🟢 Current In-Slot Pass (Valid)', token: 'QR-DAR-2026-000101-SECURE-TOKEN-X79' },
    { label: '⏳ Future Slot (Too Early)', token: 'QR-DAR-2026-000102-SECURE-TOKEN-M42' },
    { label: '⏰ Past Slot (Expired)', token: 'QR-DAR-2026-000103-SECURE-TOKEN-P19' },
    { label: '⚠️ Already Scanned (Duplicate)', token: 'QR-DAR-2026-000104-SECURE-TOKEN-T28' },
    { label: '❌ Unregistered Code', token: 'QR-INVALID-UNKNOWN-999' }
  ];

  return (
    <div className="dashboard-layout">
      <div className="dashboard-content" style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h1 style={{ fontSize: '1.65rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <QrCode color="#b45309" /> Staff Gate &amp; QR Verification Console
            </h1>
            <p style={{ fontSize: '0.9rem', color: '#64748b' }}>
              Side-by-side Live Optical Camera Scanner and Monospace Code Verification for Gate Security
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <span className="badge badge-confirmed">Duty: Lane 1 Entry</span>
            <span className="badge badge-gold">Shift: Morning</span>
          </div>
        </div>

        {/* SIDE-BY-SIDE 2-COLUMN VERIFICATION LAYOUT */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.15fr 1fr', gap: '1.5rem', alignItems: 'stretch', marginBottom: '1.5rem' }}>
          
          {/* LEFT COLUMN: LIVE OPTICAL CAMERA SCANNER */}
          <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '1rem', color: '#0f172a' }}>
                <Camera size={18} color="#b45309" /> Live Camera QR Scanner
              </div>
              <span className={`badge ${isScanning ? 'badge-confirmed' : 'badge-gold'}`} style={{ fontSize: '0.7rem' }}>
                {isScanning ? 'CAMERA SCANNING' : 'STANDBY'}
              </span>
            </div>

            {/* Camera Controls Bar */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '1rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => (isScanning ? stopCamera() : startCamera())}
                className="btn btn-primary btn-sm"
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                {isScanning ? <VideoOff size={15} /> : <Camera size={15} />}
                {isScanning ? 'Stop Camera' : 'Start Camera Feed'}
              </button>

              {cameras.length > 1 && (
                <select
                  value={selectedCamera}
                  onChange={(e) => {
                    setSelectedCamera(e.target.value);
                    if (isScanning) {
                      stopCamera().then(() => startCamera(e.target.value));
                    }
                  }}
                  className="form-select"
                  style={{ flex: 1, padding: '4px 8px', fontSize: '0.75rem' }}
                >
                  {cameras.map((c) => (
                    <option key={c.id} value={c.id}>{c.label || `Camera ${c.id}`}</option>
                  ))}
                </select>
              )}
            </div>

            {/* Camera Scanner Viewport */}
            <div
              style={{
                position: 'relative',
                width: '100%',
                background: '#090d16',
                borderRadius: '10px',
                overflow: 'hidden',
                minHeight: '260px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid #1e293b'
              }}
            >
              <div id="staff-qr-reader" style={{ width: '100%' }}></div>

              {!isScanning && (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                  <QrCode size={44} color="#475569" style={{ margin: '0 auto 8px' }} />
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#e2e8f0' }}>Optical Viewfinder Standby</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>Click "Start Camera Feed" to activate webcam</div>
                </div>
              )}

              {cameraError && (
                <div
                  style={{
                    position: 'absolute',
                    inset: '8px',
                    background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.98), rgba(15, 23, 42, 0.98))',
                    border: '1.5px solid #d97706',
                    color: '#f8fafc',
                    padding: '1.25rem',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    zIndex: 20,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    textAlign: 'center',
                    boxShadow: '0 8px 30px rgba(0,0,0,0.6)'
                  }}
                >
                  {/* Close / Dismiss button */}
                  <button
                    type="button"
                    onClick={() => setCameraError(null)}
                    title="Dismiss Notice"
                    style={{
                      position: 'absolute',
                      top: '10px',
                      right: '10px',
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: 'none',
                      color: '#94a3b8',
                      cursor: 'pointer',
                      borderRadius: '50%',
                      padding: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <X size={16} />
                  </button>

                  <div
                    style={{
                      background: 'rgba(217, 119, 6, 0.2)',
                      padding: '10px',
                      borderRadius: '50%',
                      marginBottom: '8px',
                      color: '#fbbf24'
                    }}
                  >
                    <Camera size={26} />
                  </div>

                  <strong style={{ fontSize: '0.95rem', color: '#fef08a', marginBottom: '4px' }}>
                    {typeof cameraError === 'object' ? cameraError.title : 'Camera Access Notice'}
                  </strong>

                  <p style={{ margin: '4px 0 12px', fontSize: '0.8rem', color: '#cbd5e1', maxWidth: '340px', lineHeight: 1.4 }}>
                    {typeof cameraError === 'object' ? cameraError.message : cameraError}
                  </p>

                  {/* Browser guidance pill */}
                  <div
                    style={{
                      background: 'rgba(0,0,0,0.4)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '6px',
                      padding: '6px 12px',
                      fontSize: '0.75rem',
                      color: '#94a3b8',
                      marginBottom: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <span>💡 <strong>Quick Fix:</strong> Click the <strong>📷 Camera / 🔒 Padlock</strong> icon in your Chrome URL bar &rarr; select <strong>Allow</strong></span>
                  </div>

                  {/* Quick Action Buttons */}
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
                    <button
                      type="button"
                      onClick={() => startCamera()}
                      className="btn btn-primary btn-sm"
                      style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <RefreshCw size={13} /> Retry Camera
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setCameraError(null);
                        simulateCameraDetection();
                      }}
                      className="btn btn-sm"
                      style={{ background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <Sparkles size={13} /> Test Camera Detect
                    </button>

                    <button
                      type="button"
                      onClick={() => setCameraError(null)}
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '0.8rem' }}
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Camera Options Strip */}
            <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  type="button"
                  onClick={() => setContinuousMode(!continuousMode)}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.75rem' }}
                >
                  {continuousMode ? 'Mode: Continuous' : 'Mode: Single'}
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <Image size={13} /> Upload Image
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />
              </div>

              <button
                type="button"
                onClick={simulateCameraDetection}
                className="btn btn-sm"
                style={{ background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <Sparkles size={13} /> Test Camera Detect
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN: MANUAL CODE TYPING & VERIFICATION */}
          <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '1rem', color: '#0f172a' }}>
                <Keyboard size={18} color="#b45309" /> Manual Code Verification
              </div>
              <span className="badge" style={{ background: '#f1f5f9', color: '#475569', fontSize: '0.7rem' }}>KEYBOARD ENTRY</span>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleVerify();
              }}
              style={{ marginBottom: '1rem' }}
            >
              <label className="form-label" style={{ fontSize: '0.8rem' }}>Type or Paste Token / Booking ID</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. DAR-2026-000101 or QR Token..."
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  style={{ fontSize: '0.95rem', fontFamily: 'monospace', fontWeight: 600 }}
                  autoFocus
                />
                <button type="submit" className="btn btn-primary" disabled={loading || !tokenInput.trim()} style={{ whiteSpace: 'nowrap' }}>
                  {loading ? 'Verifying...' : 'Verify Pass'}
                </button>
              </div>
            </form>

            {/* Quick Test Presets */}
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                Quick 1-Click Test Tokens:
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
                    style={{ fontSize: '0.75rem', padding: '4px 8px', background: '#fff' }}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Verification Result Feedback Box */}
            {result ? (
              <div
                style={{
                  border: `1.5px solid ${
                    result.status === 'VALID' ? '#16a34a' :
                    result.status === 'TOO_EARLY' ? '#d97706' :
                    result.status === 'ALREADY_USED' ? '#f59e0b' :
                    '#dc2626'
                  }`,
                  background:
                    result.status === 'VALID' ? '#f0fdf4' :
                    result.status === 'TOO_EARLY' ? '#fffbeb' :
                    result.status === 'ALREADY_USED' ? '#fffdf5' :
                    '#fef2f2',
                  padding: '1.25rem',
                  borderRadius: '10px',
                  marginBottom: '1rem',
                  flex: 1
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '0.75rem' }}>
                  {result.status === 'VALID' && <CheckCircle2 size={32} color="#16a34a" style={{ flexShrink: 0, marginTop: '2px' }} />}
                  {result.status === 'TOO_EARLY' && <Timer size={32} color="#d97706" style={{ flexShrink: 0, marginTop: '2px' }} />}
                  {result.status === 'ALREADY_USED' && <AlertTriangle size={32} color="#f59e0b" style={{ flexShrink: 0, marginTop: '2px' }} />}
                  {result.status === 'EXPIRED' && <Clock size={32} color="#dc2626" style={{ flexShrink: 0, marginTop: '2px' }} />}
                  {result.status !== 'VALID' && result.status !== 'TOO_EARLY' && result.status !== 'ALREADY_USED' && result.status !== 'EXPIRED' && (
                    <XCircle size={32} color="#dc2626" style={{ flexShrink: 0, marginTop: '2px' }} />
                  )}
                  
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontWeight: 800,
                      fontSize: '1.05rem',
                      color:
                        result.status === 'VALID' ? '#15803d' :
                        result.status === 'TOO_EARLY' ? '#92400e' :
                        result.status === 'ALREADY_USED' ? '#b45309' :
                        '#991b1b'
                    }}>
                      {result.status === 'VALID' && '✓ ENTRY PERMITTED - VALID IN-SLOT PASS'}
                      {result.status === 'TOO_EARLY' && '⏳ ENTRY DENIED - SCANNED TOO EARLY (OUT OF SLOT)'}
                      {result.status === 'EXPIRED' && '✕ ENTRY DENIED - BOOKED SLOT HAS EXPIRED'}
                      {result.status === 'ALREADY_USED' && '⚠️ TOKEN ALREADY CHECKED IN (DUPLICATE)'}
                      {result.status === 'CANCELLED' && '✕ BOOKING CANCELLED'}
                      {result.status === 'INVALID' && '✕ REJECT ENTRY - INVALID / UNREGISTERED TOKEN'}
                      {result.status === 'ERROR' && '✕ GATE VERIFICATION ERROR'}
                    </div>
                    <div style={{ fontSize: '0.825rem', color: '#475569', marginTop: '3px', lineHeight: 1.4 }}>
                      {result.message}
                    </div>
                  </div>
                </div>

                {result.booking && (
                  <div style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '8px', padding: '0.85rem', fontSize: '0.825rem', marginBottom: '0.75rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                      <div><span style={{ color: '#64748b' }}>Devotee:</span> <strong>{result.booking.primaryPilgrimName}</strong></div>
                      <div><span style={{ color: '#64748b' }}>Booking ID:</span> <strong style={{ fontFamily: 'monospace' }}>{result.booking.id}</strong></div>
                      <div><span style={{ color: '#64748b' }}>Category:</span> <strong>{result.booking.darshanType}</strong></div>
                      <div><span style={{ color: '#64748b' }}>Party:</span> <strong>{result.booking.numberOfPeople} Devotee(s)</strong></div>
                      <div>
                        <span style={{ color: '#64748b' }}>Booked Date:</span>{' '}
                        <strong>{result.booking.bookingDate || result.booking.date}</strong>
                      </div>
                      <div>
                        <span style={{ color: '#64748b' }}>Booked Slot:</span>{' '}
                        <strong style={{
                          color: result.status === 'VALID' ? '#15803d' : result.status === 'TOO_EARLY' ? '#b45309' : '#dc2626',
                          background: result.status === 'VALID' ? '#dcfce7' : result.status === 'TOO_EARLY' ? '#fef3c7' : '#fee2e2',
                          padding: '2px 6px',
                          borderRadius: '4px'
                        }}>
                          {result.booking.slotTime || result.booking.slot}
                        </strong>
                      </div>
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => setResult(null)}
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '0.75rem' }}
                  >
                    Clear &amp; Next Devotee
                  </button>

                  {(result.status === 'TOO_EARLY' || result.status === 'EXPIRED') && (
                    <button
                      type="button"
                      onClick={() => handleVerify(result.booking?.qrToken || result.booking?.id || tokenInput, true)}
                      className="btn btn-sm"
                      style={{
                        background: '#fef3c7',
                        color: '#92400e',
                        border: '1px solid #fcd34d',
                        fontSize: '0.75rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontWeight: 700
                      }}
                      title="Authorize entry in special circumstances with supervisor audit log"
                    >
                      <ShieldAlert size={14} /> Staff VIP / Emergency Override
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div style={{ background: '#f8fafc', border: '1.5px dashed #cbd5e1', borderRadius: '8px', padding: '1.25rem', textAlign: 'center', color: '#64748b', fontSize: '0.825rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                <ScanLine size={28} color="#94a3b8" style={{ marginBottom: '6px' }} />
                <div>Awaiting Token Scan or Code Entry</div>
                <div style={{ fontSize: '0.725rem', color: '#94a3b8', marginTop: '2px' }}>Scanned devotee pass details will appear here</div>
              </div>
            )}

            {/* Mini Gate Stats Strip */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginTop: '1rem', textAlign: 'center' }}>
              <div style={{ background: '#f8fafc', padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 600 }}>SCANNED TODAY</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>{stats.scanned}</div>
              </div>
              <div style={{ background: '#f0fdf4', padding: '8px', borderRadius: '6px', border: '1px solid #bbf7d0' }}>
                <div style={{ fontSize: '0.65rem', color: '#166534', fontWeight: 600 }}>ADMITTED</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#15803d' }}>{stats.admitted}</div>
              </div>
              <div style={{ background: '#fef2f2', padding: '8px', borderRadius: '6px', border: '1px solid #fecaca' }}>
                <div style={{ fontSize: '0.65rem', color: '#991b1b', fontWeight: 600 }}>DENIED</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#dc2626' }}>{stats.denied}</div>
              </div>
            </div>

          </div>

        </div>

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
