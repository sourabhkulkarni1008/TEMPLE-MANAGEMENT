import { db } from '../data/store.js';

/**
 * Get all Darshan Types
 * GET /api/darshan/types
 */
export const getDarshanTypes = async (req, res, next) => {
  try {
    const typesWithAvailability = db.data.darshanTypes.map(dt => {
      const matchingSlots = db.data.darshanSlots.filter(s =>
        s.darshanType.toLowerCase().includes(dt.name.toLowerCase()) ||
        dt.name.toLowerCase().includes(s.darshanType.toLowerCase())
      );
      const totalCapacity = matchingSlots.length > 0
        ? matchingSlots.reduce((sum, s) => sum + (s.capacity || 0), 0)
        : (dt.quotaPerSlot * 6);
      const totalBooked = matchingSlots.reduce((sum, s) => sum + (s.bookedCount || 0), 0);
      const availablePasses = Math.max(0, totalCapacity - totalBooked);

      return {
        ...dt,
        totalCapacity,
        totalBooked,
        availablePasses,
        isFree: dt.price === 0
      };
    });

    res.json({
      success: true,
      types: typesWithAvailability
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get available Darshan Slots with date filtering
 * GET /api/darshan/slots
 */
export const getDarshanSlots = async (req, res, next) => {
  try {
    const { date, darshanType } = req.query;
    let slots = [...db.data.darshanSlots];

    if (date) {
      slots = slots.filter(s => s.slotDate === date);
    }
    if (darshanType) {
      slots = slots.filter(s => s.darshanType.toLowerCase().includes(darshanType.toLowerCase()));
    }

    res.json({
      success: true,
      total: slots.length,
      slots
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Create a new Darshan Slot (Admin only)
 * POST /api/darshan/slots
 */
export const createDarshanSlot = async (req, res, next) => {
  try {
    const { darshanType, slotDate, startTime, endTime, price = 0, capacity = 150 } = req.body;

    if (!darshanType || !slotDate || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: 'darshanType, slotDate, startTime, and endTime are required.'
      });
    }

    const slotId = `slot-${slotDate}-${Date.now().toString().slice(-4)}`;
    const newSlot = db.insert('darshanSlots', {
      id: slotId,
      darshanType,
      slotDate,
      startTime,
      endTime,
      price: parseFloat(price) || 0,
      capacity: parseInt(capacity, 10),
      bookedCount: 0,
      status: 'OPEN'
    });

    res.status(201).json({
      success: true,
      message: 'New Darshan slot created successfully.',
      slot: newSlot
    });
  } catch (err) {
    next(err);
  }
};
