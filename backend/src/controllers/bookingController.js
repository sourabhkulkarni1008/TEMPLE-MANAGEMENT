import { db } from '../data/store.js';
import { generateBookingId, generateQrSecureToken } from '../utils/tokenHelper.js';
import { generateQrDataUrl, generateQrBuffer } from '../utils/qrGenerator.js';
import { sendEmail } from '../config/email.js';
import { emailTemplates } from '../utils/emailTemplates.js';

/**
 * Create a new Darshan Booking
 * POST /api/bookings
 */
export const createBooking = async (req, res, next) => {
  try {
    const {
      slotId,
      darshanType,
      bookingDate,
      slotTime,
      numberOfPeople = 1,
      primaryPilgrimName,
      primaryPilgrimPhone,
      primaryPilgrimIdProof,
      totalAmount = 0
    } = req.body;

    const userId = req.user ? req.user.id : 'usr-guest';
    const pilgrimName = primaryPilgrimName || (req.user ? req.user.name : 'Pilgrim');
    const pilgrimPhone = primaryPilgrimPhone || (req.user ? req.user.phone : '');
    const familyMembersList = Array.isArray(req.body.familyMembers) ? req.body.familyMembers : [];

    // Check user verification status if logged in user
    if (req.user && req.user.role === 'PILGRIM') {
      const userRecord = db.findById('users', req.user.id);
      if (userRecord && userRecord.isVerified === false) {
        return res.status(403).json({
          success: false,
          message: 'Email verification required. Please enter the 6-digit verification code sent to your email to complete booking.',
          requiresVerification: true
        });
      }
    }

    const finalUserId = (req.user && db.findById('users', req.user.id)) ? req.user.id : (db.data.users[0]?.id || 'usr-pilgrim-01');

    // Prevent duplicate and conflicting bookings for the same user on the same date and slot
    if (finalUserId && finalUserId !== 'usr-guest') {
      const conflicting = db.find('bookings', b =>
        b.userId === finalUserId &&
        b.bookingStatus === 'CONFIRMED' &&
        b.bookingDate === bookingDate &&
        (b.slotTime === slotTime || (slotId && b.slotId === slotId))
      );
      if (conflicting.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Conflicting booking detected: You already hold an active confirmed pass (${conflicting[0].id}) for ${bookingDate} (${slotTime}). Please choose another slot or manage your existing reservation.`
        });
      }
    }

    // Check slot availability and decrement free/paid quota
    let slot = null;
    if (slotId) {
      slot = db.findById('darshanSlots', slotId);
    }
    if (!slot && darshanType && bookingDate) {
      const candidates = db.find('darshanSlots', s =>
        s.slotDate === bookingDate &&
        (s.darshanType.toLowerCase().includes(darshanType.toLowerCase()) || darshanType.toLowerCase().includes(s.darshanType.toLowerCase()))
      );
      if (candidates.length > 0) {
        slot = candidates.find(s => !slotTime || `${s.startTime} - ${s.endTime}` === slotTime || slotTime.includes(s.startTime)) || candidates[0];
      }
    }

    if (slot) {
      const partySize = parseInt(numberOfPeople, 10);
      const remaining = Math.max(0, slot.capacity - slot.bookedCount);
      if (slot.bookedCount + partySize > slot.capacity) {
        return res.status(400).json({
          success: false,
          message: `Selected slot only has ${remaining} passes remaining. Requested party size: ${partySize}.`
        });
      }
      // Deduct available passes by incrementing slot booked count
      const updatedBooked = slot.bookedCount + partySize;
      db.update('darshanSlots', slot.id, {
        bookedCount: updatedBooked,
        status: updatedBooked >= slot.capacity ? 'FULL' : 'OPEN'
      });
    }
    const bookingCount = db.data.bookings.length + 135;
    const bookingId = generateBookingId(bookingCount);
    const qrToken = generateQrSecureToken(bookingId, finalUserId);

    const newBooking = db.insert('bookings', {
      id: bookingId,
      userId: finalUserId,
      slotId: slot ? slot.id : null,
      darshanType,
      bookingDate,
      slotTime,
      numberOfPeople: parseInt(numberOfPeople, 10),
      familyMembers: familyMembersList,
      primaryPilgrimName: pilgrimName,
      primaryPilgrimPhone: pilgrimPhone,
      primaryPilgrimIdProof: primaryPilgrimIdProof || null,
      totalAmount: parseFloat(totalAmount) || 0,
      paymentStatus: 'SUCCESSFUL',
      bookingStatus: 'CONFIRMED',
      qrToken,
      checkedInAt: null,
      checkedInBy: null,
      createdAt: new Date().toISOString()
    });

    // Generate QR Data URL for instant rendering on client & PNG Buffer for email
    const qrDataUrl = await generateQrDataUrl(newBooking.qrToken);
    const qrBuffer = await generateQrBuffer(newBooking.qrToken);

    // Dispatch Confirmation Email (prioritize devotee form email or account email)
    const userEmail = req.user ? req.user.email : null;
    const recipientEmail = req.body.primaryPilgrimEmail || userEmail;
    if (recipientEmail) {
      const attachments = [];
      if (qrBuffer) {
        attachments.push({
          filename: `${bookingId}-Gate-Pass-QR.png`,
          content: qrBuffer,
          contentType: 'image/png'
        });
      }
      sendEmail({
        to: recipientEmail,
        subject: `Darshan Booking Confirmed: ${bookingId} - Sri Siddhivinayak Temple`,
        html: emailTemplates.bookingConfirmation(newBooking),
        attachments
      });
    }

    // In-app Notification
    db.insert('notifications', {
      userId,
      title: 'Darshan Booking Confirmed',
      message: `Your booking ${bookingId} for ${darshanType} on ${bookingDate} is confirmed.`,
      type: 'BOOKING',
      readStatus: false
    });

    res.status(201).json({
      success: true,
      message: 'Darshan booking confirmed successfully.',
      booking: {
        ...newBooking,
        qrDataUrl
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get all bookings (Pilgrim gets own, Admin gets all with search/filter)
 * GET /api/bookings
 */
export const getBookings = async (req, res, next) => {
  try {
    const { date, status, darshanType, search, page = 1, limit = 20 } = req.query;
    let list = [];

    if (req.user.role === 'ADMIN' || req.user.role === 'STAFF') {
      list = [...db.data.bookings];
    } else {
      list = db.find('bookings', b => b.userId === req.user.id);
    }

    // Filters
    if (date) {
      list = list.filter(b => b.bookingDate === date);
    }
    if (status) {
      list = list.filter(b => b.bookingStatus === status);
    }
    if (darshanType) {
      list = list.filter(b => b.darshanType.toLowerCase().includes(darshanType.toLowerCase()));
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(b =>
        b.id.toLowerCase().includes(q) ||
        b.primaryPilgrimName.toLowerCase().includes(q) ||
        b.primaryPilgrimPhone.includes(q)
      );
    }

    // Sort latest first
    list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const total = list.length;
    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const paginated = list.slice(offset, offset + parseInt(limit, 10));

    res.json({
      success: true,
      total,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      bookings: paginated
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get Booking By ID with generated QR Code Data URL
 * GET /api/bookings/:id
 */
export const getBookingById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const booking = db.findById('bookings', id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found.'
      });
    }

    // Authorization check: Pilgrim can only view own booking
    if (req.user.role === 'PILGRIM' && booking.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this booking.'
      });
    }

    const qrDataUrl = await generateQrDataUrl(booking.qrToken);

    res.json({
      success: true,
      booking: {
        ...booking,
        qrDataUrl
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Cancel a Booking
 * DELETE /api/bookings/:id
 */
export const cancelBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const booking = db.findById('bookings', id);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    if (req.user.role === 'PILGRIM' && booking.userId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'You can only cancel your own bookings.' });
    }

    if (booking.bookingStatus === 'CHECKED_IN') {
      return res.status(400).json({ success: false, message: 'Completed / Checked-in bookings cannot be cancelled.' });
    }

    const updated = db.update('bookings', id, { bookingStatus: 'CANCELLED' });

    // Release slot capacity if slotId was tied
    if (booking.slotId) {
      const slot = db.findById('darshanSlots', booking.slotId);
      if (slot) {
        const newCount = Math.max(0, slot.bookedCount - booking.numberOfPeople);
        db.update('darshanSlots', slot.id, {
          bookedCount: newCount,
          status: newCount < slot.capacity ? 'OPEN' : 'FULL'
        });
      }
    }

    // Cancellation email
    const user = db.findById('users', booking.userId);
    if (user && user.email) {
      sendEmail({
        to: user.email,
        subject: `Darshan Booking Cancelled: ${booking.id}`,
        html: emailTemplates.bookingCancellation(booking)
      });
    }

    // In-app cancellation notification
    db.insert('notifications', {
      userId: booking.userId,
      title: 'Darshan Booking Cancelled',
      message: `Your booking ${booking.id} for ${booking.bookingDate} (${booking.slotTime}) has been cancelled and quota released.`,
      type: 'BOOKING',
      readStatus: false
    });

    res.json({
      success: true,
      message: 'Booking cancelled successfully.',
      booking: updated
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Reschedule a Confirmed Booking
 * PUT /api/bookings/:id/reschedule
 */
export const rescheduleBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { newDate, newSlotId, newSlotTime } = req.body;

    if (!newDate) {
      return res.status(400).json({ success: false, message: 'New darshan date is required for rescheduling.' });
    }

    const booking = db.findById('bookings', id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    if (req.user.role === 'PILGRIM' && booking.userId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'You can only reschedule your own bookings.' });
    }

    if (booking.bookingStatus !== 'CONFIRMED') {
      return res.status(400).json({
        success: false,
        message: `Only active Confirmed bookings can be rescheduled. Current status: ${booking.bookingStatus}.`
      });
    }

    // Check for conflicting booking for the same user on newDate & newSlotTime
    const partySize = parseInt(booking.numberOfPeople, 10) || 1;
    const resolvedSlotTime = newSlotTime || booking.slotTime;

    const conflict = db.find('bookings', b =>
      b.id !== booking.id &&
      b.userId === booking.userId &&
      b.bookingStatus === 'CONFIRMED' &&
      b.bookingDate === newDate &&
      b.slotTime === resolvedSlotTime
    );

    if (conflict.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Conflict detected: You already hold active booking ${conflict[0].id} for ${newDate} at ${resolvedSlotTime}.`
      });
    }

    // Find and validate target slot
    let targetSlot = null;
    if (newSlotId) {
      targetSlot = db.findById('darshanSlots', newSlotId);
    }
    if (!targetSlot) {
      const candidates = db.find('darshanSlots', s =>
        s.slotDate === newDate &&
        (s.darshanType.toLowerCase().includes(booking.darshanType.toLowerCase()) || booking.darshanType.toLowerCase().includes(s.darshanType.toLowerCase()))
      );
      if (candidates.length > 0) {
        targetSlot = candidates.find(s => !newSlotTime || `${s.startTime} - ${s.endTime}` === newSlotTime || newSlotTime.includes(s.startTime)) || candidates[0];
      }
    }

    if (targetSlot) {
      const remaining = Math.max(0, targetSlot.capacity - targetSlot.bookedCount);
      if (targetSlot.bookedCount + partySize > targetSlot.capacity) {
        return res.status(400).json({
          success: false,
          message: `The selected slot on ${newDate} only has ${remaining} passes remaining. Required: ${partySize}.`
        });
      }
    }

    // Release capacity from old slot
    if (booking.slotId) {
      const oldSlot = db.findById('darshanSlots', booking.slotId);
      if (oldSlot) {
        const releasedCount = Math.max(0, oldSlot.bookedCount - partySize);
        db.update('darshanSlots', oldSlot.id, {
          bookedCount: releasedCount,
          status: releasedCount < oldSlot.capacity ? 'OPEN' : 'FULL'
        });
      }
    }

    // Reserve capacity on new slot
    let finalSlotId = booking.slotId;
    let finalSlotTime = resolvedSlotTime;
    if (targetSlot) {
      const newBookedCount = targetSlot.bookedCount + partySize;
      db.update('darshanSlots', targetSlot.id, {
        bookedCount: newBookedCount,
        status: newBookedCount >= targetSlot.capacity ? 'FULL' : 'OPEN'
      });
      finalSlotId = targetSlot.id;
      finalSlotTime = `${targetSlot.startTime} - ${targetSlot.endTime}`;
    }

    // Generate superseding secure QR token so old physical pass cannot be scanned
    const newQrToken = generateQrSecureToken(booking.id, booking.userId);

    const updated = db.update('bookings', booking.id, {
      bookingDate: newDate,
      slotTime: finalSlotTime,
      slotId: finalSlotId,
      qrToken: newQrToken,
      rescheduledAt: new Date().toISOString()
    });

    const qrDataUrl = await generateQrDataUrl(newQrToken);
    const qrBuffer = await generateQrBuffer(newQrToken);

    // In-app Notification
    db.insert('notifications', {
      userId: booking.userId,
      title: 'Darshan Pass Rescheduled',
      message: `Your booking ${booking.id} has been successfully rescheduled to ${newDate} (${finalSlotTime}).`,
      type: 'BOOKING',
      readStatus: false
    });

    // Email Notification
    const user = db.findById('users', booking.userId);
    const recipientEmail = booking.primaryPilgrimEmail || (user ? user.email : null);
    if (recipientEmail) {
      const attachments = [];
      if (qrBuffer) {
        attachments.push({
          filename: `${booking.id}-Updated-Pass-QR.png`,
          content: qrBuffer,
          contentType: 'image/png'
        });
      }
      sendEmail({
        to: recipientEmail,
        subject: `Darshan Pass Rescheduled: ${booking.id} - ${newDate}`,
        html: emailTemplates.bookingRescheduled(updated),
        attachments
      });
    }

    res.json({
      success: true,
      message: `Booking successfully rescheduled to ${newDate} (${finalSlotTime}).`,
      booking: {
        ...updated,
        qrDataUrl
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Verify QR Token (Staff / Entry Gate Scanner)
 * POST /api/bookings/verify-qr
 */
export const verifyQr = async (req, res, next) => {
  try {
    const { qrToken, override } = req.body;
    if (!qrToken) {
      return res.status(400).json({
        success: false,
        message: 'QR Token string is required for verification.'
      });
    }

    const staffEmpCode = req.user ? (req.user.role === 'STAFF' ? (req.user.staffProfile?.employeeCode || req.user.name) : req.user.name) : 'GATE-SCANNER';
    const result = db.verifyAndCheckInQr(qrToken.trim(), staffEmpCode, Boolean(override));

    res.json({
      success: result.status === 'VALID',
      ...result
    });
  } catch (err) {
    next(err);
  }
};
