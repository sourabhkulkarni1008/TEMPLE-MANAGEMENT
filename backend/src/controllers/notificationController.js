import { db } from '../data/store.js';

/**
 * Get notifications for current user (plus global broadcast notifications)
 * GET /api/notifications
 */
export const getNotifications = async (req, res, next) => {
  try {
    const userId = req.user ? req.user.id : null;
    let list = db.data.notifications.filter(n => n.userId === null || n.userId === userId);

    // Sort latest first
    list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const unreadCount = list.filter(n => !n.readStatus).length;

    res.json({
      success: true,
      unreadCount,
      notifications: list
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Mark notification as read
 * PUT /api/notifications/:id/read
 */
export const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const notif = db.findById('notifications', id);

    if (!notif) {
      return res.status(404).json({ success: false, message: 'Notification not found.' });
    }

    const updated = db.update('notifications', id, { readStatus: true });

    res.json({
      success: true,
      notification: updated
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Mark all notifications as read
 * POST /api/notifications/read-all
 */
export const markAllAsRead = async (req, res, next) => {
  try {
    const userId = req.user ? req.user.id : null;
    db.data.notifications.forEach(n => {
      if (n.userId === null || n.userId === userId) {
        n.readStatus = true;
      }
    });
    db.persist();

    res.json({
      success: true,
      message: 'All notifications marked as read.'
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Broadcast new announcement (Admin)
 * POST /api/notifications/broadcast
 */
export const broadcastNotification = async (req, res, next) => {
  try {
    const { title, message, type = 'INFO' } = req.body;
    if (!title || !message) {
      return res.status(400).json({ success: false, message: 'Title and message are required.' });
    }

    const notif = db.insert('notifications', {
      userId: null,
      title: title.trim(),
      message: message.trim(),
      type,
      readStatus: false
    });

    res.status(201).json({
      success: true,
      message: 'Broadcast notification sent to all pilgrims.',
      notification: notif
    });
  } catch (err) {
    next(err);
  }
};
