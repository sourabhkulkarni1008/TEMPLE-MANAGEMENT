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
      <div className="dashboard-content">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <h1 style={{ fontSize: '1.6rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText color="#b45309" /> Operational Analytics &amp; Compliance Reports
            </h1>
            <p style={{ fontSize: '0.9rem', color: '#64748b' }}>Generate visitor audit logs, slot utilization statistics, and downloadable CSV exports</p>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => handleExportCsv('bookings')} className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Download size={14} />
              <span>Export Bookings CSV</span>
            </button>
            <button onClick={() => handleExportCsv('crowd')} className="btn btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Download size={14} />
              <span>Export Crowd Logs CSV</span>
            </button>
          </div>
        </div>

        {/* Timeframe Selector Tabs */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '1.5rem', background: '#f1f5f9', padding: '4px', borderRadius: '6px', width: 'fit-content' }}>
          <button
            onClick={() => setReportType('daily')}
            className={`btn btn-sm ${reportType === 'daily' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ border: 'none' }}
          >
            Daily Operations Report
          </button>
          <button
            onClick={() => setReportType('weekly')}
            className={`btn btn-sm ${reportType === 'weekly' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ border: 'none' }}
          >
            Weekly Footfall Trend
          </button>
          <button
            onClick={() => setReportType('monthly')}
            className={`btn btn-sm ${reportType === 'monthly' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ border: 'none' }}
          >
            Monthly Growth Summary
          </button>
        </div>

        {/* DAILY REPORT VIEW */}
        {reportType === 'daily' && dailyData && (
          <div>
            <div className="grid-3" style={{ marginBottom: '1.5rem' }}>
              <div className="card" style={{ padding: '1.25rem' }}>
                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Today's Expected Pilgrims</span>
                <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#0f172a', marginTop: '4px' }}>
                  {dailyData.metrics?.totalPilgrimsExpectedToday}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#166534', marginTop: '4px' }}>
                  {dailyData.metrics?.checkedInCount} verified check-ins completed
                </div>
              </div>

              <div className="card" style={{ padding: '1.25rem' }}>
                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Ground Staff Allocation</span>
                <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#0f172a', marginTop: '4px' }}>
                  {dailyData.metrics?.activeStaffCount} Officers
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
                  Active across 6 zones
                </div>
              </div>

              <div className="card" style={{ padding: '1.25rem' }}>
                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Emergency Incident Metric</span>
                <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#0f172a', marginTop: '4px' }}>
                  {dailyData.metrics?.openEmergenciesCount} Open
                </div>
                <div style={{ fontSize: '0.75rem', color: '#166534', marginTop: '4px' }}>
                  Response team latency &lt; 3 mins
                </div>
              </div>
            </div>

            {/* Zone Breakdown Table */}
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Zone Occupancy &amp; Safe Limits Report</h2>
              </div>
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Zone Name</th>
                      <th>Headcount</th>
                      <th>Capacity</th>
                      <th>Occupancy %</th>
                      <th>Crowd Level</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dailyData.areaOccupancy?.map((ao, idx) => (
                      <tr key={idx}>
                        <td><strong>{ao.area}</strong></td>
                        <td>{ao.count}</td>
                        <td>{ao.capacity}</td>
                        <td>{ao.occupancyPct}%</td>
                        <td>
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
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Weekly Footfall &amp; Waiting Time Trend ({weeklyData.timeframe})</h2>
            </div>
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Day of Week</th>
                    <th>Total Footfall</th>
                    <th>Confirmed Bookings</th>
                    <th>Average Queue Wait</th>
                  </tr>
                </thead>
                <tbody>
                  {weeklyData.weeklyData?.map((w, idx) => (
                    <tr key={idx}>
                      <td><strong>{w.day}</strong></td>
                      <td>{w.totalVisitors.toLocaleString()} pilgrims</td>
                      <td>{w.bookingsConfirmed} passes</td>
                      <td>{w.avgWaitTimeMins} minutes</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* MONTHLY REPORT VIEW */}
        {reportType === 'monthly' && monthlyData && (
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Monthly Footfall &amp; Special Ritual Trends ({monthlyData.year})</h2>
            </div>
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Month</th>
                    <th>Total Pilgrims</th>
                    <th>Special / VIP Darshans</th>
                    <th>Resolved Incidents</th>
                  </tr>
                </thead>
                <tbody>
                  {monthlyData.monthlyTrend?.map((m, idx) => (
                    <tr key={idx}>
                      <td><strong>{m.month}</strong></td>
                      <td>{m.totalFootfall.toLocaleString()} pilgrims</td>
                      <td>{m.specialDarshans.toLocaleString()}</td>
                      <td>{m.emergencyIncidents}</td>
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
