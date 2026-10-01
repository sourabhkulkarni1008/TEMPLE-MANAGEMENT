import React from 'react';
import StatusBadge from './StatusBadge';
import { Users, Video, ArrowRight } from 'lucide-react';

const CrowdHeatmap = ({ areas = [], onAreaClick, selectedAreaId }) => {
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
  const entryArea = areas.find(a => a.code === 'MAIN_ENTRANCE') || areas[0];
  const queueArea = areas.find(a => a.code === 'QUEUE_AREA') || areas[1];
  const sanctumArea = areas.find(a => a.code === 'DARSHAN_HALL') || areas[2];
  const exitArea = areas.find(a => a.code === 'EXIT_AREA') || areas[4];
  const prasadArea = areas.find(a => a.code === 'PRASADAM_AREA') || areas[3];
  const parkArea = areas.find(a => a.code === 'PARKING_AREA') || areas[5];

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
          border: `2px solid ${isSelected ? '#b45309' : colors.border}`,
          borderRadius: '8px',
          padding: '1rem',
          cursor: onAreaClick ? 'pointer' : 'default',
          transition: 'all 0.15s ease',
          boxShadow: isSelected ? '0 0 0 2px rgba(180,83,9,0.3)' : 'none',
          minWidth: '170px'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
          <span style={{ fontWeight: 600, fontSize: '0.875rem', color: '#0f172a' }}>{area.name.split('&')[0]}</span>
          <StatusBadge status={area.crowdLevel} />
        </div>

        <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', margin: '0.4rem 0' }}>
          <span style={{ fontSize: '1.25rem', fontWeight: 700, color: colors.text }}>{area.currentCount}</span>
          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>/ {area.capacity} people</span>
        </div>

        {/* Occupancy Bar */}
        <div style={{ width: '100%', background: 'rgba(255,255,255,0.7)', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
          <div style={{ width: `${Math.min(100, area.occupancyPct)}%`, height: '100%', background: colors.bar, borderRadius: '3px' }} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.725rem', color: '#64748b', marginTop: '4px' }}>
          <span>Occupancy: {area.occupancyPct}%</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}><Video size={10} /> {area.cameraId || 'CAM'}</span>
        </div>
      </div>
    );
  };

  return (
    <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div>
          <h3 style={{ fontSize: '1.05rem', margin: 0 }}>Temple Flow &amp; Crowd Distribution Map</h3>
          <p style={{ fontSize: '0.825rem', margin: 0, color: '#64748b' }}>
            Linear pilgrim route progression from Entry Gate to Sanctum and Exit
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.775rem' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: 10, height: 10, background: '#16a34a', borderRadius: '50%' }}></span> Low (&lt;45%)
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: 10, height: 10, background: '#ca8a04', borderRadius: '50%' }}></span> Moderate (45-74%)
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: 10, height: 10, background: '#dc2626', borderRadius: '50%' }}></span> High (&ge;75%)
          </span>
        </div>
      </div>

      {/* Main Flow Sequential Chain */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', overflowX: 'auto', padding: '0.5rem 0 1rem' }}>
        {renderZoneCard(entryArea)}
        <ArrowRight size={20} color="#94a3b8" />
        {renderZoneCard(queueArea)}
        <ArrowRight size={20} color="#94a3b8" />
        {renderZoneCard(sanctumArea)}
        <ArrowRight size={20} color="#94a3b8" />
        {renderZoneCard(exitArea)}
      </div>

      {/* Auxiliary Zones (Prasadam & Parking) */}
      <div style={{ borderTop: '1px dashed #e2e8f0', paddingTop: '1rem', marginTop: '0.5rem' }}>
        <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b', marginBottom: '0.5rem' }}>
          AUXILIARY TEMPLE AMENITIES &amp; TRANSIT
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          {renderZoneCard(prasadArea)}
          {renderZoneCard(parkArea)}
        </div>
      </div>
    </div>
  );
};

export default CrowdHeatmap;
