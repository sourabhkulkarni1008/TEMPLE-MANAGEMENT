import React, { useState } from 'react';
import { Clock, ShieldCheck, Car, Utensils, Info, Phone, MapPin, Box, Compass, Sparkles, Bell } from 'lucide-react';
import Temple3DViewer from '../../components/Temple3DViewer';

const TempleInfo = () => {
  const [selectedZone, setSelectedZone] = useState(null);

  return (
    <div className="main-content">
      <div className="container" style={{ maxWidth: '1000px' }}>
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ background: '#fef3c7', color: '#b45309', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700 }}>
              IMMERSIVE 3D EXPLORER
            </span>
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
            Shree Siddhivinayak Temple &amp; Sanctum Guide
          </h1>
          <p style={{ fontSize: '0.95rem', color: '#475569' }}>
            Interactive 3D diorama, sanctum schedule, dress protocol, amenities, and visitor assistance guidelines.
          </p>
        </div>

        {/* 3D Living Temple Interactive Complex Diorama */}
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Box size={20} color="#b45309" />
              <h2 style={{ fontSize: '1.3rem', fontWeight: 700, margin: 0 }}>Interactive 3D Temple Complex Tour</h2>
            </div>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
              Click on buildings &amp; gates to inspect real-time flow
            </span>
          </div>
          <Temple3DViewer
            height="480px"
            onSelectZone={zone => setSelectedZone(zone)}
          />
        </div>

        {/* 1. Daily Timings */}
        <div className="card card-gold-trim glass-card" style={{ marginBottom: '1.75rem', padding: '1.75rem' }}>
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={20} color="#c2410c" />
              <h2 className="card-title">Temple Gate &amp; Pooja Schedule</h2>
            </div>
            <span className="badge badge-low">Daily Schedule</span>
          </div>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Ritual / Darshan</th>
                  <th>Timings</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Suprabhata Seva</strong></td>
                  <td><span className="temple-badge-gold">05:00 AM - 05:45 AM</span></td>
                  <td>Morning awakening ritual and sacred holy Vedic chantings</td>
                </tr>
                <tr>
                  <td><strong>Morning General Darshan</strong></td>
                  <td><span className="temple-badge-gold">06:00 AM - 12:30 PM</span></td>
                  <td>Open queue access for all verified digital slot holders</td>
                </tr>
                <tr>
                  <td><strong>Madhyahna Pooja &amp; Break</strong></td>
                  <td><span className="temple-badge-gold">12:30 PM - 03:30 PM</span></td>
                  <td>Afternoon sanctum altar cleansing and sacred offerings</td>
                </tr>
                <tr>
                  <td><strong>Evening Darshan</strong></td>
                  <td><span className="temple-badge-gold">04:00 PM - 07:00 PM</span></td>
                  <td>Smooth queue movement through holding bays</td>
                </tr>
                <tr>
                  <td><strong>Maha Deeparadhana / Aarti</strong></td>
                  <td><span className="temple-badge-gold" style={{ background: '#fef3c7', color: '#9a3412', fontWeight: 800 }}>07:00 PM - 07:45 PM</span></td>
                  <td>Grand evening camphor illumination &amp; brass bell chimes</td>
                </tr>
                <tr>
                  <td><strong>Night Darshan &amp; Gate Closure</strong></td>
                  <td><span className="temple-badge-gold">08:00 PM - 10:30 PM</span></td>
                  <td>Final night prayers and temple turnstile shutdown</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* 2. Dress Code & Prohibited Items */}
        <div className="card card-gold-trim glass-card" style={{ marginBottom: '1.75rem', padding: '1.75rem' }}>
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={20} color="#c2410c" />
              <h2 className="card-title">Dress Code &amp; Discipline Guidelines</h2>
            </div>
          </div>
          <div className="grid-2">
            <div style={{ background: 'rgba(254, 243, 199, 0.35)', padding: '1.25rem', borderRadius: '10px', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
              <h4 style={{ fontSize: '1rem', marginBottom: '0.5rem', color: '#0f172a', fontWeight: 700 }}>Recommended Attire</h4>
              <ul style={{ paddingLeft: '1.2rem', fontSize: '0.88rem', color: '#475569', lineHeight: 1.75 }}>
                <li><strong>Men:</strong> Dhoti with Kurta / Shirt, or traditional Pyjama Kurta.</li>
                <li><strong>Women:</strong> Saree, Half-saree, or Salwar Kameez with Dupatta.</li>
                <li>Western casuals (shorts, sleeveless tops) are strictly prohibited inside the sanctum.</li>
              </ul>
            </div>
            <div style={{ background: 'rgba(254, 242, 242, 0.5)', padding: '1.25rem', borderRadius: '10px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
              <h4 style={{ fontSize: '1rem', marginBottom: '0.5rem', color: '#991b1b', fontWeight: 700 }}>Prohibited Items</h4>
              <ul style={{ paddingLeft: '1.2rem', fontSize: '0.88rem', color: '#475569', lineHeight: 1.75 }}>
                <li>Mobile phones, professional cameras, and recording devices inside inner sanctum.</li>
                <li>Footwear (must be deposited at free shoe racks near Gate 1).</li>
                <li>Inflammable items, outside cooked meals, and tobacco products.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 3. Prasadam & Annadanam */}
        <div className="card card-gold-trim glass-card" style={{ marginBottom: '1.75rem', padding: '1.75rem' }}>
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Utensils size={20} color="#c2410c" />
              <h2 className="card-title">Prasadam &amp; Annadanam Counter</h2>
            </div>
          </div>
          <p style={{ fontSize: '0.92rem', lineHeight: 1.65, marginBottom: '0.85rem', color: '#475569' }}>
            Free blessed Annadanam meals are served continuously in the <strong style={{ color: '#0f172a' }}>Annapurna Dining Hall</strong> from <strong>11:30 AM to 03:00 PM</strong> and <strong>07:30 PM to 09:30 PM</strong>.
          </p>
          <p style={{ fontSize: '0.92rem', lineHeight: 1.65, color: '#475569', margin: 0 }}>
            Special traditional Modak, Ladoo and Pulihora prasad counters are operational adjacent to the Exit Corridor (Day 4).
          </p>
        </div>

        {/* 4. Parking & Transport Facilities */}
        <div className="card card-gold-trim glass-card" style={{ padding: '1.75rem' }}>
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Car size={20} color="#c2410c" />
              <h2 className="card-title">Vehicle Parking &amp; Accessibility</h2>
            </div>
          </div>
          <div className="grid-2">
            <div style={{ background: '#f8f4ec', padding: '1.25rem', borderRadius: '10px', border: '1px solid #ede4d3' }}>
              <h4 style={{ fontSize: '1rem', marginBottom: '0.5rem', fontWeight: 700, color: '#0f172a' }}>North &amp; South Parking</h4>
              <p style={{ fontSize: '0.88rem', color: '#475569', lineHeight: 1.65, margin: 0 }}>
                Capacity for 300+ four-wheelers and 500 two-wheelers. Real-time slot availability is tracked via smart barriers.
              </p>
            </div>
            <div style={{ background: '#f8f4ec', padding: '1.25rem', borderRadius: '10px', border: '1px solid #ede4d3' }}>
              <h4 style={{ fontSize: '1rem', marginBottom: '0.5rem', fontWeight: 700, color: '#0f172a' }}>Senior Citizen Buggy Carts</h4>
              <p style={{ fontSize: '0.88rem', color: '#475569', lineHeight: 1.65, margin: 0 }}>
                Complimentary battery-operated shuttle carts are stationed near Parking Lot A for elderly pilgrims and wheelchair users.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TempleInfo;
