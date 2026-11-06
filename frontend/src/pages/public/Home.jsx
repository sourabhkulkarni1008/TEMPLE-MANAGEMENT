import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  CalendarCheck, Eye, ShieldCheck, Clock, Users, ArrowRight, 
  Sparkles, ChevronLeft, ChevronRight, Check, Sun, Moon, 
  Ticket, Box, Compass, Flame, Bell, QrCode, Zap, Layers
} from 'lucide-react';
import api from '../../api/client';
import StatusBadge from '../../components/StatusBadge';
import CrowdHeatmap from '../../components/CrowdHeatmap';
import { audioService } from '../../utils/audioService';

const DEFAULT_AREAS = [
  { id: 'area-1', name: 'Main Entrance & Security Gate', code: 'MAIN_ENTRANCE', currentCount: 110, capacity: 250, crowdLevel: 'LOW', occupancyPct: 44.0, cameraId: 'CAM-01' },
  { id: 'area-2', name: 'Queue Complex & Holding Bays', code: 'QUEUE_AREA', currentCount: 285, capacity: 350, crowdLevel: 'HIGH', occupancyPct: 81.4, cameraId: 'CAM-02' },
  { id: 'area-3', name: 'Main Sanctum / Darshan Hall', code: 'DARSHAN_HALL', currentCount: 105, capacity: 180, crowdLevel: 'MODERATE', occupancyPct: 58.3, cameraId: 'CAM-03' },
  { id: 'area-4', name: 'Prasadam Distribution Counter', code: 'PRASADAM_AREA', currentCount: 95, capacity: 200, crowdLevel: 'LOW', occupancyPct: 47.5, cameraId: 'CAM-04' },
  { id: 'area-5', name: 'Exit Corridor & Shoe Stand', code: 'EXIT_AREA', currentCount: 45, capacity: 150, crowdLevel: 'LOW', occupancyPct: 30.0, cameraId: 'CAM-05' },
  { id: 'area-6', name: 'North & South Parking Lot', code: 'PARKING_AREA', currentCount: 190, capacity: 300, crowdLevel: 'MODERATE', occupancyPct: 63.3, cameraId: 'CAM-06' }
];

