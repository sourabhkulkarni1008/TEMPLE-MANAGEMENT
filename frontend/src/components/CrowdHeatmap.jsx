import React from 'react';
import StatusBadge from './StatusBadge';
import { Users, Video, ArrowRight } from 'lucide-react';

const DEFAULT_AREAS = [
  { id: 'area-1', name: 'Main Entrance & Security Gate', code: 'MAIN_ENTRANCE', currentCount: 110, capacity: 250, crowdLevel: 'LOW', occupancyPct: 44.0, cameraId: 'CAM-01' },
  { id: 'area-2', name: 'Queue Complex & Holding Bays', code: 'QUEUE_AREA', currentCount: 285, capacity: 350, crowdLevel: 'HIGH', occupancyPct: 81.4, cameraId: 'CAM-02' },
  { id: 'area-3', name: 'Main Sanctum / Darshan Hall', code: 'DARSHAN_HALL', currentCount: 105, capacity: 180, crowdLevel: 'MODERATE', occupancyPct: 58.3, cameraId: 'CAM-03' },
  { id: 'area-4', name: 'Prasadam Distribution Counter', code: 'PRASADAM_AREA', currentCount: 95, capacity: 200, crowdLevel: 'LOW', occupancyPct: 47.5, cameraId: 'CAM-04' },
  { id: 'area-5', name: 'Exit Corridor & Shoe Stand', code: 'EXIT_AREA', currentCount: 45, capacity: 150, crowdLevel: 'LOW', occupancyPct: 30.0, cameraId: 'CAM-05' },
  { id: 'area-6', name: 'North & South Parking Lot', code: 'PARKING_AREA', currentCount: 190, capacity: 300, crowdLevel: 'MODERATE', occupancyPct: 63.3, cameraId: 'CAM-06' }
];

