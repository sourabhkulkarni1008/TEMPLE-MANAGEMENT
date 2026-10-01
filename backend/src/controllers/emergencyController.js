import { db } from '../data/store.js';

/**
 * Report an Emergency (Pilgrim / Public)
 * POST /api/emergency
 */
export const reportEmergency = async (req, res, next) => {
  try {
    const { emergencyType, area, description, reporterName, reporterPhone } = req.body;

    if (!emergencyType || !area || !description) {
      return res.status(400).json({
        success: false,
        message: 'Emergency type, area, and description are required.'
      });
    }

    const userId = req.user ? req.user.id : null;
    const name = reporterName || (req.user ? req.user.name : 'Anonymous Pilgrim');
    const phone = reporterPhone || (req.user ? req.user.phone : '+91 90000 00000');

    const newReport = db.insert('emergencies', {
      userId,
      reporterName: name,
      reporterPhone: phone,
      emergencyType,
      area,
      description,
      status: 'PENDING',
      assignedStaffId: null,
      resolutionNotes: null,
      createdAt: new Date().toISOString(),
      resolvedAt: null
    });

    // Create high priority notification for staff and admin
    db.insert('notifications', {
      userId: null,
      title: `EMERGENCY ALERT: ${emergencyType} in ${area}`,
      message: `Reported by ${name} (${phone}): ${description}`,
      type: 'EMERGENCY',
      readStatus: false
    });

    res.status(201).json({
      success: true,
      message: 'Emergency alert dispatched to ground response team.',
      emergency: newReport
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get list of emergency reports
 * GET /api/emergency
 */
export const getEmergencies = async (req, res, next) => {
  try {
    const { status, type, area } = req.query;
    let list = [...db.data.emergencies];

    // Pilgrim can only see their own emergencies unless staff/admin
    if (req.user.role === 'PILGRIM') {
      list = list.filter(e => e.userId === req.user.id);
    } else {
      if (status) list = list.filter(e => e.status === status);
      if (type) list = list.filter(e => e.emergencyType.toLowerCase() === type.toLowerCase());
      if (area) list = list.filter(e => e.area.toLowerCase().includes(area.toLowerCase()));
    }

    // Sort newest first
    list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({
      success: true,
      total: list.length,
      emergencies: list
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Update emergency status (Staff / Admin)
 * PUT /api/emergency/:id
 */
export const updateEmergencyStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, assignedStaffId, resolutionNotes } = req.body;

    const report = db.findById('emergencies', id);
    if (!report) {
      return res.status(404).json({ success: false, message: 'Emergency report not found.' });
    }

    const updates = {};
    if (status) updates.status = status;
    if (assignedStaffId !== undefined) updates.assignedStaffId = assignedStaffId;
    if (resolutionNotes) updates.resolutionNotes = resolutionNotes;
    if (status === 'RESOLVED') {
      updates.resolvedAt = new Date().toISOString();
    }

    const updated = db.update('emergencies', id, updates);

    // Notify pilgrim if user was attached
    if (report.userId) {
      db.insert('notifications', {
        userId: report.userId,
        title: `Emergency Update: ${report.emergencyType}`,
        message: `Status updated to ${status}${resolutionNotes ? `. Notes: ${resolutionNotes}` : ''}`,
        type: 'INFO',
        readStatus: false
      });
    }

    res.json({
      success: true,
      message: `Emergency status updated to ${status}.`,
      emergency: updated
    });
  } catch (err) {
    next(err);
  }
};
