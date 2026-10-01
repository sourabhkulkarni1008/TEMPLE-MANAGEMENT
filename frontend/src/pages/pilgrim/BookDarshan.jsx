import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';
import { Calendar, Clock, User, CheckCircle2, QrCode, AlertCircle, ArrowRight, ArrowLeft } from 'lucide-react';

const BookDarshan = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [step, setStep] = useState(1);
  const [types, setTypes] = useState([]);
  const [slots, setSlots] = useState([]);

  // Form State
  const todayStr = new Date().toISOString().split('T')[0];
  const [bookingDate, setBookingDate] = useState(todayStr);
  const [selectedType, setSelectedType] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [pilgrimDetails, setPilgrimDetails] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    idProof: 'AADHAAR-9876-XXXX-1234',
    numberOfPeople: 1
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch Darshan Types
  useEffect(() => {
    const fetchTypes = async () => {
      try {
        const res = await api.get('/darshan/types');
        if (res.success) {
          setTypes(res.types || []);
          const paramType = searchParams.get('type');
          if (paramType) {
            const match = res.types.find(t => t.name.toLowerCase().includes(paramType.toLowerCase()));
            if (match) setSelectedType(match);
          } else {
            setSelectedType(res.types[0]);
          }
        }
      } catch (err) {
        console.warn('Failed to load darshan types:', err);
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
        if (res.success) {
          setSlots(res.slots || []);
          if (res.slots?.length > 0) setSelectedSlot(res.slots[0]);
          else setSelectedSlot(null);
        }
      } catch (err) {
        console.warn('Failed to fetch slots:', err);
      }
    };
    fetchSlots();
  }, [bookingDate, selectedType]);

  const handleNextStep = () => {
    setError('');
    if (step === 1 && !bookingDate) {
      setError('Please select a valid visit date.');
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
      if (!pilgrimDetails.name || !pilgrimDetails.phone) {
        setError('Pilgrim full name and contact phone are required.');
        return;
      }
    }
    setStep(step + 1);
  };

  const handleConfirmBooking = async () => {
    setError('');
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
        primaryPilgrimIdProof: pilgrimDetails.idProof,
        totalAmount: (selectedType.price || 0) * parseInt(pilgrimDetails.numberOfPeople, 10)
      };

      const res = await api.post('/bookings', payload);
      if (res.success && res.booking) {
        navigate(`/user/booking/${res.booking.id}`);
      } else {
        setError(res.message || 'Booking failed.');
      }
    } catch (err) {
      setError(err.message || 'Failed to complete booking.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-layout">
      <div className="dashboard-content" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '1.6rem', color: '#0f172a' }}>Book Darshan Slot</h1>
          <p style={{ fontSize: '0.9rem', color: '#64748b' }}>Reserve your temple sanctum entry pass and generate a digital QR token</p>
        </div>

        {/* Step Indicator */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', position: 'relative' }}>
          {['1. Date', '2. Darshan Type', '3. Time Slot', '4. Pilgrim Info', '5. Confirmation'].map((label, idx) => {
            const stepNum = idx + 1;
            const isCompleted = step > stepNum;
            const isCurrent = step === stepNum;

            return (
              <div key={idx} style={{ textAlign: 'center', zIndex: 1, flex: 1 }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: isCurrent ? '#b45309' : (isCompleted ? '#16a34a' : '#e2e8f0'),
                    color: isCurrent || isCompleted ? '#ffffff' : '#64748b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 6px',
                    fontSize: '0.85rem',
                    fontWeight: 600
                  }}
                >
                  {isCompleted ? '✓' : stepNum}
                </div>
                <div style={{ fontSize: '0.75rem', fontWeight: isCurrent ? 600 : 500, color: isCurrent ? '#b45309' : '#64748b' }}>
                  {label}
                </div>
              </div>
            );
          })}
        </div>

        {error && (
          <div className="alert alert-danger" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* STEP 1: Select Date */}
        {step === 1 && (
          <div className="card">
            <h2 className="card-title" style={{ marginBottom: '1rem' }}>Step 1: Choose Visit Date</h2>
            <div className="form-group">
              <label className="form-label">Select Date of Visit</label>
              <input
                type="date"
                className="form-input"
                min={todayStr}
                value={bookingDate}
                onChange={(e) => setBookingDate(e.target.value)}
              />
              <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '6px' }}>
                Advance online reservations are open for the next 7 days.
              </p>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button onClick={handleNextStep} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>Next: Darshan Category</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Select Darshan Type */}
        {step === 2 && (
          <div className="card">
            <h2 className="card-title" style={{ marginBottom: '1rem' }}>Step 2: Choose Darshan Category</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {types.map((t) => (
                <div
                  key={t.id}
                  onClick={() => setSelectedType(t)}
                  style={{
                    border: `2px solid ${selectedType?.id === t.id ? '#b45309' : '#e2e8f0'}`,
                    background: selectedType?.id === t.id ? '#fffbeb' : '#ffffff',
                    borderRadius: '8px',
                    padding: '1rem',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem', color: '#0f172a' }}>{t.name}</div>
                    <div style={{ fontSize: '0.825rem', color: '#64748b', marginTop: '2px' }}>{t.description}</div>
                    <div style={{ fontSize: '0.775rem', marginTop: '4px', color: '#b45309' }}>
                      <span style={{ color: (t.availablePasses ?? t.quotaPerSlot) > 0 ? '#166534' : '#991b1b', fontWeight: 600 }}>
                        {t.price === 0 ? 'Free Passes Left: ' : 'Passes Left: '}
                        {t.availablePasses ?? (t.quotaPerSlot * 6)}
                      </span>
                      {' '}&bull; Duration: {t.approxDuration}
                    </div>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '1.15rem', color: t.price === 0 ? '#166534' : '#b45309' }}>
                    {t.price === 0 ? 'Free' : `₹${t.price}`}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem' }}>
              <button onClick={() => setStep(1)} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ArrowLeft size={16} />
                <span>Back</span>
              </button>
              <button onClick={handleNextStep} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>Next: Time Slot</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Select Time Slot */}
        {step === 3 && (
          <div className="card">
            <h2 className="card-title" style={{ marginBottom: '0.5rem' }}>Step 3: Choose 2-Hour Time Slot</h2>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1rem' }}>
              Date: <strong>{bookingDate}</strong> &bull; Type: <strong>{selectedType?.name}</strong>
            </p>

            {slots.length === 0 ? (
              <p style={{ color: '#64748b', padding: '1rem', textAlign: 'center' }}>No slots available for this date/category.</p>
            ) : (
              <div className="grid-2">
                {slots.map((s) => {
                  const isFull = s.status === 'FULL' || s.bookedCount >= s.capacity;
                  const isSelected = selectedSlot?.id === s.id;

                  return (
                    <div
                      key={s.id}
                      onClick={() => !isFull && setSelectedSlot(s)}
                      style={{
                        border: `2px solid ${isSelected ? '#b45309' : '#e2e8f0'}`,
                        background: isFull ? '#f1f5f9' : (isSelected ? '#fffbeb' : '#ffffff'),
                        opacity: isFull ? 0.6 : 1,
                        cursor: isFull ? 'not-allowed' : 'pointer',
                        borderRadius: '8px',
                        padding: '1rem'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{s.startTime} - {s.endTime}</span>
                        <span className={`badge ${isFull ? 'badge-cancelled' : 'badge-confirmed'}`}>
                          {isFull ? 'Full' : 'Available'}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.775rem', color: '#64748b' }}>
                        Remaining: {Math.max(0, s.capacity - s.bookedCount)} / {s.capacity} slots
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem' }}>
              <button onClick={() => setStep(2)} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ArrowLeft size={16} />
                <span>Back</span>
              </button>
              <button onClick={handleNextStep} className="btn btn-primary" disabled={!selectedSlot} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>Next: Pilgrim Details</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Enter Pilgrim Details with Dedicated ID Verification Sidebar */}
        {step === 4 && (
          <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
            <div className="card">
              <h2 className="card-title" style={{ marginBottom: '1rem' }}>Step 4: Primary Pilgrim &amp; Party Details</h2>

              <div className="form-group">
                <label className="form-label">Primary Pilgrim Full Name</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  value={pilgrimDetails.name}
                  onChange={(e) => setPilgrimDetails({ ...pilgrimDetails, name: e.target.value })}
                />
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Mobile Number</label>
                  <input
                    type="tel"
                    className="form-input"
                    required
                    value={pilgrimDetails.phone}
                    onChange={(e) => setPilgrimDetails({ ...pilgrimDetails, phone: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Number of Pilgrims (Max 6)</label>
                  <input
                    type="number"
                    min="1"
                    max="6"
                    className="form-input"
                    required
                    value={pilgrimDetails.numberOfPeople}
                    onChange={(e) => setPilgrimDetails({ ...pilgrimDetails, numberOfPeople: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem' }}>
                <button onClick={() => setStep(3)} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ArrowLeft size={16} />
                  <span>Back</span>
                </button>
                <button onClick={handleNextStep} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>Next: Review &amp; Confirm</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>

            {/* Dedicated Government ID Proof Sidebar */}
            <div className="card" style={{ border: '1.5px solid #cbd5e1', background: '#ffffff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>Govt ID Verification</h3>
                <span className="badge badge-confirmed" style={{ fontSize: '0.65rem' }}>MANDATORY</span>
              </div>
              <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '1rem' }}>
                Select identity document for security validation at Main Gate:
              </p>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Document Type</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                  {['Masked Aadhaar', 'PAN Card', 'Voter ID', 'Passport'].map((doc) => (
                    <button
                      key={doc}
                      type="button"
                      onClick={() => setPilgrimDetails({
                        ...pilgrimDetails,
                        idProof: doc === 'Masked Aadhaar' ? 'XXXX-XXXX-1920' : (doc === 'PAN Card' ? 'ABCDE1234F' : 'WBF1982736')
                      })}
                      className="btn btn-sm"
                      style={{
                        background: pilgrimDetails.idProof.includes(doc === 'Masked Aadhaar' ? 'XXXX' : (doc === 'PAN Card' ? 'ABCDE' : 'WBF')) ? '#fef3c7' : '#f8fafc',
                        color: pilgrimDetails.idProof.includes(doc === 'Masked Aadhaar' ? 'XXXX' : (doc === 'PAN Card' ? 'ABCDE' : 'WBF')) ? '#b45309' : '#475569',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.75rem',
                        padding: '6px 4px'
                      }}
                    >
                      {doc === 'Masked Aadhaar' && '🪪 '}
                      {doc === 'PAN Card' && '💳 '}
                      {doc === 'Voter ID' && '🗳️ '}
                      {doc === 'Passport' && '✈️ '}
                      {doc}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>ID Number / Masked Token</label>
                <input
                  type="text"
                  className="form-input"
                  style={{ fontFamily: 'monospace', fontWeight: 600 }}
                  value={pilgrimDetails.idProof}
                  onChange={(e) => setPilgrimDetails({ ...pilgrimDetails, idProof: e.target.value.toUpperCase() })}
                />
              </div>

              {/* Virtual ID Card Preview */}
              <div style={{ background: 'linear-gradient(135deg, #1e293b, #0f172a)', color: '#fff', borderRadius: '8px', padding: '0.85rem', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: '#94a3b8', marginBottom: '4px' }}>
                  <span>OFFICIAL ID PROOF</span>
                  <span style={{ color: '#4ade80' }}>✓ VERIFIED</span>
                </div>
                <div style={{ fontFamily: 'monospace', fontSize: '1rem', fontWeight: 700, color: '#fef3c7', marginBottom: '6px' }}>
                  {pilgrimDetails.idProof || 'XXXX-XXXX-1920'}
                </div>
                <div style={{ fontSize: '0.7rem', color: '#cbd5e1' }}>
                  Holder: <strong>{pilgrimDetails.name || 'Pilgrim'}</strong>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: Confirm Booking */}
        {step === 5 && (
          <div className="card">
            <h2 className="card-title" style={{ marginBottom: '1rem' }}>Step 5: Review &amp; Confirm Darshan Booking</h2>

            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1.25rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px dashed #cbd5e1', marginBottom: '0.5rem' }}>
                <span style={{ color: '#64748b' }}>Darshan Category:</span>
                <strong>{selectedType?.name}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px dashed #cbd5e1', marginBottom: '0.5rem' }}>
                <span style={{ color: '#64748b' }}>Date of Visit:</span>
                <strong>{bookingDate}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px dashed #cbd5e1', marginBottom: '0.5rem' }}>
                <span style={{ color: '#64748b' }}>Slot Time:</span>
                <strong>{selectedSlot?.startTime} - {selectedSlot?.endTime}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px dashed #cbd5e1', marginBottom: '0.5rem' }}>
                <span style={{ color: '#64748b' }}>Pilgrim Name:</span>
                <strong>{pilgrimDetails.name}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px dashed #cbd5e1', marginBottom: '0.5rem' }}>
                <span style={{ color: '#64748b' }}>Contact Phone:</span>
                <strong>{pilgrimDetails.phone}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px dashed #cbd5e1', marginBottom: '0.5rem' }}>
                <span style={{ color: '#64748b' }}>Total Pilgrims:</span>
                <strong>{pilgrimDetails.numberOfPeople} Person(s)</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.5rem', fontSize: '1.1rem' }}>
                <span style={{ fontWeight: 600 }}>Total Payable:</span>
                <strong style={{ color: '#b45309' }}>
                  {(selectedType?.price || 0) * parseInt(pilgrimDetails.numberOfPeople, 10) === 0
                    ? 'Free'
                    : `₹${(selectedType?.price || 0) * parseInt(pilgrimDetails.numberOfPeople, 10)}`}
                </strong>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button onClick={() => setStep(4)} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ArrowLeft size={16} />
                <span>Back</span>
              </button>
              <button onClick={handleConfirmBooking} className="btn btn-success btn-lg" disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={18} />
                <span>{loading ? 'Confirming Booking...' : 'Confirm & Generate QR Pass'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookDarshan;
