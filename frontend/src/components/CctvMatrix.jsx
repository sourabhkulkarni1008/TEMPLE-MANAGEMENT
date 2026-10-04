import React, { useEffect, useRef, useState } from 'react';
import { Video, Eye, Radio, Sparkles, ShieldCheck, Maximize2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const CAMERAS = [
  { id: 'CAM-01', name: 'Main Entrance & Gate Security', zone: 'Outer Security Gate', count: 112, capacity: 250, status: 'LOW' },
  { id: 'CAM-02', name: 'Sabha Mandap & Holding Bays', zone: 'Queue Holding Complex', count: 285, capacity: 350, status: 'HIGH' },
  { id: 'CAM-03', name: 'Inner Sanctum (Garbhagriha)', zone: 'Main Deity Mandap', count: 32, capacity: 50, status: 'MODERATE' },
  { id: 'CAM-04', name: 'Prasad Distribution Counter', zone: 'Annadanam Hall', count: 95, capacity: 200, status: 'LOW' },
  { id: 'CAM-05', name: 'VIP Fast-Track Corridor', zone: 'Special Entry Arcade', count: 25, capacity: 80, status: 'LOW' },
  { id: 'CAM-06', name: 'Exit Corridor & Shoe Counter', zone: 'West Transit Gate', count: 60, capacity: 180, status: 'LOW' }
];

const CctvMatrix = ({ showFullControls = true }) => {
  const [showBoundingBoxes, setShowBoundingBoxes] = useState(true);
  const [activeCamera, setActiveCamera] = useState(null);
  const canvasRefs = useRef({});
  const animationFrameRef = useRef(null);

  useEffect(() => {
    let tick = 0;

    const renderCanvases = () => {
      tick += 0.05;

      CAMERAS.forEach((cam, camIndex) => {
        const canvas = canvasRefs.current[cam.id];
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const w = canvas.width;
        const h = canvas.height;

        // Dark CCTV background
        ctx.fillStyle = '#0b0f19';
        ctx.fillRect(0, 0, w, h);

        // Perspective grid lines (hallway / sanctum / gate floor)
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let i = 0; i < w; i += 32) {
          ctx.moveTo(i, h);
          ctx.lineTo(w / 2 + (i - w / 2) * 0.2, h * 0.35);
        }
        for (let y = h * 0.35; y < h; y += 18) {
          ctx.moveTo(0, y);
          ctx.lineTo(w, y);
        }
        ctx.stroke();

        // Architectural arches / columns
        ctx.fillStyle = '#111827';
        ctx.fillRect(10, 20, 16, h - 30);
        ctx.fillRect(w - 26, 20, 16, h - 30);
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(8, 16, 20, 8);
        ctx.fillRect(w - 28, 16, 20, 8);

        // Draw animated pilgrim figures (dots & bounding boxes)
        const density = cam.status === 'HIGH' ? 14 : (cam.status === 'MODERATE' ? 9 : 5);
        for (let p = 0; p < density; p++) {
          const speed = 0.4 + (p % 3) * 0.2;
          const x = (p * 28 + Math.sin(tick * speed + p) * 18 + w * 0.15) % (w * 0.7) + w * 0.12;
          const y = h * 0.45 + (p * 8 + Math.cos(tick * speed + p) * 6) % (h * 0.45);
          const size = 6 + (y / h) * 8;

          // Devotee figure
          ctx.fillStyle = p % 2 === 0 ? '#f59e0b' : '#38bdf8';
          ctx.beginPath();
          ctx.arc(x, y - size, size * 0.4, 0, Math.PI * 2); // head
          ctx.fill();

          ctx.fillStyle = p % 2 === 0 ? '#d97706' : '#0284c7';
          ctx.fillRect(x - size * 0.35, y - size * 0.6, size * 0.7, size * 0.9); // body

          // AI Bounding Box
          if (showBoundingBoxes) {
            ctx.strokeStyle = '#22c55e';
            ctx.lineWidth = 1;
            const boxW = size * 1.6;
            const boxH = size * 2.2;
            const boxX = x - boxW / 2;
            const boxY = y - size * 1.5;
            ctx.strokeRect(boxX, boxY, boxW, boxH);

            // Label tag
            ctx.fillStyle = '#22c55e';
            ctx.fillRect(boxX, boxY - 9, 28, 9);
            ctx.fillStyle = '#000000';
            ctx.font = '7px monospace';
            ctx.fillText(`P${p + 1} 98%`, boxX + 2, boxY - 2);
          }
        }

        // Noise & scanlines
        ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';
        for (let n = 0; n < 20; n++) {
          ctx.fillRect(Math.random() * w, Math.random() * h, 2, 2);
        }
      });

      animationFrameRef.current = requestAnimationFrame(renderCanvases);
    };

    animationFrameRef.current = requestAnimationFrame(renderCanvases);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [showBoundingBoxes]);

  return (
    <div className="cctv-matrix-wrapper">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h2 style={{ fontSize: '1.35rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Video size={22} color="#b45309" />
            <span>Live CCTV &amp; AI Computer Vision Feeds (6 Cameras)</span>
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
            Real-time YOLOv8 automated headcounts, optical tracking, and queue bottleneck detection
          </p>
        </div>

        {showFullControls && (
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button
              onClick={() => setShowBoundingBoxes(!showBoundingBoxes)}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.775rem' }}
            >
              <ShieldCheck size={14} color="#16a34a" />
              <span>AI Bounding Boxes: {showBoundingBoxes ? 'ON' : 'OFF'}</span>
            </button>
            <Link to="/crowd" className="btn btn-primary btn-sm">
              <Eye size={14} />
              <span>Detailed Crowd Center &rarr;</span>
            </Link>
          </div>
        )}
      </div>

      {/* 6 Camera Matrix Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '1.25rem',
        marginBottom: '1.5rem'
      }}>
        {CAMERAS.map((cam) => {
          const occupancyPct = Math.round((cam.count / cam.capacity) * 100);
          return (
            <div
              key={cam.id}
              style={{
                background: '#0b0f19',
                border: '1px solid #1e293b',
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
                transition: 'transform 0.2s, border-color 0.2s'
              }}
            >
              {/* Header */}
              <div style={{
                background: '#0f172a',
                padding: '8px 12px',
                borderBottom: '1px solid #1e293b',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                color: '#ffffff'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
                  <span style={{ fontWeight: 700, fontSize: '0.8rem', fontFamily: 'monospace', color: '#38bdf8' }}>{cam.id}</span>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>• {cam.name.split('&')[0]}</span>
                </div>
                <span style={{
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  padding: '2px 6px',
                  borderRadius: '4px',
                  background: cam.status === 'HIGH' ? '#fee2e2' : (cam.status === 'MODERATE' ? '#fef9c3' : '#dcfce7'),
                  color: cam.status === 'HIGH' ? '#991b1b' : (cam.status === 'MODERATE' ? '#854d0e' : '#166534')
                }}>
                  {cam.status} DENSITY
                </span>
              </div>

              {/* Video Canvas Container */}
              <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', background: '#000' }}>
                <canvas
                  ref={el => canvasRefs.current[cam.id] = el}
                  width={340}
                  height={190}
                  style={{ width: '100%', height: '100%', display: 'block' }}
                />

                {/* HUD Overlay */}
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  padding: '8px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  pointerEvents: 'none'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'monospace', fontSize: '0.675rem', color: '#4ade80', textShadow: '0 0 4px #000' }}>
                    <span>{cam.zone}</span>
                    <span>30 FPS • YOLOv8</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', fontFamily: 'monospace', fontSize: '0.7rem', color: '#ffffff', textShadow: '0 0 4px #000' }}>
                    <span style={{ background: 'rgba(0,0,0,0.7)', padding: '2px 6px', borderRadius: '4px' }}>
                      Headcount: <strong style={{ color: '#fbbf24' }}>{cam.count}</strong> / {cam.capacity} ({occupancyPct}%)
                    </span>
                    <span style={{ background: 'rgba(0,0,0,0.7)', padding: '2px 6px', borderRadius: '4px', color: '#22c55e' }}>
                      ● REC LIVE
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CctvMatrix;
