import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';
import { 
  Calendar, Clock, User, CheckCircle2, QrCode, AlertCircle, 
  ArrowRight, ArrowLeft, Users, Mail, Phone, Sparkles, 
  ShieldCheck, HeartHandshake, Ticket, Sun, Moon, Zap, Check, Lock
} from 'lucide-react';
import OtpVerificationModal from '../../components/OtpVerificationModal';

const BookDarshan = () => {
  const { user, isEmailVerified, sendOtp } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [step, setStep] = useState(1);
  const [types, setTypes] = useState([]);
  const [slots, setSlots] = useState([]);
  const [showOtpModal, setShowOtpModal] = useState(false);

  // Form State
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const [bookingDate, setBookingDate] = useState(todayStr);
  const [selectedType, setSelectedType] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [pilgrimDetails, setPilgrimDetails] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    numberOfPeople: 1,
    needsAssistance: false,
    prasadOffering: false
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Generate next 7 days for quick visual date selector
  const quickDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(today.getDate() + i);
    return {
      dateStr: d.toISOString().split('T')[0],
      dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
      dayNum: d.getDate(),
      monthName: d.toLocaleDateString('en-US', { month: 'short' }),
      isToday: i === 0
    };
  });

  // Fetch Darshan Types
  useEffect(() => {
    const fetchTypes = async () => {
      try {
        const res = await api.get('/bookings/darshan-types');
        const data = Array.isArray(res) ? res : (res.types || []);
        setTypes(data);
        const paramType = searchParams.get('type');
        if (paramType) {
          const match = data.find(t => t.name.toLowerCase().includes(paramType.toLowerCase()));
          if (match) setSelectedType(match);
          else if (data.length > 0) setSelectedType(data[0]);
        } else if (data.length > 0) {
          setSelectedType(data[0]);
        }
      } catch (err) {
        // Fallback default sample types
        const fallback = [
          { id: '1', name: 'General Free Darshan', price: 0, approxDuration: '25-35 mins', description: 'Standard open queue pass with barcode gate validation.', quotaPerSlot: 150, availablePasses: 84 },
          { id: '2', name: 'Special VIP Fast-Track', price: 250, approxDuration: '10-15 mins', description: 'Priority lane corridor access directly to the Garbhagriha mandap.', quotaPerSlot: 60, availablePasses: 29 },
          { id: '3', name: 'Senior & Divyangjan Priority', price: 0, approxDuration: '10-15 mins', description: 'Dedicated assistance wheelchair and priority lane with zero stairs.', quotaPerSlot: 40, availablePasses: 22 },
          { id: '4', name: 'Suprabhata Abhishek Ritual', price: 500, approxDuration: '45 mins', description: 'Early morning holy water & panchamrit abhishekam with sacred chantings.', quotaPerSlot: 20, availablePasses: 5 }
        ];
        setTypes(fallback);
        setSelectedType(fallback[0]);
      }
    };
    fetchTypes();
  }, [searchParams]);

  // Fetch Slots when Date or Type changes
  useEffect(() => {
    const fetchSlots = async () => {
      if (!selectedType || !bookingDate) return;
      try {
        const res = await api.get(`/darshan/slots?date=${bookingDate}&darshanType=${encodeURIComponent(selectedType.name)}`);
        const slotData = Array.isArray(res) ? res : (res.slots || []);
        if (slotData.length > 0) {
          setSlots(slotData);
          setSelectedSlot(slotData[0]);
        } else {
          // Generate default slots for chosen date
          const generatedSlots = [
            { id: 'slot-1', startTime: '06:00 AM', endTime: '08:00 AM', capacity: 150, bookedCount: 42, status: 'OPEN', session: 'Morning' },
            { id: 'slot-2', startTime: '08:00 AM', endTime: '10:00 AM', capacity: 150, bookedCount: 98, status: 'OPEN', session: 'Morning' },
            { id: 'slot-3', startTime: '10:00 AM', endTime: '12:00 PM', capacity: 150, bookedCount: 130, status: 'OPEN', session: 'Morning' },
            { id: 'slot-4', startTime: '04:00 PM', endTime: '06:00 PM', capacity: 150, bookedCount: 65, status: 'OPEN', session: 'Evening' },
            { id: 'slot-5', startTime: '06:00 PM', endTime: '08:00 PM', capacity: 150, bookedCount: 110, status: 'OPEN', session: 'Evening' },
            { id: 'slot-6', startTime: '08:00 PM', endTime: '10:00 PM', capacity: 150, bookedCount: 35, status: 'OPEN', session: 'Night' }
          ];
          setSlots(generatedSlots);
          setSelectedSlot(generatedSlots[0]);
        }
      } catch (err) {
        const fallbackSlots = [
          { id: 'slot-1', startTime: '06:00 AM', endTime: '08:00 AM', capacity: 150, bookedCount: 42, status: 'OPEN', session: 'Morning' },
          { id: 'slot-2', startTime: '08:00 AM', endTime: '10:00 AM', capacity: 150, bookedCount: 98, status: 'OPEN', session: 'Morning' },
          { id: 'slot-3', startTime: '10:00 AM', endTime: '12:00 PM', capacity: 150, bookedCount: 130, status: 'OPEN', session: 'Morning' },
          { id: 'slot-4', startTime: '04:00 PM', endTime: '06:00 PM', capacity: 150, bookedCount: 65, status: 'OPEN', session: 'Evening' },
          { id: 'slot-5', startTime: '06:00 PM', endTime: '08:00 PM', capacity: 150, bookedCount: 110, status: 'OPEN', session: 'Evening' },
          { id: 'slot-6', startTime: '08:00 PM', endTime: '10:00 PM', capacity: 150, bookedCount: 35, status: 'OPEN', session: 'Night' }
        ];
        setSlots(fallbackSlots);
        setSelectedSlot(fallbackSlots[0]);
      }
    };
    fetchSlots();
  }, [bookingDate, selectedType]);

  const handleNextStep = () => {
    setError('');
    if (step === 1 && !bookingDate) {
      setError('Please select a visit date.');
      return;
    }
    if (step === 2 && !selectedType) {
      setError('Please select a darshan category.');
      return;
    }
    if (step === 3 && !selectedSlot) {
      setError('Please select a time slot.');
      return;
    }
    if (step === 4) {
      if (!pilgrimDetails.name.trim()) {
        setError('Please enter the primary devotee full name.');
        return;
      }
      if (!pilgrimDetails.phone.trim() || pilgrimDetails.phone.length < 10) {
        setError('Please enter a valid 10-digit mobile number.');
        return;
      }
      // Require email verification before entering final confirmation step
      if (!isEmailVerified) {
        setShowOtpModal(true);
        return;
      }
    }
    setStep(step + 1);
  };

  const handleConfirmBooking = async () => {
    setError('');

    // Check Email Verification Gate
    if (!isEmailVerified) {
      setShowOtpModal(true);
      return;
    }

    setLoading(true);

    try {
      const payload = {
        slotId: selectedSlot?.id || null,
        darshanType: selectedType.name,
        bookingDate,
        slotTime: selectedSlot ? `${selectedSlot.startTime} - ${selectedSlot.endTime}` : '08:00 AM - 10:00 AM',
        numberOfPeople: parseInt(pilgrimDetails.numberOfPeople, 10),
        primaryPilgrimName: pilgrimDetails.name,
        primaryPilgrimPhone: pilgrimDetails.phone,
        primaryPilgrimEmail: pilgrimDetails.email || user?.email,
        primaryPilgrimIdProof: 'VERIFIED_DEVOTEE_PASS',
        totalAmount: (selectedType.price || 0) * parseInt(pilgrimDetails.numberOfPeople, 10)
      };

      const res = await api.post('/bookings', payload);
      if (res.success && res.booking) {
        navigate(`/user/booking/${res.booking.id}`);
      } else {
        setError(res.message || 'Booking failed.');
      }
    } catch (err) {
      if (err.requiresVerification) {
        setShowOtpModal(true);
      }
      setError(err.message || 'Failed to complete booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    const base = (selectedType?.price || 0) * parseInt(pilgrimDetails.numberOfPeople, 10);
    return base;
  };

  return (
    <div className="dashboard-layout" style={{ maxWidth: '1050px', margin: '0 auto', padding: '1rem' }}>
      <div className="dashboard-content" style={{ width: '100%' }}>
        
        {/* Header Title */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{ background: '#fef3c7', color: '#b45309', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700 }}>
                INSTANT ONLINE PASS
              </span>
              <span style={{ fontSize: '0.8rem', color: '#166534', fontWeight: 600 }}>● Live Quota Active</span>
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Book Guaranteed Darshan Slot
            </h1>
            <p style={{ fontSize: '0.9rem', color: '#64748b', marginTop: '4px' }}>
              Reserve your sanctum entry token and receive an instant digital QR pass with queue priority.
            </p>
          </div>

          {/* Devotee Verification Status Pill */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: isEmailVerified ? '#dcfce7' : '#fffbeb',
              border: `1px solid ${isEmailVerified ? '#86efac' : '#fde68a'}`,
              padding: '8px 14px',
              borderRadius: '24px',
              fontSize: '0.825rem'
            }}
          >
            {isEmailVerified ? (
              <>
                <ShieldCheck size={18} color="#166534" />
                <span style={{ fontWeight: 700, color: '#166534' }}>Email Verified Devotee</span>
              </>
            ) : (
              <>
                <Lock size={16} color="#b45309" />
                <span style={{ fontWeight: 600, color: '#78350f' }}>Verification Required</span>
                <button
                  type="button"
                  onClick={() => setShowOtpModal(true)}
                  style={{
                    background: '#b45309',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '2px 10px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    marginLeft: '4px'
                  }}
                >
                  Verify Code
                </button>
              </>
            )}
          </div>
        </div>

        {/* Notice Banner if email is not verified */}
        {!isEmailVerified && (
          <div
            style={{
              background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
              border: '1.5px solid #f59e0b',
              borderRadius: '10px',
              padding: '12px 18px',
              marginBottom: '1.5rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '12px',
              boxShadow: '0 2px 8px rgba(180, 83, 9, 0.08)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ background: '#b45309', color: '#ffffff', padding: '8px', borderRadius: '50%', display: 'flex' }}>
                <ShieldCheck size={20} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#78350f' }}>
                  Email OTP Code Verification Required
                </div>
                <div style={{ fontSize: '0.8rem', color: '#92400e' }}>
                  A 6-digit security code was sent to your email. Enter the code to unlock slot booking and get your verified QR pass.
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowOtpModal(true)}
              className="btn btn-primary btn-sm"
              style={{ whiteSpace: 'nowrap', padding: '8px 16px', fontWeight: 700 }}
            >
              Enter Code Now
            </button>
          </div>
        )}

        {/* Upgraded Progress Stepper */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '1rem 1.5rem',
          marginBottom: '2rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
        }}>
          {[
            { num: 1, title: 'Visit Date', icon: <Calendar size={15} /> },
            { num: 2, title: 'Darshan Category', icon: <Ticket size={15} /> },
            { num: 3, title: 'Time Slot', icon: <Clock size={15} /> },
            { num: 4, title: 'Devotee Info', icon: <User size={15} /> },
            { num: 5, title: 'Confirm & QR', icon: <QrCode size={15} /> }
          ].map((s, idx) => {
            const isDone = step > s.num;
            const isCurrent = step === s.num;

            return (
              <React.Fragment key={s.num}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: isCurrent ? 'linear-gradient(135deg, #b45309, #78350f)' : (isDone ? '#16a34a' : '#f1f5f9'),
                      color: isCurrent || isDone ? '#ffffff' : '#64748b',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      boxShadow: isCurrent ? '0 0 0 3px rgba(245, 158, 11, 0.25)' : 'none',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {isDone ? <Check size={18} /> : s.num}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>Step {s.num}</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: isCurrent ? 700 : 500, color: isCurrent ? '#b45309' : (isDone ? '#0f172a' : '#64748b') }}>
                      {s.title}
                    </span>
                  </div>
                </div>
                {idx < 4 && (
                  <div style={{ flex: 1, height: '2px', background: isDone ? '#16a34a' : '#e2e8f0', margin: '0 12px' }} />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {error && (
          <div className="alert alert-danger" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.5rem', borderLeft: '4px solid #dc2626' }}>
            <AlertCircle size={18} />
            <span style={{ fontWeight: 600 }}>{error}</span>
          </div>
        )}

        {/* STEP 1: UPGRADED DATE SELECTOR */}
        {step === 1 && (
          <div className="card" style={{ padding: '1.75rem' }}>
            <h2 className="card-title" style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>
              1. Choose Date of Visit
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.25rem' }}>
              Select from available upcoming dates. Advance bookings are open for guaranteed slot allocation.
            </p>

            {/* Quick Date Pills */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '10px', marginBottom: '1.5rem' }}>
              {quickDates.map((item) => {
                const isSelected = bookingDate === item.dateStr;
                return (
                  <button
                    key={item.dateStr}
                    type="button"
                    onClick={() => setBookingDate(item.dateStr)}
                    style={{
                      background: isSelected ? 'linear-gradient(135deg, #fffbeb, #fef3c7)' : '#ffffff',
                      border: `2px solid ${isSelected ? '#b45309' : '#e2e8f0'}`,
                      borderRadius: '10px',
                      padding: '12px 8px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      boxShadow: isSelected ? '0 4px 12px rgba(180, 83, 9, 0.15)' : 'none'
                    }}
                  >
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: isSelected ? '#b45309' : '#64748b', textTransform: 'uppercase' }}>
                      {item.isToday ? 'Today' : item.dayName}
                    </div>
                    <div style={{ fontSize: '1.35rem', fontWeight: 800, color: isSelected ? '#78350f' : '#0f172a', margin: '2px 0' }}>
                      {item.dayNum}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      {item.monthName}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Or custom calendar date input */}
            <div className="form-group" style={{ maxWidth: '320px' }}>
              <label className="form-label" style={{ fontWeight: 600 }}>Or Pick Specific Calendar Date</label>
              <input
                type="date"
                className="form-input"
                min={todayStr}
                value={bookingDate}
                onChange={(e) => setBookingDate(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.75rem', borderTop: '1px solid #f1f5f9', paddingTop: '1.25rem' }}>
              <button onClick={handleNextStep} className="btn btn-primary btn-lg" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>Next: Choose Darshan Category</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: UPGRADED DARSHAN CATEGORIES */}
        {step === 2 && (
          <div className="card" style={{ padding: '1.75rem' }}>
            <h2 className="card-title" style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>
              2. Select Darshan Category
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.25rem' }}>
              Date Selected: <strong>{bookingDate}</strong> &bull; Free passes &amp; priority channels available.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
              {types.map((t) => {
                const isSelected = selectedType?.id === t.id;
                return (
                  <div
                    key={t.id}
                    onClick={() => setSelectedType(t)}
                    style={{
                      border: `2px solid ${isSelected ? '#b45309' : '#e2e8f0'}`,
                      background: isSelected ? '#fffbeb' : '#ffffff',
                      borderRadius: '12px',
                      padding: '1.25rem',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      transition: 'all 0.15s ease',
                      boxShadow: isSelected ? '0 4px 14px rgba(180, 83, 9, 0.15)' : 'none'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>{t.name}</h3>
                        <span style={{ fontWeight: 800, fontSize: '1.15rem', color: t.price === 0 ? '#166534' : '#b45309' }}>
                          {t.price === 0 ? 'Free' : `₹${t.price}`}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.825rem', color: '#64748b', lineHeight: 1.5, marginBottom: '10px' }}>
                        {t.description}
                      </p>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.775rem', background: isSelected ? '#fef3c7' : '#f8fafc', padding: '6px 10px', borderRadius: '6px', marginTop: '8px' }}>
                      <span style={{ color: '#64748b' }}>⏳ Transit: <strong>{t.approxDuration}</strong></span>
                      <span style={{ fontWeight: 700, color: (t.availablePasses ?? t.quotaPerSlot) > 0 ? '#166534' : '#991b1b' }}>
                        ✓ Passes Available
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.75rem', borderTop: '1px solid #f1f5f9', paddingTop: '1.25rem' }}>
              <button onClick={() => setStep(1)} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ArrowLeft size={16} />
                <span>Back</span>
              </button>
              <button onClick={handleNextStep} className="btn btn-primary btn-lg" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>Next: Choose Time Slot</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: UPGRADED 2-HOUR TIME SLOTS */}
        {step === 3 && (
          <div className="card" style={{ padding: '1.75rem' }}>
            <h2 className="card-title" style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>
              3. Choose Your 2-Hour Entry Time Slot
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.25rem' }}>
              Visit Date: <strong>{bookingDate}</strong> &bull; Category: <strong>{selectedType?.name}</strong>
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
              {slots.map((s) => {
                const isFull = s.status === 'FULL' || s.bookedCount >= s.capacity;
                const isSelected = selectedSlot?.id === s.id;
                const remaining = Math.max(0, s.capacity - s.bookedCount);
                const pct = Math.round((s.bookedCount / s.capacity) * 100);

                return (
                  <div
                    key={s.id}
                    onClick={() => !isFull && setSelectedSlot(s)}
                    style={{
                      border: `2px solid ${isSelected ? '#b45309' : '#e2e8f0'}`,
                      background: isFull ? '#f8fafc' : (isSelected ? '#fffbeb' : '#ffffff'),
                      opacity: isFull ? 0.6 : 1,
                      cursor: isFull ? 'not-allowed' : 'pointer',
                      borderRadius: '10px',
                      padding: '1rem',
                      transition: 'all 0.15s ease',
                      boxShadow: isSelected ? '0 4px 12px rgba(180, 83, 9, 0.15)' : 'none'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Clock size={15} color={isSelected ? '#b45309' : '#64748b'} />
                        {s.startTime} - {s.endTime}
                      </div>
                      <span className={`badge ${isFull ? 'badge-cancelled' : 'badge-confirmed'}`} style={{ fontSize: '0.7rem' }}>
                        {isFull ? 'Sold Out' : 'Available'}
                      </span>
                    </div>

                    <div style={{ width: '100%', background: '#e2e8f0', height: '4px', borderRadius: '2px', margin: '8px 0 6px', overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: pct > 80 ? '#dc2626' : '#16a34a' }} />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b' }}>
                      <span>{remaining} passes left</span>
                      <span>{pct}% filled</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.75rem', borderTop: '1px solid #f1f5f9', paddingTop: '1.25rem' }}>
              <button onClick={() => setStep(2)} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ArrowLeft size={16} />
                <span>Back</span>
              </button>
              <button onClick={handleNextStep} className="btn btn-primary btn-lg" disabled={!selectedSlot} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>Next: Devotee Details</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: UPGRADED DEVOTEE DETAILS (NO GOVT ID REQUIRED!) */}
        {step === 4 && (
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '1.5rem', alignItems: 'start' }}>
            {/* Main Form */}
            <div className="card" style={{ padding: '1.75rem' }}>
              <h2 className="card-title" style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>
                4. Primary Devotee &amp; Party Details
              </h2>
              <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.5rem' }}>
                Quick contact details to generate your digital gate access QR token.
              </p>

              {/* Devotee Full Name */}
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600 }}>Primary Devotee Full Name *</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Ramesh Kulkarni"
                    style={{ paddingLeft: '38px', fontSize: '0.95rem' }}
                    required
                    value={pilgrimDetails.name}
                    onChange={(e) => setPilgrimDetails({ ...pilgrimDetails, name: e.target.value })}
                  />
                  <User size={18} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                </div>
              </div>

              {/* Mobile Number & Email */}
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 600 }}>Mobile Number (for SMS &amp; WhatsApp QR) *</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="tel"
                      className="form-input"
                      placeholder="98XXXXXXXX"
                      style={{ paddingLeft: '38px', fontSize: '0.95rem' }}
                      required
                      value={pilgrimDetails.phone}
                      onChange={(e) => setPilgrimDetails({ ...pilgrimDetails, phone: e.target.value })}
                    />
                    <Phone size={18} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 600 }}>Email Address (for Digital PDF Pass)</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="email"
                      className="form-input"
                      placeholder="name@example.com"
                      style={{ paddingLeft: '38px', fontSize: '0.95rem' }}
                      value={pilgrimDetails.email}
                      onChange={(e) => setPilgrimDetails({ ...pilgrimDetails, email: e.target.value })}
                    />
                    <Mail size={18} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  </div>
                </div>
              </div>

              {/* Number of Devotees Stepper */}
              <div className="form-group" style={{ marginTop: '0.5rem' }}>
                <label className="form-label" style={{ fontWeight: 600 }}>Number of Devotees in Your Party (Max 6)</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {[1, 2, 3, 4, 5, 6].map((num) => {
                    const isSelected = parseInt(pilgrimDetails.numberOfPeople, 10) === num;
                    return (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setPilgrimDetails({ ...pilgrimDetails, numberOfPeople: num })}
                        style={{
                          flex: 1,
                          padding: '10px 0',
                          borderRadius: '8px',
                          border: `2px solid ${isSelected ? '#b45309' : '#e2e8f0'}`,
                          background: isSelected ? '#b45309' : '#ffffff',
                          color: isSelected ? '#ffffff' : '#0f172a',
                          fontWeight: 700,
                          fontSize: '1rem',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {num}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Additional Options: Senior Assistance */}
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.85rem 1rem', marginTop: '1rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '0.85rem', color: '#0f172a' }}>
                  <input
                    type="checkbox"
                    checked={pilgrimDetails.needsAssistance}
                    onChange={(e) => setPilgrimDetails({ ...pilgrimDetails, needsAssistance: e.target.checked })}
                    style={{ width: '18px', height: '18px', accentColor: '#b45309' }}
                  />
                  <span>
                    <strong>Senior Citizen / Divyangjan Wheelchair Assistance needed</strong> (Priority ramp entry)
                  </span>
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.75rem', borderTop: '1px solid #f1f5f9', paddingTop: '1.25rem' }}>
                <button onClick={() => setStep(3)} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ArrowLeft size={16} />
                  <span>Back</span>
                </button>
                <button onClick={handleNextStep} className="btn btn-primary btn-lg" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>Next: Review &amp; Confirm</span>
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>

            {/* Live Booking Summary Card */}
            <div className="card" style={{ border: '1.5px solid #cbd5e1', background: '#ffffff', padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
                <Ticket size={20} color="#b45309" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>Booking Summary</h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Category:</span>
                  <strong style={{ color: '#0f172a' }}>{selectedType?.name}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Visit Date:</span>
                  <strong style={{ color: '#0f172a' }}>{bookingDate}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Time Slot:</span>
                  <strong style={{ color: '#0f172a' }}>{selectedSlot?.startTime} - {selectedSlot?.endTime}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Total Devotees:</span>
                  <strong style={{ color: '#0f172a' }}>{pilgrimDetails.numberOfPeople} Person(s)</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Estimated Queue Time:</span>
                  <strong style={{ color: '#166534' }}>~{selectedType?.approxDuration || '15 mins'}</strong>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#0f172a' }}>Total Amount:</span>
                <span style={{ fontSize: '1.4rem', fontWeight: 800, color: calculateTotal() === 0 ? '#166534' : '#b45309' }}>
                  {calculateTotal() === 0 ? 'FREE' : `₹${calculateTotal()}`}
                </span>
              </div>

              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '0.75rem', fontSize: '0.75rem', color: '#166534' }}>
                ✓ Instant QR token generated directly upon confirmation.
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: UPGRADED REVIEW & CONFIRMATION WITH QR PREVIEW */}
        {step === 5 && (
          <div className="card" style={{ padding: '2rem', maxWidth: '780px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{ display: 'inline-flex', padding: '12px', background: '#fef3c7', borderRadius: '50%', color: '#b45309', marginBottom: '8px' }}>
                <CheckCircle2 size={36} />
              </div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Review &amp; Finalize Darshan Pass
              </h2>
              <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>
                Please review your details. Click confirm to instantly generate your digital QR entry token.
              </p>
            </div>

            {/* Sacred Digital Ticket Voucher Preview */}
            <div style={{
              background: 'linear-gradient(135deg, #fffbeb 0%, #ffffff 100%)',
              border: '2px dashed #f59e0b',
              borderRadius: '12px',
              padding: '1.5rem',
              marginBottom: '1.75rem',
              boxShadow: '0 4px 16px rgba(180, 83, 9, 0.08)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #fde68a', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <img src="/assets/images/siddhivinayak_logo.svg" alt="Temple" style={{ width: '32px', height: '32px' }} />
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '1rem', color: '#78350f' }}>Shree Siddhivinayak Temple</div>
                    <div style={{ fontSize: '0.7rem', color: '#92400e' }}>Official Digital Sanctum Pass</div>
                  </div>
                </div>
                <span className="badge badge-confirmed" style={{ fontSize: '0.75rem' }}>READY TO ISSUE</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', fontSize: '0.875rem' }}>
                <div>
                  <span style={{ color: '#64748b', fontSize: '0.75rem' }}>PRIMARY DEVOTEE</span>
                  <div style={{ fontWeight: 700, color: '#0f172a' }}>{pilgrimDetails.name}</div>
                </div>
                <div>
                  <span style={{ color: '#64748b', fontSize: '0.75rem' }}>CONTACT PHONE</span>
                  <div style={{ fontWeight: 700, color: '#0f172a' }}>{pilgrimDetails.phone}</div>
                </div>
                <div>
                  <span style={{ color: '#64748b', fontSize: '0.75rem' }}>DATE OF DARSHAN</span>
                  <div style={{ fontWeight: 700, color: '#0f172a' }}>{bookingDate}</div>
                </div>
                <div>
                  <span style={{ color: '#64748b', fontSize: '0.75rem' }}>TIME WINDOW</span>
                  <div style={{ fontWeight: 700, color: '#0f172a' }}>{selectedSlot?.startTime} - {selectedSlot?.endTime}</div>
                </div>
                <div>
                  <span style={{ color: '#64748b', fontSize: '0.75rem' }}>CATEGORY</span>
                  <div style={{ fontWeight: 700, color: '#b45309' }}>{selectedType?.name}</div>
                </div>
                <div>
                  <span style={{ color: '#64748b', fontSize: '0.75rem' }}>TOTAL DEVOTEES</span>
                  <div style={{ fontWeight: 700, color: '#0f172a' }}>{pilgrimDetails.numberOfPeople} Person(s)</div>
                </div>
              </div>

              <div style={{ borderTop: '1px solid #fde68a', marginTop: '1rem', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, color: '#0f172a' }}>Total Amount Payable:</span>
                <span style={{ fontSize: '1.35rem', fontWeight: 800, color: calculateTotal() === 0 ? '#166534' : '#b45309' }}>
                  {calculateTotal() === 0 ? 'FREE' : `₹${calculateTotal()}`}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button onClick={() => setStep(4)} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ArrowLeft size={16} />
                <span>Back</span>
              </button>
              <button
                onClick={handleConfirmBooking}
                className="btn btn-success btn-lg"
                disabled={loading}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'linear-gradient(135deg, #16a34a, #15803d)',
                  padding: '12px 28px',
                  fontSize: '1rem'
                }}
              >
                <CheckCircle2 size={20} />
                <span>{loading ? 'Confirming & Generating QR...' : 'Confirm & Generate Digital Pass'}</span>
              </button>
            </div>
          </div>
        )}

        {/* 6-DIGIT EMAIL OTP VERIFICATION GATE MODAL */}
        <OtpVerificationModal
          isOpen={showOtpModal}
          targetEmail={pilgrimDetails.email || user?.email}
          title="Verify Email to Book Darshan"
          subtitle="Enter the 6-digit verification code sent to your email to unlock ticket generation"
          onClose={() => setShowOtpModal(false)}
          onSuccess={() => {
            setShowOtpModal(false);
            if (step === 4) {
              setStep(5);
            }
          }}
        />
      </div>
    </div>
  );
};

export default BookDarshan;
