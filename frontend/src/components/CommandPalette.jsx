import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, Calendar, Eye, ShieldAlert, Sparkles, MapPin, 
  HelpCircle, User, Ticket, QrCode, ArrowRight, Zap, Bell
} from 'lucide-react';
import { audioService } from '../utils/audioService';

export default function CommandPalette({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const commands = [
    { id: 'book-vip', title: '1-Click VIP Special Darshan Pass', category: 'Booking', icon: <Sparkles size={16} color="#f59e0b" />, path: '/darshan?type=special' },
    { id: 'book-general', title: 'Free General Darshan Booking', category: 'Booking', icon: <Ticket size={16} color="#16a34a" />, path: '/darshan?type=general' },
    { id: 'book-senior', title: 'Senior Citizen & Divyangjan Priority Pass', category: 'Booking', icon: <Calendar size={16} color="#3b82f6" />, path: '/darshan?type=senior' },
    { id: 'live-crowd', title: 'Live 6-Camera CCTV Crowd Vision', category: 'Live Status', icon: <Eye size={16} color="#ea580c" />, path: '/crowd' },
    { id: 'temple-3d', title: '3D Living Temple Sanctum & Complex Tour', category: 'Explore', icon: <MapPin size={16} color="#8b5cf6" />, path: '/temple' },
    { id: 'qr-pass', title: 'View My Active Darshan QR Passbook', category: 'Devotee', icon: <QrCode size={16} color="#0f172a" />, path: '/user/bookings' },
    { id: 'sos-alert', title: 'Emergency SOS & Ground First-Aid Assistance', category: 'Safety', icon: <ShieldAlert size={16} color="#dc2626" />, path: '/help#sos' },
    { id: 'ring-bell', title: 'Sound Divine Temple Bell (Audio Chime)', category: 'Rituals', icon: <Bell size={16} color="#d97706" />, action: () => audioService.playTempleBell(1.0) }
  ];

  const filteredCommands = commands.filter(c =>
    c.title.toLowerCase().includes(query.toLowerCase()) ||
    c.category.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % filteredCommands.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % filteredCommands.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      executeCommand(filteredCommands[selectedIndex]);
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  const executeCommand = (cmd) => {
    if (!cmd) return;
    audioService.playAartiChime();
    if (cmd.action) {
      cmd.action();
    } else if (cmd.path) {
      navigate(cmd.path);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(6, 11, 24, 0.75)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'center',
      paddingTop: '14vh',
      animation: 'fadeIn 0.15s ease'
    }} onClick={onClose}>
      <div 
        style={{
          width: '100%',
          maxWidth: '620px',
          background: '#ffffff',
          borderRadius: '18px',
          boxShadow: '0 25px 60px -12px rgba(6, 11, 24, 0.35), 0 0 0 1px rgba(245, 158, 11, 0.35)',
          overflow: 'hidden',
          position: 'relative'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Top Gold Gradient Filament */}
        <div style={{ height: '3px', background: 'var(--gold-metallic)' }} />

        {/* Search input header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '16px 20px',
          borderBottom: '1px solid rgba(245, 158, 11, 0.15)',
          background: 'linear-gradient(180deg, #fffdfa 0%, #fcf8f0 100%)'
        }}>
          <Search size={20} color="#c2410c" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command, slot, camera or ritual... (e.g. VIP, Bell, SOS)"
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            style={{
              width: '100%',
              border: 'none',
              background: 'transparent',
              fontSize: '1.05rem',
              color: '#0f172a',
              outline: 'none',
              fontWeight: 600,
              fontFamily: 'inherit'
            }}
          />
          <kbd style={{
            fontSize: '0.725rem',
            background: '#ffffff',
            border: '1px solid #fde68a',
            padding: '3px 8px',
            borderRadius: '6px',
            color: '#b45309',
            fontWeight: 700
          }}>ESC</kbd>
        </div>

        {/* Command suggestions list */}
        <div style={{ maxHeight: '370px', overflowY: 'auto', padding: '10px' }}>
          {filteredCommands.length === 0 ? (
            <div style={{ padding: '28px', textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem' }}>
              No matching actions found. Try typing 'Darshan', 'Queue', or 'Pass'.
            </div>
          ) : (
            filteredCommands.map((cmd, idx) => (
              <div
                key={cmd.id}
                onClick={() => executeCommand(cmd)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  background: idx === selectedIndex ? 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)' : 'transparent',
                  color: idx === selectedIndex ? '#78350f' : '#1e293b',
                  border: idx === selectedIndex ? '1px solid #fde68a' : '1px solid transparent',
                  cursor: 'pointer',
                  transition: 'all 0.12s ease'
                }}
                onMouseEnter={() => setSelectedIndex(idx)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    background: '#ffffff',
                    padding: '8px',
                    borderRadius: '8px',
                    display: 'flex',
                    border: '1px solid rgba(245, 158, 11, 0.2)',
                    boxShadow: '0 2px 6px rgba(15, 23, 42, 0.04)'
                  }}>
                    {cmd.icon}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.93rem' }}>{cmd.title}</div>
                    <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 500 }}>{cmd.category}</div>
                  </div>
                </div>
                {idx === selectedIndex && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', fontWeight: 700, color: '#c2410c' }}>
                    <span>Execute</span>
                    <ArrowRight size={14} />
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Bottom Helper footer */}
        <div style={{
          padding: '12px 20px',
          background: '#fcf8f0',
          borderTop: '1px solid rgba(245, 158, 11, 0.15)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.75rem',
          color: '#64748b'
        }}>
          <span>Use <strong>↑</strong> <strong>↓</strong> to navigate, <strong>Enter</strong> to open</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#b45309', fontWeight: 600 }}>
            <Zap size={13} color="#f59e0b" /> Real-time instant command palette
          </span>
        </div>
      </div>
    </div>
  );
}
