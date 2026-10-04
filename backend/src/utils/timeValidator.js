/**
 * Smart Temple Management & Pilgrim Flow System
 * Slot Time Validator for Gate QR Verification
 */

export function validateBookingSlotTime(bookingDate, slotTime, options = {}) {
  const { graceMinutesBefore = 15, graceMinutesAfter = 15 } = options;

  if (!bookingDate || !slotTime) {
    return {
      isValid: true,
      status: 'VALID',
      message: 'No time slot constraints defined.'
    };
  }

  const now = new Date();
  
  // Format local date YYYY-MM-DD
  const currentYear = now.getFullYear();
  const currentMonth = String(now.getMonth() + 1).padStart(2, '0');
  const currentDay = String(now.getDate()).padStart(2, '0');
  const todayDateStr = `${currentYear}-${currentMonth}-${currentDay}`;

  const targetDateStr = String(bookingDate).includes('T')
    ? String(bookingDate).split('T')[0]
    : String(bookingDate).trim();

  // 1. Date Check: Past Date
  if (targetDateStr < todayDateStr) {
    return {
      isValid: false,
      status: 'EXPIRED',
      code: 'DATE_PASSED',
      message: `Entry Denied: Booking date (${targetDateStr}) has passed. Pass is expired.`,
      targetDate: targetDateStr,
      slotTime
    };
  }

  // 2. Date Check: Future Date
  if (targetDateStr > todayDateStr) {
    return {
      isValid: false,
      status: 'TOO_EARLY',
      code: 'FUTURE_DATE',
      message: `Entry Denied: Pass is booked for a future date (${targetDateStr}, Slot: ${slotTime}). Devotee cannot enter before the scheduled date.`,
      targetDate: targetDateStr,
      slotTime
    };
  }

  // 3. Same Day: Parse Slot Times (e.g. "08:00 AM - 10:00 AM" or "14:00 - 16:00")
  const parts = slotTime.split('-').map(s => s.trim());
  if (parts.length < 2) {
    return {
      isValid: true,
      status: 'VALID',
      message: 'Single time slot format accepted.'
    };
  }

  const parseTimeStr = (tStr) => {
    const m = tStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
    if (!m) return null;
    let h = parseInt(m[1], 10);
    const min = parseInt(m[2], 10);
    const ampm = m[3] ? m[3].toUpperCase() : null;

    if (ampm === 'PM' && h < 12) h += 12;
    if (ampm === 'AM' && h === 12) h = 0;

    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, min, 0, 0);
    return d;
  };

  const startTime = parseTimeStr(parts[0]);
  const endTime = parseTimeStr(parts[1]);

  if (!startTime || !endTime) {
    return {
      isValid: true,
      status: 'VALID',
      message: 'Unparsed slot boundary accepted.'
    };
  }

  // Calculate Grace Windows
  const startGrace = new Date(startTime.getTime() - graceMinutesBefore * 60 * 1000);
  const endGrace = new Date(endTime.getTime() + graceMinutesAfter * 60 * 1000);

  if (now < startGrace) {
    const diffMinutes = Math.max(1, Math.round((startTime.getTime() - now.getTime()) / (60 * 1000)));
    const hrs = Math.floor(diffMinutes / 60);
    const mins = diffMinutes % 60;
    const remainingText = hrs > 0 ? `${hrs}h ${mins}m` : `${mins} min`;

    return {
      isValid: false,
      status: 'TOO_EARLY',
      code: 'SLOT_NOT_STARTED',
      message: `Entry Denied: Too early for booked slot (${slotTime}). Devotee's allocated slot opens at ${parts[0]} (in approx ${remainingText}).`,
      targetDate: targetDateStr,
      slotTime,
      startTime: startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      endTime: endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      minutesRemaining: diffMinutes
    };
  }

  if (now > endGrace) {
    return {
      isValid: false,
      status: 'EXPIRED',
      code: 'SLOT_EXPIRED',
      message: `Entry Denied: Booked slot (${slotTime}) has expired. Devotee missed their allotted darshan timing window.`,
      targetDate: targetDateStr,
      slotTime,
      startTime: startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      endTime: endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  }

  return {
    isValid: true,
    status: 'VALID',
    code: 'IN_SLOT',
    message: `QR Token verified successfully. Entry permitted for current slot (${slotTime}).`,
    targetDate: targetDateStr,
    slotTime,
    startTime: startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    endTime: endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };
}

/**
 * Generates the current active 2-hour slot formatted string
 */
export function getCurrentSlotString(now = new Date()) {
  const hour = now.getHours();
  // Round down to even hour
  const startHour = hour % 2 === 0 ? hour : hour - 1;
  const endHour = (startHour + 2) % 24;

  const formatH = (h) => {
    const ampm = h >= 12 ? 'PM' : 'AM';
    const displayH = h % 12 === 0 ? 12 : h % 12;
    return `${String(displayH).padStart(2, '0')}:00 ${ampm}`;
  };

  return `${formatH(startHour)} - ${formatH(endHour)}`;
}
