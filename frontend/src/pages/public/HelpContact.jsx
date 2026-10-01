import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import { Phone, AlertTriangle, Search, Package, MapPin, Mail, CheckCircle2, AlertCircle } from 'lucide-react';

const HelpContact = () => {
  const [activeTab, setActiveTab] = useState('sos');
  const [sosForm, setSosForm] = useState({
    emergencyType: 'Medical',
    area: 'Queue Complex & Holding Bays',
    description: '',
    reporterName: '',
    reporterPhone: ''
  });
  const [sosSubmitted, setSosSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSosSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/emergency', sosForm);
      setSosSubmitted(true);
    } catch (err) {
      setError(err.message || 'Failed to dispatch SOS alert.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-content">
      <div className="container" style={{ maxWidth: '850px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>Pilgrim Assistance &amp; Help Desk</h1>
          <p style={{ fontSize: '0.95rem' }}>Emergency dispatch, lost items desk, and 24/7 helpline contacts</p>
        </div>

        {/* Tab Buttons */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
          <button
            onClick={() => setActiveTab('sos')}
            className={`btn btn-sm ${activeTab === 'sos' ? 'btn-danger' : 'btn-secondary'}`}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <AlertTriangle size={15} />
            <span>Emergency SOS Help</span>
          </button>
          <button
            onClick={() => setActiveTab('contacts')}
            className={`btn btn-sm ${activeTab === 'contacts' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Phone size={15} />
            <span>Temple Helplines</span>
          </button>
          <button
            onClick={() => setActiveTab('lostfound')}
            className={`btn btn-sm ${activeTab === 'lostfound' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Package size={15} />
            <span>Lost &amp; Found Assistance</span>
          </button>
        </div>

        {/* Tab 1: Emergency SOS Help */}
        {activeTab === 'sos' && (
          <div className="card" style={{ borderColor: '#fca5a5' }}>
            <div className="card-header" style={{ borderBottomColor: '#fee2e2' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle color="#dc2626" size={20} />
                <h2 className="card-title" style={{ color: '#991b1b' }}>Ground Emergency Dispatch</h2>
              </div>
            </div>

            {sosSubmitted ? (
              <div style={{ padding: '2rem', textAlign: 'center' }}>
                <CheckCircle2 color="#16a34a" size={42} style={{ marginBottom: '0.75rem' }} />
                <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Alert Dispatched to Ground Staff</h3>
                <p style={{ fontSize: '0.9rem', color: '#475569', maxWidth: '500px', margin: '0 auto 1.5rem' }}>
                  Our emergency response team stationed near <strong>{sosForm.area}</strong> has been notified with high priority. Please stay in your current location.
                </p>
                <button onClick={() => setSosSubmitted(false)} className="btn btn-secondary btn-sm">
                  Send Another Report
                </button>
              </div>
            ) : (
              <form onSubmit={handleSosSubmit}>
                {error && <div className="alert alert-danger">{error}</div>}

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Emergency Nature</label>
                    <select
                      className="form-select"
                      value={sosForm.emergencyType}
                      onChange={(e) => setSosForm({ ...sosForm, emergencyType: e.target.value })}
                    >
                      <option value="Medical">Medical (Dizziness / Injury / First Aid)</option>
                      <option value="Lost Person">Lost Person / Child Separation</option>
                      <option value="Security">Security / Suspicious Activity</option>
                      <option value="Crowd Surge">Crowd Surge / Bottleneck Alarm</option>
                      <option value="Other">Other Urgent Assistance</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Current Temple Location</label>
                    <select
                      className="form-select"
                      value={sosForm.area}
                      onChange={(e) => setSosForm({ ...sosForm, area: e.target.value })}
                    >
                      <option value="Main Entrance & Security Gate">Main Entrance & Security Gate</option>
                      <option value="Queue Complex & Holding Bays">Queue Complex & Holding Bays</option>
                      <option value="Main Sanctum / Darshan Hall">Main Sanctum / Darshan Hall</option>
                      <option value="Prasadam Distribution Counter">Prasadam Distribution Counter</option>
                      <option value="Exit Corridor & Shoe Stand">Exit Corridor & Shoe Stand</option>
                      <option value="North & South Parking Lot">North & South Parking Lot</option>
                    </select>
                  </div>
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Your Name</label>
                    <input
                      type="text"
                      className="form-input"
                      required
                      placeholder="e.g. Suresh"
                      value={sosForm.reporterName}
                      onChange={(e) => setSosForm({ ...sosForm, reporterName: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Contact Phone</label>
                    <input
                      type="tel"
                      className="form-input"
                      required
                      placeholder="+91 98765 43210"
                      value={sosForm.reporterPhone}
                      onChange={(e) => setSosForm({ ...sosForm, reporterPhone: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Situation Description / Immediate Needs</label>
                  <textarea
                    className="form-textarea"
                    required
                    placeholder="Briefly describe what happened and your exact landmark (e.g. Near Holding Bay 3 pillar 12)..."
                    value={sosForm.description}
                    onChange={(e) => setSosForm({ ...sosForm, description: e.target.value })}
                  />
                </div>

                <button type="submit" className="btn btn-danger btn-lg" style={{ width: '100%' }} disabled={loading}>
                  {loading ? 'Transmitting Alert...' : 'Dispatch Emergency SOS Now'}
                </button>
              </form>
            )}
          </div>
        )}

        {/* Tab 2: Helpline Contacts */}
        {activeTab === 'contacts' && (
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Direct Helplines &amp; Emergency Desks</h2>
            </div>
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Department</th>
                    <th>Phone Number</th>
                    <th>Availability</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Central Control Room &amp; SOS</strong></td>
                    <td style={{ color: '#dc2626', fontWeight: 600 }}>+91 98765 43210 / 108</td>
                    <td>24 Hours Continuous</td>
                  </tr>
                  <tr>
                    <td><strong>Temple First-Aid Medical Unit</strong></td>
                    <td style={{ fontWeight: 600 }}>+91 98765 43211</td>
                    <td>05:00 AM - 11:00 PM</td>
                  </tr>
                  <tr>
                    <td><strong>Pilgrim Information &amp; Bookings</strong></td>
                    <td style={{ fontWeight: 600 }}>+91 98765 43212</td>
                    <td>06:00 AM - 09:00 PM</td>
                  </tr>
                  <tr>
                    <td><strong>Security &amp; Lost &amp; Found Office</strong></td>
                    <td style={{ fontWeight: 600 }}>+91 98765 43213</td>
                    <td>24 Hours</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Lost & Found Guidance */}
        {activeTab === 'lostfound' && (
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Lost &amp; Found Protocol</h2>
            </div>
            <p style={{ fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1rem' }}>
              If you have misplaced an item or found unattended belongings within the temple premises, please report immediately to the <strong>Security Help Desk (Near Gate 1)</strong> or use your pilgrim account to submit a ticket.
            </p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <Link to="/user/lost-found" className="btn btn-primary btn-sm">
                Submit Online Lost Property Report
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HelpContact;
