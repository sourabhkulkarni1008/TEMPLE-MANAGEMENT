import React from 'react';
import { Clock, ShieldCheck, Car, Utensils, Info, Phone, MapPin } from 'lucide-react';

const TempleInfo = () => {
  return (
    <div className="main-content">
      <div className="container" style={{ maxWidth: '900px' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>Temple Information &amp; Guidelines</h1>
          <p style={{ fontSize: '0.95rem' }}>Official schedule, dress protocol, amenities, and visitor assistance guidelines</p>
        </div>

        {/* 1. Daily Timings */}
        <div className="card">
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={20} color="#b45309" />
              <h2 className="card-title">Temple Gate &amp; Pooja Schedule</h2>
            </div>
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
                  <td>05:00 AM - 05:45 AM</td>
                  <td>Morning awakening ritual and sacred holy chanting</td>
                </tr>
                <tr>
                  <td><strong>Morning General Darshan</strong></td>
                  <td>06:00 AM - 12:30 PM</td>
                  <td>Open queue access for all verified slot holders</td>
                </tr>
                <tr>
                  <td><strong>Madhyahna Pooja &amp; Break</strong></td>
                  <td>12:30 PM - 03:30 PM</td>
                  <td>Afternoon sanctum altar cleansing and offerings</td>
                </tr>
                <tr>
                  <td><strong>Evening Darshan</strong></td>
                  <td>04:00 PM - 07:00 PM</td>
                  <td>Unrestricted queue movement</td>
                </tr>
                <tr>
                  <td><strong>Maha Deeparadhana / Aarti</strong></td>
                  <td>07:00 PM - 07:45 PM</td>
                  <td>Grand evening camphor illumination</td>
                </tr>
                <tr>
                  <td><strong>Night Darshan &amp; Gate Closure</strong></td>
                  <td>08:00 PM - 10:30 PM</td>
                  <td>Final night prayers and temple gate shutdown</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* 2. Dress Code & Prohibited Items */}
        <div className="card">
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={20} color="#b45309" />
              <h2 className="card-title">Dress Code &amp; Discipline Guidelines</h2>
            </div>
          </div>
          <div className="grid-2">
            <div>
              <h4 style={{ fontSize: '0.95rem', marginBottom: '0.4rem', color: '#0f172a' }}>Recommended Attire</h4>
              <ul style={{ paddingLeft: '1.2rem', fontSize: '0.875rem', color: '#475569', lineHeight: 1.7 }}>
                <li><strong>Men:</strong> Dhoti with Kurta / Shirt, or traditional Pyjama Kurta.</li>
                <li><strong>Women:</strong> Saree, Half-saree, or Salwar Kameez with Dupatta.</li>
                <li>Western casuals (shorts, sleeveless tops) are strictly prohibited inside the sanctum.</li>
              </ul>
            </div>
            <div>
              <h4 style={{ fontSize: '0.95rem', marginBottom: '0.4rem', color: '#0f172a' }}>Prohibited Items</h4>
              <ul style={{ paddingLeft: '1.2rem', fontSize: '0.875rem', color: '#475569', lineHeight: 1.7 }}>
                <li>Mobile phones, professional cameras, and recording devices inside inner sanctum.</li>
                <li>Footwear (must be deposited at free shoe racks near Gate 1).</li>
                <li>Inflammable items, outside cooked meals, and tobacco products.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 3. Prasadam & Annadanam */}
        <div className="card">
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Utensils size={20} color="#b45309" />
              <h2 className="card-title">Prasadam &amp; Annadanam Counter</h2>
            </div>
          </div>
          <p style={{ fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '0.75rem' }}>
            Free blessed Annadanam meals are served continuously in the <strong>Annapurna Dining Hall</strong> from <strong>11:30 AM to 03:00 PM</strong> and <strong>07:30 PM to 09:30 PM</strong>.
          </p>
          <p style={{ fontSize: '0.9rem', lineHeight: 1.6 }}>
            Special traditional Laddus and Pulihora prasad counters are operational adjacent to the Exit Corridor (Bay 4).
          </p>
        </div>

        {/* 4. Parking & Transport Facilities */}
        <div className="card">
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Car size={20} color="#b45309" />
              <h2 className="card-title">Vehicle Parking &amp; Accessibility</h2>
            </div>
          </div>
          <div className="grid-2">
            <div>
              <h4 style={{ fontSize: '0.95rem', marginBottom: '0.4rem' }}>North &amp; South Parking</h4>
              <p style={{ fontSize: '0.875rem', color: '#475569', lineHeight: 1.6 }}>
                Capacity for 300+ four-wheelers and 500 two-wheelers. Real-time slot availability is tracked via smart barriers.
              </p>
            </div>
            <div>
              <h4 style={{ fontSize: '0.95rem', marginBottom: '0.4rem' }}>Senior Citizen Buggy Carts</h4>
              <p style={{ fontSize: '0.875rem', color: '#475569', lineHeight: 1.6 }}>
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