const Home = () => {
  const [crowdData, setCrowdData] = useState({
    summary: { totalVisitorsInside: 745, totalCapacity: 1480, overallOccupancyPct: 50.3, overallCrowdLevel: 'MODERATE' },
    areas: DEFAULT_AREAS
  });
  const [darshanTypes, setDarshanTypes] = useState([]);
  const [festivalMode, setFestivalMode] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [liveDevoteeCount, setLiveDevoteeCount] = useState(742);

  const heroSlides = [
    {
      image: '/assets/images/siddhivinayak_temple_facade.jpg',
      tag: 'Sacred Heritage • Mumbai',
      title: 'Plan your divine darshan at Shree Siddhivinayak Temple',
      desc: 'Book guaranteed darshan slots online, generate instant digital QR passes, check live crowd density across holding days, and eliminate waiting queues.',
      primaryAction: { text: 'Book Darshan Slot', link: '/darshan', icon: <CalendarCheck size={18} /> },
      secondaryAction: { text: 'Check Live Crowd', link: '/crowd', icon: <Eye size={18} /> }
    },
    {
      image: '/assets/images/siddhivinayak_idol_darshan.jpg',
      tag: 'Auspicious Garbhagriha Darshan',
      title: 'Experience the Divine Blessings of Lord Ganesha',
      desc: 'Special quick darshan tokens, senior citizen priority lanes, and Suprabhata Abhishekam ritual bookings with automated queue regulation.',
      primaryAction: { text: 'Quick Special Darshan', link: '/darshan', icon: <Ticket size={18} /> },
      secondaryAction: { text: 'Daily Ritual Timings', link: '/temple', icon: <Sun size={18} /> }
    },
    {
      image: '/assets/images/siddhivinayak_temple_night.jpg',
      tag: 'Grand Evening Aarti & Illumination',
      title: 'Maha Aarti & Night Devotion in Sacred Peace',
      desc: 'Real-time sanctum crowd monitoring, intelligent queue pacing, and 24/7 devotee helpline assistance.',
      primaryAction: { text: 'Check Live Crowd', link: '/crowd', icon: <Eye size={18} /> },
      secondaryAction: { text: 'Devotee Guidelines', link: '/temple', icon: <Moon size={18} /> }
    }
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [crowdRes, darshanRes, festRes] = await Promise.all([
          api.get('/crowd'),
          api.get('/darshan/types'),
          api.get('/crowd/festival-mode')
        ]);
        if (crowdRes && crowdRes.areas) setCrowdData(crowdRes);
        if (darshanRes && darshanRes.types) setDarshanTypes(darshanRes.types);
        else if (Array.isArray(darshanRes)) setDarshanTypes(darshanRes);
        if (festRes) setFestivalMode(festRes.festivalMode);
      } catch (err) {
        // Fallback default sample darshan types if backend not running
        setDarshanTypes([
          { id: '1', name: 'General Free Darshan', price: 0, approxDuration: '25-35 mins', description: 'Standard open queue pass with barcode gate validation.', quotaPerSlot: 150, availablePasses: 84 },
          { id: '2', name: 'Special VIP Fast-Track', price: 250, approxDuration: '10-15 mins', description: 'Priority lane corridor access directly to the Garbhagriha mandap.', quotaPerSlot: 60, availablePasses: 29 },
          { id: '3', name: 'Senior & Divyangjan Priority', price: 0, approxDuration: '10-15 mins', description: 'Dedicated assistance wheelchair and priority lane with zero stairs.', quotaPerSlot: 40, availablePasses: 22 },
          { id: '4', name: 'Suprabhata Abhishek Ritual', price: 500, approxDuration: '45 mins', description: 'Early morning holy water & panchamrit abhishekam with sacred chantings.', quotaPerSlot: 20, availablePasses: 5 }
        ]);
      }
    };
    fetchData();

    // Live realtime devotee count fluctuation simulation
    const interval = setInterval(() => {
      setLiveDevoteeCount(c => c + Math.floor((Math.random() - 0.48) * 6));
    }, 3500);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  return (
    <div className="public-home-page">
      <div className="container" style={{ padding: '1.5rem 1.25rem 3.5rem' }}>
        
        {/* Festival Alert Banner */}
        {festivalMode && (
          <div className="alert alert-warning" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '1.5rem', borderLeft: '4px solid #b45309' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Sparkles size={18} color="#b45309" />
              <span>
                <strong>Festival Mode Active: Maha Shivaratri Brahmotsavam</strong> — Extended Darshan hours active till 11:45 PM.
              </span>
            </div>
            <Link to="/darshan" className="btn btn-primary btn-sm" style={{ padding: '4px 12px' }}>
              Reserve Festival Slot
            </Link>
          </div>
        )}

        {/* HERO SECTION: SACRED SIDDHIVINAYAK PHOTO SLIDER CAROUSEL */}
        <section className="hero-slider-section" style={{ position: 'relative', width: '100%', height: '460px', borderRadius: '16px', overflow: 'hidden', marginBottom: '2rem', boxShadow: '0 10px 25px -3px rgba(0,0,0,0.1), 0 8px 25px -4px rgba(217, 119, 6, 0.25)', background: '#0f172a' }}>
          {heroSlides.map((slide, index) => (
            <div
              key={index}
              style={{
                position: 'absolute',
                inset: 0,
                opacity: index === currentSlide ? 1 : 0,
                visibility: index === currentSlide ? 'visible' : 'hidden',
                transition: 'opacity 0.8s ease-in-out, visibility 0.8s ease-in-out',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <img
                src={slide.image}
                alt={slide.title}
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transform: index === currentSlide ? 'scale(1)' : 'scale(1.04)',
                  transition: 'transform 6s ease-out'
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(90deg, rgba(15, 23, 42, 0.88) 0%, rgba(15, 23, 42, 0.65) 50%, rgba(15, 23, 42, 0.35) 100%)',
                  zIndex: 1
                }}
              />
              <div className="hero-slide-content" style={{ position: 'relative', zIndex: 2, maxWidth: '680px', padding: '2.5rem 3rem', color: '#ffffff' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(245, 158, 11, 0.2)', border: '1px solid rgba(245, 158, 11, 0.5)', color: '#fbbf24', padding: '6px 14px', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: 700, marginBottom: '1rem', backdropFilter: 'blur(4px)' }}>
                  <Sparkles size={14} /> {slide.tag}
                </span>
                <h1 className="hero-slide-title" style={{ fontSize: '2.25rem', fontWeight: 800, lineHeight: 1.2, color: '#ffffff', marginBottom: '0.85rem' }}>
                  {slide.title}
                </h1>
                <p className="hero-slide-desc" style={{ fontSize: '1.05rem', color: '#e2e8f0', lineHeight: 1.6, marginBottom: '1.75rem' }}>
                  {slide.desc}
                </p>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <Link to={slide.primaryAction.link} className="btn btn-primary btn-lg" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {slide.primaryAction.icon}
                    <span>{slide.primaryAction.text}</span>
                  </Link>
                  <Link to={slide.secondaryAction.link} className="btn btn-secondary btn-lg" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.9)' }}>
                    {slide.secondaryAction.icon}
                    <span>{slide.secondaryAction.text}</span>
                  </Link>
                </div>
              </div>
            </div>
          ))}

          <button
            onClick={() => setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)}
            style={{ position: 'absolute', top: '50%', left: '16px', transform: 'translateY(-50%)', zIndex: 10, background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', width: '42px', height: '42px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', backdropFilter: 'blur(4px)' }}
          >
            <ChevronLeft size={22} />
          </button>
          <button
            onClick={() => setCurrentSlide((prev) => (prev + 1) % heroSlides.length)}
            style={{ position: 'absolute', top: '50%', right: '16px', transform: 'translateY(-50%)', zIndex: 10, background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', width: '42px', height: '42px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', backdropFilter: 'blur(4px)' }}
          >
            <ChevronRight size={22} />
          </button>

          {/* Indicators */}
          <div style={{ position: 'absolute', bottom: '16px', left: '50%', transform: 'translateX(-50%)', zIndex: 10, display: 'flex', gap: '8px' }}>
            {heroSlides.map((_, i) => (
              <div
                key={i}
                onClick={() => setCurrentSlide(i)}
                style={{
                  width: i === currentSlide ? '32px' : '8px',
                  height: '8px',
                  borderRadius: '4px',
                  background: i === currentSlide ? '#f59e0b' : 'rgba(255,255,255,0.4)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              />
            ))}
          </div>
        </section>

        {/* 4-COLUMN REAL-TIME TEMPLE METRICS GRID */}
        <div className="grid-4" style={{ marginBottom: '2.5rem' }}>
          <div className="card card-gold-trim" style={{ padding: '1.4rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Active Temple Occupancy</div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginTop: '2px', fontFamily: 'Outfit, sans-serif' }}>
                  {liveDevoteeCount} <span style={{ fontSize: '0.82rem', fontWeight: 500, color: '#64748b' }}>devotees</span>
                </div>
              </div>
              <StatusBadge status={crowdData?.summary?.overallCrowdLevel || 'MODERATE'} />
            </div>
            <div style={{ width: '100%', background: '#f1e5d1', height: '7px', borderRadius: '4px', margin: '12px 0 6px', overflow: 'hidden' }}>
              <div style={{ width: `${Math.min(100, Math.round((liveDevoteeCount / 1200) * 100))}%`, height: '100%', background: 'linear-gradient(90deg, #10b981, #f59e0b, #ea580c)' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', color: '#64748b', fontWeight: 500 }}>
              <span>Capacity: 1,200</span>
              <span style={{ fontWeight: 700, color: '#c2410c' }}>{Math.round((liveDevoteeCount / 1200) * 100)}% Saturation</span>
            </div>
          </div>

          <div className="card card-gold-trim" style={{ padding: '1.4rem' }}>
            <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Queue Waiting Time</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#166534', marginTop: '2px', fontFamily: 'Outfit, sans-serif' }}>
              12 - 16 <span style={{ fontSize: '0.82rem', fontWeight: 500, color: '#64748b' }}>mins</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#166534', marginTop: '10px', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 700 }}>
              <span className="pulse-dot" style={{ background: '#10b981', width: '7px', height: '7px' }} />
              Normal turnstile transit pace
            </div>
          </div>

          <div className="card card-gold-trim" style={{ padding: '1.4rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Temple Gate Timings</div>
              <span className="badge badge-low" style={{ fontSize: '0.68rem', padding: '1px 6px' }}>
                OPEN
              </span>
            </div>
            <div style={{ fontWeight: 800, fontSize: '1.35rem', color: '#0f172a', marginTop: '2px', fontFamily: 'Outfit, sans-serif' }}>
              05:00 AM - 10:30 PM
            </div>
            <p style={{ fontSize: '0.76rem', color: '#64748b', marginTop: '6px' }}>
              Maha Deeparadhana at <strong style={{ color: '#c2410c' }}>07:00 PM</strong>
            </p>
          </div>

          <div className="card card-gold-trim" style={{ padding: '1.4rem' }}>
            <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>24/7 Pilgrim Helpline</div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#b45309', marginTop: '2px', fontFamily: 'Outfit, sans-serif' }}>
              +91 98765 43210
            </div>
            <p style={{ fontSize: '0.76rem', color: '#64748b', marginTop: '6px' }}>
              Emergency First-Aid &amp; Assistance Desk
            </p>
          </div>
        </div>

        {/* 3D LIVING TEMPLE INTERACTIVE TOUR INVITATION BANNER */}
        <div 
          className="glass-card" 
          style={{ 
            marginBottom: '2.5rem', 
            padding: '1.75rem 2rem', 
            background: 'linear-gradient(135deg, rgba(6, 11, 24, 0.95) 0%, rgba(15, 23, 42, 0.92) 60%, rgba(69, 26, 3, 0.88) 100%)',
            border: '2px solid rgba(245, 158, 11, 0.35)',
            color: '#ffffff',
            boxShadow: '0 16px 36px rgba(6, 11, 24, 0.35)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.25rem' }}>
            <div style={{ maxWidth: '640px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{ background: 'rgba(245, 158, 11, 0.25)', border: '1px solid #f59e0b', color: '#fef08a', padding: '2px 10px', borderRadius: '12px', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  IMMERSIVE 3D WEBGL EXPERIENCE
                </span>
                <span className="pulse-dot" style={{ width: '7px', height: '7px', background: '#22c55e' }} />
              </div>
              <h2 style={{ fontSize: '1.5rem', color: '#ffffff', fontWeight: 800, marginBottom: '6px' }}>
                Explore the 3D Living Temple Sanctum &amp; Queue Simulation
              </h2>
              <p style={{ fontSize: '0.92rem', color: '#cbd5e1', lineHeight: 1.55, margin: 0 }}>
                Navigate our interactive 3D digital shrine diorama featuring active devotee paths, Garbhagriha Vedic ambiance, holy diya offerings, and day/sunset/night spiritual lighting cycles.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <Link to="/temple" className="btn btn-gold btn-lg" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Box size={18} />
                <span>Launch 3D Explorer</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Live Crowd Density Map Section */}
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
            <div>
              <h2 style={{ fontSize: '1.45rem', fontWeight: 800 }}>Real-Time Temple Area Crowd Density</h2>
              <p style={{ fontSize: '0.88rem', color: '#64748b' }}>Live area occupancy indicators for smooth darshan flow and queue regulation</p>
            </div>
            <Link to="/crowd" className="btn btn-secondary btn-sm" style={{ fontWeight: 700 }}>
              View Detailed Analytics &rarr;
            </Link>
          </div>

          <CrowdHeatmap areas={crowdData?.areas || []} />
        </div>

        {/* Available Darshan Categories */}
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{ marginBottom: '1.15rem' }}>
            <h2 style={{ fontSize: '1.45rem', fontWeight: 800 }}>Darshan Booking Categories</h2>
            <p style={{ fontSize: '0.88rem', color: '#64748b' }}>Select a darshan category to view quotas and proceed with slot reservation</p>
          </div>

          <div className="grid-2">
            {darshanTypes.map((dt) => (
              <div 
                key={dt.id} 
                className="card card-gold-trim" 
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  justifyContent: 'space-between',
                  background: 'var(--glass-bg)',
                  backdropFilter: 'var(--glass-blur)',
                  WebkitBackdropFilter: 'var(--glass-blur)',
                  border: '1px solid var(--glass-border)',
                  padding: '1.65rem'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.65rem' }}>
                    <h3 style={{ fontSize: '1.2rem', color: '#0f172a', fontWeight: 700 }}>{dt.name}</h3>
                    <span 
                      style={{ 
                        fontWeight: 800, 
                        color: dt.price === 0 ? '#166534' : '#c2410c', 
                        fontSize: '1.25rem',
                        background: dt.price === 0 ? '#ecfdf5' : '#fffbeb',
                        border: dt.price === 0 ? '1px solid #a7f3d0' : '1px solid #fde68a',
                        padding: '2px 10px',
                        borderRadius: '20px',
                        fontFamily: 'Outfit, sans-serif'
                      }}
                    >
                      {dt.price === 0 ? 'Free Pass' : `₹${dt.price}`}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.9rem', marginBottom: '1.15rem', lineHeight: 1.55, color: '#475569' }}>{dt.description}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', fontSize: '0.82rem', color: '#64748b', marginBottom: '1.25rem', background: 'rgba(254, 243, 199, 0.4)', padding: '9px 14px', borderRadius: '8px', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                    <span><strong>Duration:</strong> {dt.approxDuration}</span>
                    <span>
                      <strong style={{ color: dt.availablePasses > 0 ? (dt.price === 0 ? '#166534' : '#c2410c') : '#991b1b' }}>
                        {dt.price === 0 ? 'Free Passes Left:' : 'Passes Available:'} {dt.availablePasses ?? dt.quotaPerSlot}
                      </strong>
                    </span>
                  </div>
                </div>
                <Link 
                  to={`/user/book-darshan?type=${encodeURIComponent(dt.name)}`} 
                  className={dt.price === 0 ? 'btn btn-primary' : 'btn btn-gold'} 
                  style={{ width: '100%', fontSize: '0.95rem' }}
                >
                  {dt.price === 0 ? 'Book Guaranteed Free Pass' : 'Reserve Fast-Track Slot'}
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Essential Pilgrim Guidelines Banner */}
        <div 
          className="glass-card" 
          style={{ 
            background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 60%, #fff7ed 100%)', 
            borderColor: '#fde68a', 
            padding: '1.75rem',
            boxShadow: '0 8px 24px rgba(245, 158, 11, 0.12)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.75rem' }}>
            <ShieldCheck size={20} color="#b45309" />
            <h3 style={{ fontSize: '1.2rem', color: '#92400e', margin: 0, fontWeight: 700 }}>Sacred Visiting Guidelines &amp; Devotee Protocol</h3>
          </div>
          <ul style={{ paddingLeft: '1.25rem', fontSize: '0.9rem', color: '#78350f', lineHeight: 1.8 }}>
            <li>Pilgrims must arrive at the designated entry gate <strong>15 minutes before</strong> the scheduled booking time slot.</li>
            <li>Digital QR pass generated after booking must be presented on mobile or physical printout for barcode turnstile scan.</li>
            <li>Free footwear storage and purified drinking water stations are available across all queue holding bays.</li>
            <li>Traditional respectful dress code is encouraged inside the holy temple sanctum.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Home;
