import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import { CalendarCheck, Clock, Users, ArrowRight } from 'lucide-react';

const DarshanOverview = () => {
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTypes = async () => {
      try {
        const res = await api.get('/darshan/types');
        if (res.success) setTypes(res.types || []);
      } catch (err) {
        console.warn('Failed to load darshan types:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTypes();
  }, []);

  return (
    <div className="main-content">
      <div className="container">
        <div style={{ marginBottom: '2.5rem', textAlign: 'center', maxWidth: '720px', margin: '0 auto 2.5rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)', border: '1px solid #fde68a', color: '#92400e', padding: '4px 14px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Sacred Darshan Quotas &amp; Passes
          </div>
          <h1 style={{ fontSize: '2.1rem', fontWeight: 800, marginBottom: '0.65rem' }}>
            Divine Darshan Categories
          </h1>
          <p style={{ fontSize: '0.96rem', color: '#64748b', lineHeight: 1.6 }}>
            Select an appropriate darshan tier, review guaranteed time slots, and complete your biometric digital QR token reservation.
          </p>
        </div>

        <div className="grid-2" style={{ marginBottom: '2.5rem' }}>
          {types.map((t) => (
            <div 
              key={t.id} 
              className="card card-gold-trim glass-card" 
              style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'space-between',
                padding: '1.75rem'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.85rem' }}>
                  <h3 style={{ fontSize: '1.25rem', color: '#0f172a', fontWeight: 700 }}>{t.name}</h3>
                  <span 
                    style={{ 
                      fontSize: '1.25rem', 
                      fontWeight: 800, 
                      color: t.price === 0 ? '#166534' : '#c2410c',
                      background: t.price === 0 ? '#ecfdf5' : '#fffbeb',
                      border: t.price === 0 ? '1px solid #a7f3d0' : '1px solid #fde68a',
                      padding: '3px 12px',
                      borderRadius: '20px',
                      fontFamily: 'Outfit, sans-serif'
                    }}
                  >
                    {t.price === 0 ? 'Free Pass' : `₹${t.price}`}
                  </span>
                </div>

                <p style={{ fontSize: '0.92rem', color: '#475569', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                  {t.description}
                </p>

                <div style={{ background: 'rgba(254, 243, 199, 0.45)', border: '1px solid rgba(245, 158, 11, 0.25)', borderRadius: '10px', padding: '0.85rem 1rem', display: 'flex', justifyContent: 'space-around', fontSize: '0.85rem', marginBottom: '1.4rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Clock size={16} color="#c2410c" />
                    <span><strong>Duration:</strong> {t.approxDuration}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Users size={16} color="#c2410c" />
                    <span><strong style={{ color: (t.availablePasses ?? t.quotaPerSlot) > 0 ? '#166534' : '#991b1b' }}>{t.price === 0 ? 'Free Left:' : 'Passes Left:'}</strong> {t.availablePasses ?? (t.quotaPerSlot * 6)}</span>
                  </div>
                </div>
              </div>

              <Link 
                to={`/user/book-darshan?type=${encodeURIComponent(t.name)}`} 
                className={t.price === 0 ? 'btn btn-primary' : 'btn btn-gold'} 
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                <span>{t.price === 0 ? 'Book Guaranteed Free Pass' : 'Reserve Fast-Track Slot'}</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          ))}
        </div>

        <div className="glass-card" style={{ background: 'linear-gradient(135deg, #fcfbf8 0%, #fef9ee 100%)', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '2rem', textAlign: 'center' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', fontWeight: 800 }}>Seamless 4-Step Booking Procedure</h3>
          <p style={{ fontSize: '0.9rem', maxWidth: '640px', margin: '0 auto 1.25rem', color: '#64748b', lineHeight: 1.6 }}>
            1. Select Visiting Date &rarr; 2. Choose Time Slot &rarr; 3. Enter Pilgrim Aadhaar / Govt ID Proof &rarr; 4. Confirm &amp; Download Digital QR Pass.
          </p>
          <Link to="/user/book-darshan" className="btn btn-secondary btn-sm" style={{ fontWeight: 700, padding: '0.6rem 1.4rem' }}>
            Launch Fast Booking Wizard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DarshanOverview;
