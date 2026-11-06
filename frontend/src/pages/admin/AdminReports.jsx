import React, { useState, useEffect } from 'react';
import api, { API_BASE_URL } from '../../api/client';
import { FileText, Download, Calendar, TrendingUp, Users, Shield, RefreshCw } from 'lucide-react';

const AdminReports = () => {
  const [reportType, setReportType] = useState('daily');
  const [dailyData, setDailyData] = useState(null);
  const [weeklyData, setWeeklyData] = useState(null);
  const [monthlyData, setMonthlyData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const [dRes, wRes, mRes] = await Promise.all([
          api.get('/reports/daily'),
          api.get('/reports/weekly'),
          api.get('/reports/monthly')
        ]);
        if (dRes.success) setDailyData(dRes);
        if (wRes.success) setWeeklyData(wRes);
        if (mRes.success) setMonthlyData(mRes);
      } catch (err) {
        console.warn('Reports load failed:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  const handleExportCsv = (type = 'bookings') => {
    window.open(`${API_BASE_URL}/reports/export-csv?type=${type}`, '_blank');
  };

  return (
    <div className="dashboard-layout">
      <div className="dashboard-content" style={{ padding: '1.5rem 1rem' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.75rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
              <span style={{ 
                display: 'inline-flex', 
                background: 'rgba(217, 119, 6, 0.15)', 
                color: '#d97706', 
                padding: '8px', 
                borderRadius: '50%',
                border: '1px solid rgba(217, 119, 6, 0.3)'
              }}>
                <FileText size={24} />
              </span>
              <h1 className="temple-gradient-text" style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0 }}>
                Operational Analytics &amp; Compliance Reports
              </h1>
            </div>
            <p style={{ fontSize: '0.9rem', color: '#64748b', margin: 0 }}>
              Audit visitor volumes, track zone crowd capacities, and export certified records for administrative reporting.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              onClick={() => handleExportCsv('bookings')} 
              className="btn btn-secondary btn-sm" 
              style={{ display: 'flex', alignItems: 'center', gap: '6px', borderRadius: '8px', fontWeight: 600, padding: '0.5rem 0.9rem' }}
            >
              <Download size={14} />
              <span>Export Bookings CSV</span>
            </button>
            <button 
              onClick={() => handleExportCsv('crowd')} 
              className="btn btn-primary btn-sm" 
              style={{ display: 'flex', alignItems: 'center', gap: '6px', borderRadius: '8px', fontWeight: 700, padding: '0.5rem 0.9rem', boxShadow: '0 4px 12px rgba(217, 119, 6, 0.25)' }}
            >
              <Download size={14} />
              <span>Export Crowd Logs CSV</span>
            </button>
          </div>
        </div>

        {/* Timeframe Selector Tabs */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '1.75rem', background: 'rgba(241, 245, 249, 0.8)', padding: '6px', borderRadius: '10px', width: 'fit-content', border: '1px solid rgba(226, 232, 240, 0.9)' }}>
          <button
            onClick={() => setReportType('daily')}
            className={`btn btn-sm ${reportType === 'daily' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ border: 'none', borderRadius: '8px', fontWeight: 600, padding: '0.45rem 1rem' }}
          >
            Daily Operations Report
          </button>
          <button
            onClick={() => setReportType('weekly')}
            className={`btn btn-sm ${reportType === 'weekly' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ border: 'none', borderRadius: '8px', fontWeight: 600, padding: '0.45rem 1rem' }}
          >
            Weekly Footfall Trend
          </button>
          <button
            onClick={() => setReportType('monthly')}
            className={`btn btn-sm ${reportType === 'monthly' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ border: 'none', borderRadius: '8px', fontWeight: 600, padding: '0.45rem 1rem' }}
          >
            Monthly Growth Summary
          </button>
        </div>

        {/* DAILY REPORT VIEW */}
        {reportType === 'daily' && dailyData && (
          <div>
            <div className="grid-3" style={{ gap: '1.25rem', marginBottom: '1.75rem' }}>
              <div className="card card-gold-trim glass-card" style={{ padding: '1.5rem', borderRadius: '14px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Today's Expected Pilgrims</span>
                <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#0f172a', margin: '4px 0' }}>
                  {dailyData.metrics?.totalPilgrimsExpectedToday}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#166534', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span className="pulse-dot" style={{ background: '#16a34a' }} />
                  {dailyData.metrics?.checkedInCount} verified check-ins completed
                </div>
              </div>

              <div className="card card-gold-trim glass-card" style={{ padding: '1.5rem', borderRadius: '14px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Ground Staff Allocation</span>
                <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#0f172a', margin: '4px 0' }}>
                  {dailyData.metrics?.activeStaffCount} Officers
                </div>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  Active across 6 key temple zones
                </div>
              </div>

              <div className="card card-gold-trim glass-card" style={{ padding: '1.5rem', borderRadius: '14px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Emergency Incidents</span>
                <div style={{ fontSize: '2.2rem', fontWeight: 900, color: dailyData.metrics?.openEmergenciesCount > 0 ? '#dc2626' : '#16a34a', margin: '4px 0' }}>
                  {dailyData.metrics?.openEmergenciesCount} Open
                </div>
                <div style={{ fontSize: '0.8rem', color: '#166534', fontWeight: 600 }}>
                  Response team dispatch latency &lt; 3 mins
                </div>
              </div>
            </div>

            {/* Zone Breakdown Table */}
            <div className="card card-gold-trim glass-card" style={{ padding: 0, overflow: 'hidden', borderRadius: '16px' }}>
              <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(226, 232, 240, 0.8)' }}>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Zone Occupancy &amp; Safe Limits Report
                </h2>
              </div>
              <div className="table-container" style={{ border: 'none', margin: 0 }}>
                <table className="table">
                  <thead>
                    <tr>
                      <th style={{ paddingLeft: '1.25rem' }}>Zone Sector Name</th>
                      <th>Current Headcount</th>
                      <th>Max Safe Capacity</th>
                      <th>Occupancy %</th>
                      <th style={{ paddingRight: '1.25rem' }}>Crowd Density Level</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dailyData.areaOccupancy?.map((ao, idx) => (
                      <tr key={idx}>
                        <td style={{ paddingLeft: '1.25rem' }}><strong>{ao.area}</strong></td>
                        <td style={{ fontWeight: 700 }}>{ao.count}</td>
                        <td>{ao.capacity}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '70px', background: 'rgba(226, 232, 240, 0.8)', height: '7px', borderRadius: '4px', overflow: 'hidden' }}>
                              <div style={{ width: `${Math.min(100, ao.occupancyPct)}%`, background: ao.occupancyPct >= 80 ? '#ef4444' : (ao.occupancyPct >= 50 ? '#f59e0b' : '#10b981'), height: '100%' }} />
                            </div>
                            <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>{ao.occupancyPct}%</span>
                          </div>
                        </td>
                        <td style={{ paddingRight: '1.25rem' }}>
                          <span className={`badge badge-${ao.level.toLowerCase()}`}>{ao.level}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* WEEKLY REPORT VIEW */}
        {reportType === 'weekly' && weeklyData && (
          <div className="card card-gold-trim glass-card" style={{ padding: 0, overflow: 'hidden', borderRadius: '16px' }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(226, 232, 240, 0.8)' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Weekly Footfall &amp; Waiting Time Trend ({weeklyData.timeframe})
              </h2>
            </div>
            <div className="table-container" style={{ border: 'none', margin: 0 }}>
              <table className="table">
                <thead>
                  <tr>
                    <th style={{ paddingLeft: '1.25rem' }}>Day of Week</th>
                    <th>Total Footfall</th>
                    <th>Confirmed Bookings</th>
                    <th style={{ paddingRight: '1.25rem' }}>Average Queue Wait</th>
                  </tr>
                </thead>
                <tbody>
                  {weeklyData.weeklyData?.map((w, idx) => (
                    <tr key={idx}>
                      <td style={{ paddingLeft: '1.25rem' }}><strong>{w.day}</strong></td>
                      <td style={{ fontWeight: 700 }}>{w.totalVisitors.toLocaleString()} pilgrims</td>
                      <td>{w.bookingsConfirmed} passes</td>
                      <td style={{ paddingRight: '1.25rem', fontWeight: 600, color: '#b45309' }}>{w.avgWaitTimeMins} minutes</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* MONTHLY REPORT VIEW */}
        {reportType === 'monthly' && monthlyData && (
          <div className="card card-gold-trim glass-card" style={{ padding: 0, overflow: 'hidden', borderRadius: '16px' }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(226, 232, 240, 0.8)' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Monthly Footfall &amp; Special Ritual Trends ({monthlyData.year})
              </h2>
            </div>
            <div className="table-container" style={{ border: 'none', margin: 0 }}>
              <table className="table">
                <thead>
                  <tr>
                    <th style={{ paddingLeft: '1.25rem' }}>Month</th>
                    <th>Total Pilgrims</th>
                    <th>Special / VIP Darshans</th>
                    <th style={{ paddingRight: '1.25rem' }}>Resolved Incidents</th>
                  </tr>
                </thead>
                <tbody>
                  {monthlyData.monthlyTrend?.map((m, idx) => (
                    <tr key={idx}>
                      <td style={{ paddingLeft: '1.25rem' }}><strong>{m.month}</strong></td>
                      <td style={{ fontWeight: 700 }}>{m.totalFootfall.toLocaleString()} pilgrims</td>
                      <td>{m.specialDarshans.toLocaleString()}</td>
                      <td style={{ paddingRight: '1.25rem', color: '#16a34a', fontWeight: 600 }}>{m.emergencyIncidents}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminReports;
