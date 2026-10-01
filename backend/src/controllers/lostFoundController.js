import { db } from '../data/store.js';

/**
 * Get Lost & Found items
 * GET /api/lost-found
 */
export const getLostFoundItems = async (req, res, next) => {
  try {
    const { status, category, area } = req.query;
    let list = [...db.data.lostFound];

    if (status) list = list.filter(i => i.status === status);
    if (category) list = list.filter(i => i.category.toLowerCase() === category.toLowerCase());
    if (area) list = list.filter(i => i.area.toLowerCase().includes(area.toLowerCase()));

    // Sort newest first
    list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({
      success: true,
      total: list.length,
      items: list
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Report a Lost/Found Item
 * POST /api/lost-found
 */
export const reportLostFoundItem = async (req, res, next) => {
  try {
    const { itemName, category = 'Other', description, area, contactPhone, imageUrl } = req.body;

    if (!itemName || !description || !area || !contactPhone) {
      return res.status(400).json({
        success: false,
        message: 'Item name, description, area, and contact phone are required.'
      });
    }

    const newItem = db.insert('lostFound', {
      userId: req.user ? req.user.id : null,
      itemName: itemName.trim(),
      category,
      description: description.trim(),
      area,
      contactPhone: contactPhone.trim(),
      status: 'REPORTED',
      reportedDate: new Date().toISOString().split('T')[0],
      imageUrl: imageUrl || null
    });

    res.status(201).json({
      success: true,
      message: 'Item report registered successfully with the Temple Help Desk.',
      item: newItem
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Update Lost & Found status (Staff / Admin)
 * PUT /api/lost-found/:id
 */
export const updateLostFoundStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const item = db.findById('lostFound', id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item record not found.' });
    }

    const updated = db.update('lostFound', id, { status });

    res.json({
      success: true,
      message: `Item status updated to ${status}.`,
      item: updated
    });
  } catch (err) {
    next(err);
  }
};
