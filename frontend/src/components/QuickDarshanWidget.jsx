import React, { useState } from 'react';
import { 
  Calendar, Clock, User, Sparkles, CheckCircle, QrCode, 
  ArrowRight, ShieldCheck, Download, Share2, Zap, AlertCircle
} from 'lucide-react';
import { audioService } from '../utils/audioService';

export default function QuickDarshanWidget({ onSuccess }) {
  const [step, setStep] = useState(1); // 1: Quick form, 2: 3D Holographic Pass
  const [formData, setFormData] = useState({
    name: 'Sourabh Kulkarni',
    email: 'sourabh.kulkarni@example.com',
    phone: '9876543210',
    darshanType: 'SPECIAL',
    date: new Date().toISOString().split('T')[0],
    slot: '09:00 AM - 10:00 AM',
    persons: 2,
    idProof: 'AADHAAR-8921-4431'
  });
  const [generatedPass, setGeneratedPass] = useState(null);
  const [loading, setLoading] = useState(false);

  const recommendedSlots = [
    { time: '08:00 AM - 09:00 AM', density: 'Low', wait: '8 mins', color: '#16a34a' },
    { time: '09:00 AM - 10:00 AM', density: 'Optimal', wait: '12 mins', color: '#16a34a', recommended: true },
    { time: '11:00 AM - 12:00 PM', density: 'Moderate', wait: '24 mins', color: '#ca8a04' },
    { time: '05:00 PM - 06:00 PM', density: 'High', wait: '35 mins', color: '#dc2626' }
  ];

  const handleQuickSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    audioService.playAartiChime();

    setTimeout(() => {
      const passId = 'SIDDHI-' + Math.floor(100000 + Math.random() * 900000);
      const pass = {
        ...formData,
        passId,
        bookingTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        gate: 'Gate 1 (East VIP Arcade)',
        queueLane: 'Priority Lane A-2',
        status: 'CONFIRMED'
      };
      setGeneratedPass(pass);
      setLoading(false);
      setStep(2);
      audioService.playSuccessChime();

      if (window.confetti) {
        window.confetti({
          particleCount: 75,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
      if (onSuccess) onSuccess(pass);
    }, 600);
  };

  return (
    <div style={{
      background: 'linear-gradient(145deg, #ffffff 0%, #fffbeb 100%)',
      borderRadius: '20px',
      border: '1px solid rgba(245, 158, 11, 0.3)',
      boxShadow: '0 12px 30px -5px rgba(217, 119, 6, 0.15)',
      padding: '24px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative Golden Corner Glow */}
      <div style={{
        position: 'absolute',
        top: '-40px',
        right: '-40px',
        width: '120px',
        height: '120px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(245, 158, 11, 0.25) 0%, rgba(245, 158, 11, 0) 70%)',
        pointerEvents: 'none'
      }} />

      {step === 1 ? (
        <form onSubmit={handleQuickSubmit}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{
                  background: '#fef3c7',
                  color: '#b45309',
                  fontSize: '0.725rem',
                  fontWeight: 700,
                  padding: '3px 8px',
                  borderRadius: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <Zap size={12} /> 1-CLICK FAST-TRACK
                </span>
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>
                Instant Darshan Pass
              </h3>
            </div>
            <div style={{ textAlign: 'right', fontSize: '0.75rem', color: '#64748b' }}>
              Instant Verification • Free & VIP
            </div>
          </div>

          {/* Quick AI Slot Picker */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>
              Select Live AI-Optimized Slot
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {recommendedSlots.map(s => (
                <div
                  key={s.time}
                  onClick={() => setFormData({ ...formData, slot: s.time })}
                  style={{
                    border: formData.slot === s.time ? '2px solid #b45309' : '1px solid #e2e8f0',
                    background: formData.slot === s.time ? '#fffbeb' : '#ffffff',
                    borderRadius: '10px',
                    padding: '10px',
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {s.recommended && (
                    <span style={{
                      position: 'absolute',
                      top: '-7px',
                      right: '8px',
                      background: '#16a34a',
                      color: '#ffffff',
                      fontSize: '0.625rem',
                      fontWeight: 800,
                      padding: '1px 6px',
                      borderRadius: '10px'
                    }}>
                      ⭐ LEAST WAIT
                    </span>
                  )}
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0f172a' }}>{s.time}</div>
                  <div style={{ fontSize: '0.7rem', color: s.color, fontWeight: 600, display: 'flex', justifyContent: 'space-between', marginTop: '2px' }}>
                    <span>{s.density} density</span>
                    <span>~{s.wait}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Compact Input Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 0.8fr', gap: '10px', marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                Primary Devotee
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                required
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.85rem'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                Darshan Type
              </label>
              <select
                value={formData.darshanType}
                onChange={e => setFormData({ ...formData, darshanType: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.85rem',
                  background: '#ffffff'
                }}
              >
                <option value="SPECIAL">Special Darshan (VIP)</option>
                <option value="GENERAL">General Free Pass</option>
                <option value="ABHISHEK">Suprabhata Abhishek</option>
                <option value="SENIOR">Senior Citizen Priority</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                Devotees
              </label>
              <input
                type="number"
                min="1"
                max="6"
                value={formData.persons}
                onChange={e => setFormData({ ...formData, persons: parseInt(e.target.value, 10) || 1 })}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.85rem'
                }}
              />
            </div>
          </div>

          {/* Instant Submit Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              background: 'linear-gradient(135deg, #b45309, #78350f)',
              color: '#ffffff',
              border: 'none',
              padding: '12px 20px',
              borderRadius: '12px',
              fontSize: '0.95rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 6px 16px rgba(180, 83, 9, 0.35)',
              transition: 'transform 0.1s'
            }}
          >
            {loading ? (
              <span>Generating Instant QR Pass...</span>
            ) : (
              <>
                <Sparkles size={18} />
                <span>Generate Instant 3D Digital Pass</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>
      ) : (
        /* 3D Holographic Pass Presentation */
        <div style={{ textAlign: 'center', animation: 'fadeIn 0.3s ease' }}>
          <div style={{
            background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
            border: '2px solid #f59e0b',
            borderRadius: '16px',
            padding: '20px',
            color: '#ffffff',
            position: 'relative',
            boxShadow: '0 15px 30px rgba(0,0,0,0.4)',
            marginBottom: '16px',
            textAlign: 'left'
          }}>
            {/* Holographic Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.15)', paddingBottom: '12px', marginBottom: '14px' }}>
              <div>
                <div style={{ fontSize: '0.7rem', color: '#facc15', fontWeight: 800, letterSpacing: '0.05em' }}>
                  SHREE SIDDHIVINAYAK TEMPLE
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff' }}>
                  Official Digital Darshan E-Pass
                </div>
              </div>
              <span style={{
                background: '#22c55e',
                color: '#ffffff',
                fontSize: '0.7rem',
                fontWeight: 800,
                padding: '3px 10px',
                borderRadius: '20px'
              }}>
                ● ACTIVE PASS
              </span>
            </div>

            {/* Pass details grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '12px', marginBottom: '14px' }}>
              <div>
                <div style={{ fontSize: '0.675rem', color: '#94a3b8' }}>Devotee Name</div>
                <div style={{ fontSize: '0.925rem', fontWeight: 700, color: '#fef08a' }}>{generatedPass.name}</div>
                
                <div style={{ fontSize: '0.675rem', color: '#94a3b8', marginTop: '6px' }}>Slot &amp; Date</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{generatedPass.slot} • Today</div>

                <div style={{ fontSize: '0.675rem', color: '#94a3b8', marginTop: '6px' }}>Allocated Gate</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#38bdf8' }}>{generatedPass.gate}</div>
              </div>

              {/* Dynamic QR Code Simulation Box */}
              <div style={{
                background: '#ffffff',
                borderRadius: '10px',
                padding: '10px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center'
              }}>
                <QrCode size={76} color="#0f172a" />
                <div style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: '0.75rem', color: '#b45309', marginTop: '4px' }}>
                  {generatedPass.passId}
                </div>
                <div style={{ fontSize: '0.6rem', color: '#64748b' }}>Scan at Turnstile</div>
              </div>
            </div>

            <div style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'flex', justifyContent: 'space-between' }}>
              <span>Category: <strong>{generatedPass.darshanType}</strong></span>
              <span>Devotees: <strong>{generatedPass.persons} Person(s)</strong></span>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => {
                audioService.playSuccessChime();
                window.print();
              }}
              style={{
                flex: 1,
                background: '#b45309',
                color: '#ffffff',
                border: 'none',
                padding: '10px',
                borderRadius: '10px',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <Download size={16} /> Print / Save Pass
            </button>
            <button
              onClick={() => setStep(1)}
              style={{
                background: '#e2e8f0',
                color: '#1e293b',
                border: 'none',
                padding: '10px 16px',
                borderRadius: '10px',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Book Another
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
