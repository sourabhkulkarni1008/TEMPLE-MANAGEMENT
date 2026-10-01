import { db } from '../data/store.js';

/**
 * Ingest live IoT sensor count (e.g. Ultrasonic / IR people counter / gate sensor)
 * POST /api/iot/crowd
 */
export const ingestIotCrowd = async (req, res, next) => {
  try {
    const { area, count, device_id = 'IOT-DEVICE-GENERIC' } = req.body;

    if (area === undefined || count === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Payload must contain "area" (string) and "count" (number).'
      });
    }

    const updated = db.updateAreaCrowd(area, count, 'IOT_SENSOR', device_id);

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: `Area '${area}' not found.`
      });
    }

    res.json({
      success: true,
      message: `IoT sensor data recorded for ${updated.name}`,
      data: {
        area: updated.name,
        count: updated.currentCount,
        occupancy: updated.occupancyPct,
        crowd_level: updated.crowdLevel,
        device_id
      }
    });
  } catch (err) {
    next(err);
  }
};
