import { db } from '../data/store.js';

/**
 * Get current live crowd status across all temple zones
 * GET /api/crowd
 */
export const getCrowdStatus = async (req, res, next) => {
  try {
    const areas = [...db.data.templeAreas];

    const totalCapacity = areas.reduce((acc, a) => acc + a.capacity, 0);
    const totalCurrentCount = areas.reduce((acc, a) => acc + a.currentCount, 0);
    const overallOccupancy = totalCapacity > 0 ? parseFloat(((totalCurrentCount / totalCapacity) * 100).toFixed(1)) : 0;

    let overallLevel = 'LOW';
    if (overallOccupancy >= 75) overallLevel = 'HIGH';
    else if (overallOccupancy >= 45) overallLevel = 'MODERATE';

    res.json({
      success: true,
      summary: {
        totalVisitorsInside: totalCurrentCount,
        totalCapacity,
        overallOccupancyPct: overallOccupancy,
        overallCrowdLevel: overallLevel,
        isDemoMode: db.data.settings.cameraStreamSimulated !== false,
        lastUpdated: new Date().toISOString()
      },
      areas
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get specific area crowd details
 * GET /api/crowd/:area
 */
export const getAreaCrowd = async (req, res, next) => {
  try {
    const { area } = req.params;
    const target = db.findOne('templeAreas', a =>
      a.id === area || a.code.toLowerCase() === area.toLowerCase() || a.name.toLowerCase().includes(area.toLowerCase())
    );

    if (!target) {
      return res.status(404).json({ success: false, message: 'Temple area not found.' });
    }

    // Get recent logs for this area
    const logs = db.find('crowdLogs', l => l.areaId === target.id).slice(0, 15);

    res.json({
      success: true,
      area: target,
      recentLogs: logs
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Update crowd data (Invoked by Python AI YOLO service or Admin/Sensors)
 * POST /api/crowd/update
 */
export const updateCrowd = async (req, res, next) => {
  try {
    const { area, people_count, peopleCount, source = 'YOLO_AI_SERVICE', deviceId = 'CAM-01' } = req.body;

    const count = people_count !== undefined ? people_count : peopleCount;
    if (area === undefined || count === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Area identifier and people count are required.'
      });
    }

    const updated = db.updateAreaCrowd(area, count, source, deviceId);
    if (!updated) {
      return res.status(404).json({
        success: false,
        message: `Area '${area}' not found in temple database.`
      });
    }

    res.json({
      success: true,
      message: `Crowd count updated for ${updated.name}`,
      data: {
        area: updated.name,
        code: updated.code,
        people_count: updated.currentCount,
        capacity: updated.capacity,
        occupancy: updated.occupancyPct,
        crowd_level: updated.crowdLevel
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Trigger dynamic Demo Crowd fluctuation (for live college project evaluation)
 * POST /api/crowd/demo-tick
 */
export const simulateCrowdTick = async (req, res, next) => {
  try {
    const areas = db.data.templeAreas;
    areas.forEach(a => {
      // Fluctuate count by +/- 5% to 15%
      const delta = Math.floor((Math.random() - 0.48) * (a.capacity * 0.1));
      const newCount = Math.max(10, Math.min(a.capacity, a.currentCount + delta));
      db.updateAreaCrowd(a.id, newCount, 'DEMO_SIMULATION', a.cameraId);
    });

    res.json({
      success: true,
      message: 'Demo crowd variation simulated across all zones.',
      areas: db.data.templeAreas
    });
  } catch (err) {
    next(err);
  }
};
