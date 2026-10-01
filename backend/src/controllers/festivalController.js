import { db } from '../data/store.js';

/**
 * Get all Festivals
 * GET /api/festivals
 */
export const getFestivals = async (req, res, next) => {
  try {
    const { status } = req.query;
    let list = [...db.data.festivals];

    if (status) {
      list = list.filter(f => f.status === status);
    }

    res.json({
      success: true,
      festivals: list,
      activeFestivalCount: list.filter(f => f.status === 'ACTIVE').length
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Create a new Festival / Festival Mode (Admin)
 * POST /api/festivals
 */
export const createFestival = async (req, res, next) => {
  try {
    const {
      name,
      startDate,
      endDate,
      description,
      specialAnnouncement,
      extraStaffAllocated = 25,
      extendedDarshanHours = '04:00 AM - 11:30 PM',
      status = 'ACTIVE'
    } = req.body;

    if (!name || !startDate || !endDate || !description) {
      return res.status(400).json({
        success: false,
        message: 'Name, start date, end date, and description are required.'
      });
    }

    const newFest = db.insert('festivals', {
      name: name.trim(),
      startDate,
      endDate,
      description: description.trim(),
      specialAnnouncement: specialAnnouncement || null,
      extraStaffAllocated: parseInt(extraStaffAllocated, 10),
      extendedDarshanHours,
      status
    });

    if (status === 'ACTIVE') {
      db.update('settings', 'festivalModeActive', true);

      // Create global announcement
      db.insert('notifications', {
        userId: null,
        title: `Festival Schedule: ${name}`,
        message: specialAnnouncement || `Special darshan hours and festival arrangements are now active for ${name}.`,
        type: 'FESTIVAL',
        readStatus: false
      });
    }

    res.status(201).json({
      success: true,
      message: 'Festival created successfully.',
      festival: newFest
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Update Festival details (Admin)
 * PUT /api/festivals/:id
 */
export const updateFestival = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, startDate, endDate, description, specialAnnouncement, extraStaffAllocated, extendedDarshanHours, status } = req.body;

    const fest = db.findById('festivals', id);
    if (!fest) {
      return res.status(404).json({ success: false, message: 'Festival not found.' });
    }

    const updates = {};
    if (name) updates.name = name;
    if (startDate) updates.startDate = startDate;
    if (endDate) updates.endDate = endDate;
    if (description) updates.description = description;
    if (specialAnnouncement !== undefined) updates.specialAnnouncement = specialAnnouncement;
    if (extraStaffAllocated !== undefined) updates.extraStaffAllocated = parseInt(extraStaffAllocated, 10);
    if (extendedDarshanHours) updates.extendedDarshanHours = extendedDarshanHours;
    if (status) updates.status = status;

    const updated = db.update('festivals', id, updates);

    res.json({
      success: true,
      message: 'Festival updated successfully.',
      festival: updated
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Delete Festival (Admin)
 * DELETE /api/festivals/:id
 */
export const deleteFestival = async (req, res, next) => {
  try {
    const { id } = req.params;
    const fest = db.findById('festivals', id);
    if (!fest) {
      return res.status(404).json({ success: false, message: 'Festival not found.' });
    }

    db.delete('festivals', id);

    res.json({
      success: true,
      message: 'Festival deleted successfully.'
    });
  } catch (err) {
    next(err);
  }
};
