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
        <div style={{ marginBottom: '2rem', textAlign: 'center', maxWidth: '700px', margin: '0 auto 2rem' }}>
          <h1 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>Darshan Booking Categories</h1>
          <p style={{ fontSize: '0.95rem' }}>
            Choose an appropriate darshan category, view time slot schedules, and complete your digital token reservation.
          </p>
        </div>

        <div className="grid-2" style={{ marginBottom: '2rem' }}>
          {types.map((t) => (
            <div key={t.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <h3 style={{ fontSize: '1.15rem', color: '#0f172a' }}>{t.name}</h3>
                  <span style={{ fontSize: '1.25rem', fontWeight: 700, color: t.price === 0 ? '#166534' : '#b45309' }}>
                    {t.price === 0 ? 'Free' : `₹${t.price}`}
                  </span>
                </div>

                <p style={{ fontSize: '0.9rem', color: '#475569', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                  {t.description}
                </p>

                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '0.75rem', display: 'flex', justifyContent: 'space-around', fontSize: '0.825rem', marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={15} color="#b45309" />
                    <span><strong>Duration:</strong> {t.approxDuration}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Users size={15} color="#b45309" />
                    <span><strong style={{ color: (t.availablePasses ?? t.quotaPerSlot) > 0 ? '#166534' : '#991b1b' }}>{t.price === 0 ? 'Free Left:' : 'Left:'}</strong> {t.availablePasses ?? (t.quotaPerSlot * 6)}</span>
                  </div>
                </div>
              </div>

              <Link to={`/user/book-darshan?type=${encodeURIComponent(t.name)}`} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <span>Proceed to Book Slot</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          ))}
        </div>

        <div className="card" style={{ background: '#f8fafc', padding: '1.5rem', textAlign: 'center' }}>
          <h3 style={{ fontSize: '1.05rem', marginBottom: '0.5rem' }}>Booking Procedure Checklist</h3>
          <p style={{ fontSize: '0.875rem', maxWidth: '600px', margin: '0 auto 1rem' }}>
            1. Select Date &rarr; 2. Choose Time Slot &rarr; 3. Enter Pilgrim Aadhaar / Govt ID &rarr; 4. Confirm &amp; Download Digital QR Pass.
          </p>
          <Link to="/user/book-darshan" className="btn btn-secondary btn-sm">
            Launch Fast Booking Wizard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DarshanOverview;