const CrowdHeatmap = ({ areas = [], onAreaClick, selectedAreaId }) => {
  const effectiveAreas = (areas && areas.length > 0) ? areas : DEFAULT_AREAS;

  const getLevelColor = (level) => {
    switch (level) {
      case 'HIGH':
        return { bg: '#fee2e2', border: '#f87171', text: '#991b1b', bar: '#dc2626' };
      case 'MODERATE':
        return { bg: '#fef9c3', border: '#facc15', text: '#854d0e', bar: '#ca8a04' };
      default:
        return { bg: '#dcfce7', border: '#4ade80', text: '#166534', bar: '#16a34a' };
    }
  };

  // Find areas by key roles in the flow
  const entryArea = effectiveAreas.find(a => a.code === 'MAIN_ENTRANCE' || a.name?.toLowerCase().includes('entrance')) || effectiveAreas[0];
  const queueArea = effectiveAreas.find(a => a.code === 'QUEUE_AREA' || a.name?.toLowerCase().includes('queue') || a.name?.toLowerCase().includes('mandap')) || effectiveAreas[1];
  const sanctumArea = effectiveAreas.find(a => a.code === 'DARSHAN_HALL' || a.name?.toLowerCase().includes('sanctum') || a.name?.toLowerCase().includes('garbhagriha')) || effectiveAreas[2];
  const exitArea = effectiveAreas.find(a => a.code === 'EXIT_AREA' || a.name?.toLowerCase().includes('exit')) || effectiveAreas[4] || effectiveAreas[3];
  const prasadArea = effectiveAreas.find(a => a.code === 'PRASADAM_AREA' || a.name?.toLowerCase().includes('prasad')) || effectiveAreas[3];
  const parkArea = effectiveAreas.find(a => a.code === 'PARKING_AREA' || a.name?.toLowerCase().includes('park') || a.name?.toLowerCase().includes('parikrama')) || effectiveAreas[5];

  const renderZoneCard = (area) => {
    if (!area) return null;
    const colors = getLevelColor(area.crowdLevel);
    const isSelected = selectedAreaId === area.id;

    return (
      <div
        key={area.id}
        onClick={() => onAreaClick && onAreaClick(area)}
        style={{
          background: colors.bg,
          border: `2px solid ${isSelected ? '#ea580c' : colors.border}`,
          borderRadius: '12px',
          padding: '1.15rem',
          cursor: onAreaClick ? 'pointer' : 'default',
          transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
          boxShadow: isSelected ? '0 0 0 3px rgba(234, 88, 12, 0.25), 0 8px 20px rgba(0,0,0,0.06)' : '0 2px 8px rgba(15, 23, 42, 0.04)',
          minWidth: '185px',
          position: 'relative'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <span style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0f172a' }}>{area.name.split('&')[0]}</span>
          <StatusBadge status={area.crowdLevel} />
        </div>

        <div style={{ display: 'flex', alignItems: 'baseline', gap: '5px', margin: '0.5rem 0' }}>
          <span style={{ fontSize: '1.4rem', fontWeight: 800, color: colors.text, fontFamily: 'Outfit, sans-serif' }}>{area.currentCount}</span>
          <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>/ {area.capacity} devotees</span>
        </div>

        {/* Occupancy Bar */}
        <div style={{ width: '100%', background: 'rgba(255,255,255,0.85)', height: '7px', borderRadius: '4px', overflow: 'hidden', margin: '4px 0' }}>
          <div style={{ width: `${Math.min(100, area.occupancyPct)}%`, height: '100%', background: colors.bar, borderRadius: '4px' }} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', color: '#64748b', marginTop: '6px' }}>
          <span style={{ fontWeight: 600 }}>Occupancy: {area.occupancyPct}%</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#0284c7', fontWeight: 600 }}><Video size={11} /> {area.cameraId || 'CAM'}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="glass-card" style={{ padding: '1.4rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.15rem' }}>
        <div>
          <h3 style={{ fontSize: '1.12rem', margin: 0, fontWeight: 700, color: '#0f172a' }}>Temple Flow &amp; Crowd Distribution Map</h3>
          <p style={{ fontSize: '0.84rem', margin: '2px 0 0', color: '#64748b' }}>
            Linear pilgrim route progression from Entry Gate to Sanctum and Exit
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', fontSize: '0.76rem', background: '#f8f4ec', padding: '4px 10px', borderRadius: '20px', border: '1px solid #ede4d3' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 600, color: '#166534' }}>
            <span className="pulse-dot" style={{ width: 8, height: 8, background: '#16a34a' }}></span> Low (&lt;45%)
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 600, color: '#854d0e' }}>
            <span className="pulse-dot" style={{ width: 8, height: 8, background: '#ca8a04' }}></span> Moderate (45-74%)
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 600, color: '#991b1b' }}>
            <span className="pulse-dot" style={{ width: 8, height: 8, background: '#dc2626' }}></span> High (&ge;75%)
          </span>
        </div>
      </div>

      {/* Main Flow Sequential Chain */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', overflowX: 'auto', padding: '0.5rem 0 1.25rem' }}>
        {renderZoneCard(entryArea)}
        <ArrowRight size={22} color="#ca8a04" style={{ flexShrink: 0 }} />
        {renderZoneCard(queueArea)}
        <ArrowRight size={22} color="#ca8a04" style={{ flexShrink: 0 }} />
        {renderZoneCard(sanctumArea)}
        <ArrowRight size={22} color="#ca8a04" style={{ flexShrink: 0 }} />
        {renderZoneCard(exitArea)}
      </div>

      {/* Auxiliary Zones (Prasadam & Parking) */}
      <div style={{ borderTop: '1px dashed rgba(245, 158, 11, 0.25)', paddingTop: '1.15rem', marginTop: '0.5rem' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#c2410c', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.65rem' }}>
          AUXILIARY TEMPLE AMENITIES &amp; TRANSIT
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '1.15rem' }}>
          {renderZoneCard(prasadArea)}
          {renderZoneCard(parkArea)}
        </div>
      </div>
    </div>
  );
};

export default CrowdHeatmap;
