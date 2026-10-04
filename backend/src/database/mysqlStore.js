// ==========================================================
// SMART TEMPLE MANAGEMENT & PILGRIM FLOW SYSTEM
// MySQL Data Store – Dual-Layer (Memory Cache + MySQL Persistence)
// Seamless drop-in replacement with exact store.js API & db.data support
// ==========================================================

import { query, testConnection } from '../config/database.js';
import { validateBookingSlotTime } from '../utils/timeValidator.js';

// ── Table name mapping (collection → MySQL table) ─────────
const TABLE_MAP = {
  users: 'users',
  templeAreas: 'temple_areas',
  darshanTypes: 'darshan_types',
  darshanSlots: 'darshan_slots',
  bookings: 'bookings',
  staff: 'staff',
  queues: 'queues',
  festivals: 'festivals',
  emergencies: 'emergency_reports',
  lostFound: 'lost_found',
  notifications: 'notifications',
  crowdLogs: 'crowd_data_logs',
  settings: 'system_settings'
};

// ── Column name mapping (JS camelCase → MySQL snake_case) ──
const COLUMN_MAP = {
  passwordHash: 'password_hash',
  isVerified: 'is_verified',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  currentCount: 'current_count',
  crowdLevel: 'crowd_level',
  occupancyPct: 'occupancy_pct',
  cameraId: 'camera_id',
  basePrice: 'base_price',
  defaultCapacity: 'default_capacity',
  quotaPerSlot: 'default_capacity',
  darshanType: 'darshan_type',
  slotDate: 'slot_date',
  startTime: 'start_time',
  endTime: 'end_time',
  bookedCount: 'booked_count',
  userId: 'user_id',
  slotId: 'slot_id',
  bookingDate: 'booking_date',
  slotTime: 'slot_time',
  numberOfPeople: 'number_of_people',
  primaryPilgrimName: 'primary_pilgrim_name',
  primaryPilgrimPhone: 'primary_pilgrim_phone',
  primaryPilgrimIdProof: 'primary_pilgrim_id_proof',
  totalAmount: 'total_amount',
  paymentStatus: 'payment_status',
  bookingStatus: 'booking_status',
  qrToken: 'qr_token',
  checkedInAt: 'checked_in_at',
  checkedInBy: 'checked_in_by',
  overrideUsed: 'override_used',
  employeeCode: 'employee_code',
  assignedArea: 'assigned_area',
  areaId: 'area_id',
  areaName: 'area_name',
  currentServingToken: 'current_serving_token',
  waitingCount: 'waiting_count',
  estimatedWaitTimeMins: 'estimated_wait_time_mins',
  highCrowdWarning: 'high_crowd_warning',
  reporterName: 'reporter_name',
  reporterPhone: 'reporter_phone',
  emergencyType: 'emergency_type',
  assignedStaffId: 'assigned_staff_id',
  resolutionNotes: 'resolution_notes',
  resolvedAt: 'resolved_at',
  itemName: 'item_name',
  contactPhone: 'contact_phone',
  reportedDate: 'reported_date',
  imageUrl: 'image_url',
  startDate: 'start_date',
  endDate: 'end_date',
  specialAnnouncement: 'special_announcement',
  extraStaffAllocated: 'extra_staff_allocated',
  extendedDarshanHours: 'extended_darshan_hours',
  readStatus: 'read_status',
  peopleCount: 'people_count',
  deviceId: 'device_id',
  settingKey: 'setting_key',
  settingValue: 'setting_value'
};

const REVERSE_COLUMN_MAP = {};
for (const [camel, snake] of Object.entries(COLUMN_MAP)) {
  REVERSE_COLUMN_MAP[snake] = camel;
}

function toSnake(key) {
  return COLUMN_MAP[key] || key;
}

function toCamel(key) {
  return REVERSE_COLUMN_MAP[key] || key;
}

function rowToCamel(row) {
  if (!row) return null;
  const result = {};
  for (const [key, value] of Object.entries(row)) {
    const camelKey = toCamel(key);
    // Convert boolean / tinyint columns
    if (key === 'is_verified' || key === 'high_crowd_warning' || key === 'read_status' || key === 'override_used') {
      result[camelKey] = Boolean(value);
    } else if (key === 'occupancy_pct' || key === 'base_price' || key === 'price' || key === 'total_amount') {
      result[camelKey] = value !== null ? parseFloat(value) : 0;
    } else {
      result[camelKey] = value;
    }
  }
  return result;
}

const DATETIME_COLUMNS = new Set([
  'created_at', 'updated_at', 'checked_in_at', 'resolved_at', 'timestamp'
]);

const DATE_COLUMNS = new Set([
  'booking_date', 'slot_date', 'start_date', 'end_date', 'reported_date'
]);

function formatDateForMySQL(val) {
  if (!val) return null;
  if (typeof val === 'string') {
    if (val.includes('T') || val.includes('Z')) {
      const d = new Date(val);
      if (!isNaN(d.getTime())) {
        return d.toISOString().slice(0, 19).replace('T', ' ');
      }
    }
    return val;
  }
  if (val instanceof Date) {
    return val.toISOString().slice(0, 19).replace('T', ' ');
  }
  return val;
}

function formatDateOnlyForMySQL(val) {
  if (!val) return null;
  if (typeof val === 'string') {
    if (val.includes('T')) {
      return val.split('T')[0];
    }
    return val;
  }
  if (val instanceof Date) {
    return val.toISOString().split('T')[0];
  }
  return val;
}

function objToSnakeEntries(obj) {
  const entries = {};
  for (const [key, value] of Object.entries(obj)) {
    const snakeKey = key === 'id' ? 'id' : toSnake(key);
    if (DATETIME_COLUMNS.has(snakeKey)) {
      entries[snakeKey] = formatDateForMySQL(value);
    } else if (DATE_COLUMNS.has(snakeKey)) {
      entries[snakeKey] = formatDateOnlyForMySQL(value);
    } else if (typeof value === 'boolean') {
      entries[snakeKey] = value ? 1 : 0;
    } else {
      entries[snakeKey] = value;
    }
  }
  return entries;
}

function getTable(collection) {
  const table = TABLE_MAP[collection];
  if (!table) {
    throw new Error(`[MySQLStore] Unknown collection: "${collection}"`);
  }
  return table;
}

// ==========================================================
// MySQLDataStore Class
// ==========================================================
class MySQLDataStore {
  constructor() {
    this.data = {
      users: [],
      templeAreas: [],
      darshanTypes: [],
      darshanSlots: [],
      bookings: [],
      staff: [],
      queues: [],
      festivals: [],
      emergencies: [],
      lostFound: [],
      notifications: [],
      crowdLogs: [],
      settings: {}
    };
  }

  /**
   * Load all data from MySQL into memory cache
   */
  async init() {
    try {
      console.log('[MySQL Store] Loading initial cache from MySQL database...');
      
      const [users, areas, types, slots, bookings, staff, queues, festivals, emergencies, lostFound, notifications, logs, settings] = await Promise.all([
        query('SELECT * FROM users ORDER BY created_at DESC'),
        query('SELECT * FROM temple_areas ORDER BY id ASC'),
        query('SELECT * FROM darshan_types ORDER BY base_price ASC'),
        query('SELECT * FROM darshan_slots ORDER BY slot_date ASC, start_time ASC'),
        query('SELECT * FROM bookings ORDER BY created_at DESC'),
        query('SELECT * FROM staff ORDER BY created_at DESC'),
        query('SELECT * FROM queues ORDER BY id ASC'),
        query('SELECT * FROM festivals ORDER BY start_date ASC'),
        query('SELECT * FROM emergency_reports ORDER BY created_at DESC'),
        query('SELECT * FROM lost_found ORDER BY created_at DESC'),
        query('SELECT * FROM notifications ORDER BY created_at DESC'),
        query('SELECT * FROM crowd_data_logs ORDER BY `timestamp` DESC LIMIT 100'),
        query('SELECT * FROM system_settings')
      ]);

      this.data.users = users.map(rowToCamel);
      this.data.templeAreas = areas.map(rowToCamel);
      this.data.darshanTypes = types.map(rowToCamel);
      this.data.darshanSlots = slots.map(rowToCamel);
      this.data.bookings = bookings.map(rowToCamel);
      this.data.staff = staff.map(rowToCamel);
      this.data.queues = queues.map(rowToCamel);
      this.data.festivals = festivals.map(rowToCamel);
      this.data.emergencies = emergencies.map(rowToCamel);
      this.data.lostFound = lostFound.map(rowToCamel);
      this.data.notifications = notifications.map(rowToCamel);
      this.data.crowdLogs = logs.map(rowToCamel);

      const settingsObj = {};
      for (const s of settings) {
        let val = s.setting_value;
        if (val === 'true') val = true;
        else if (val === 'false') val = false;
        else if (!isNaN(Number(val))) val = Number(val);
        settingsObj[s.setting_key] = val;
      }
      this.data.settings = settingsObj;

      console.log(`[MySQL Store] ✅ Cache loaded: ${this.data.users.length} users, ${this.data.bookings.length} bookings, ${this.data.darshanSlots.length} slots.`);
    } catch (err) {
      console.error('[MySQL Store] ❌ Failed to load initial cache from MySQL:', err.message);
    }
  }

  // ── Generic In-Memory & DB CRUD ──────────────────────────

  find(collection, filterFn) {
    if (!this.data[collection]) return [];
    return filterFn ? this.data[collection].filter(filterFn) : [...this.data[collection]];
  }

  findOne(collection, filterFn) {
    if (!this.data[collection]) return null;
    return this.data[collection].find(filterFn) || null;
  }

  findById(collection, id) {
    if (!this.data[collection]) return null;
    return this.data[collection].find(item => item.id === id) || null;
  }

  insert(collection, item) {
    if (!item.id) {
      item.id = `${collection.substring(0, 3)}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    }
    if (!item.createdAt) {
      item.createdAt = new Date().toISOString();
    }

    // Insert into in-memory array immediately
    if (this.data[collection]) {
      this.data[collection].unshift(item);
    }

    // Asynchronously insert into MySQL
    const table = TABLE_MAP[collection];
    if (table) {
      const snakeObj = objToSnakeEntries(item);
      const keys = Object.keys(snakeObj);
      const placeholders = keys.map(() => '?').join(', ');
      const values = Object.values(snakeObj);

      const sql = `INSERT INTO \`${table}\` (${keys.map(k => `\`${k}\``).join(', ')}) VALUES (${placeholders})`;
      query(sql, values).catch(err => {
        console.error(`[MySQL INSERT ERROR] Collection: ${collection}`, err.message);
      });
    }

    return item;
  }

  update(collection, id, updates) {
    if (collection === 'settings') {
      this.data.settings = { ...this.data.settings, [id]: updates };
      query(
        `INSERT INTO system_settings (setting_key, setting_value, description)
         VALUES (?, ?, '')
         ON DUPLICATE KEY UPDATE setting_value = ?, updated_at = NOW()`,
        [id, String(updates), String(updates)]
      ).catch(err => console.error('[MySQL SETTINGS UPDATE ERROR]', err.message));
      return updates;
    }

    if (!this.data[collection]) return null;
    const idx = this.data[collection].findIndex(item => item.id === id);
    if (idx === -1) return null;

    this.data[collection][idx] = {
      ...this.data[collection][idx],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    const updatedItem = this.data[collection][idx];

    // Asynchronously update MySQL
    const table = TABLE_MAP[collection];
    if (table) {
      const snakeUpdates = objToSnakeEntries(updates);
      delete snakeUpdates.id;

      const keys = Object.keys(snakeUpdates);
      if (keys.length > 0) {
        const setClauses = keys.map(k => `\`${k}\` = ?`).join(', ');
        const values = [...Object.values(snakeUpdates), id];
        const sql = `UPDATE \`${table}\` SET ${setClauses} WHERE id = ?`;
        query(sql, values).catch(err => {
          console.error(`[MySQL UPDATE ERROR] Collection: ${collection}`, err.message);
        });
      }
    }

    return updatedItem;
  }

  delete(collection, id) {
    if (!this.data[collection]) return false;
    const idx = this.data[collection].findIndex(item => item.id === id);
    if (idx === -1) return false;

    const removed = this.data[collection].splice(idx, 1)[0];

    // Asynchronously delete from MySQL
    const table = TABLE_MAP[collection];
    if (table) {
      query(`DELETE FROM \`${table}\` WHERE id = ?`, [id]).catch(err => {
        console.error(`[MySQL DELETE ERROR] Collection: ${collection}`, err.message);
      });
    }

    return removed;
  }

  persist() {
    // MySQL auto-persists in real-time. No-op for backward compatibility.
  }

  // ── QR Token Verification & Check-in ───────────────────────
  verifyAndCheckInQr(qrToken, staffEmployeeCode = 'STAFF-VERIFIER', allowOverride = false) {
    if (!qrToken || typeof qrToken !== 'string') {
      return { status: 'INVALID', message: 'No valid QR token string provided for scanning.' };
    }
    const cleanToken = qrToken.trim();

    // 1. Exact match on qrToken or id
    let booking = this.findOne('bookings', b => b.qrToken === cleanToken || b.id === cleanToken);

    // 2. Case-insensitive ID match (e.g. dar-2026-000129)
    if (!booking) {
      booking = this.findOne('bookings', b => b.id.toUpperCase() === cleanToken.toUpperCase());
    }

    // 3. Substring match for Booking ID (e.g. "QR-DAR-2026-000129-..." or token embedding DAR-XXXX-XXXXXX)
    if (!booking) {
      const match = cleanToken.match(/DAR-\d{4}-\d{5,8}/i);
      if (match) {
        const extractedId = match[0].toUpperCase();
        booking = this.findOne('bookings', b => b.id.toUpperCase() === extractedId);
      }
    }

    // 4. Base64 / Base64URL decoded match
    if (!booking) {
      try {
        const decoded = Buffer.from(cleanToken, 'base64url').toString('utf8');
        const match = decoded.match(/DAR-\d{4}-\d{5,8}/i);
        if (match) {
          const extractedId = match[0].toUpperCase();
          booking = this.findOne('bookings', b => b.id.toUpperCase() === extractedId);
        }
      } catch (e) {}
    }

    // 5. Partial token match if cleanToken is part of stored token
    if (!booking) {
      booking = this.findOne('bookings', b => 
        (b.qrToken && b.qrToken.includes(cleanToken) && cleanToken.length > 8) ||
        (cleanToken.includes(b.qrToken) && b.qrToken.length > 8)
      );
    }

    if (!booking) {
      return { status: 'INVALID', message: `Token "${cleanToken}" is not registered in temple gate records.` };
    }
    if (booking.bookingStatus === 'CHECKED_IN') {
      return {
        status: 'ALREADY_USED',
        message: `Token already used on ${new Date(booking.checkedInAt).toLocaleString()} by ${booking.checkedInBy || 'Staff'}.`,
        booking
      };
    }
    if (booking.bookingStatus === 'CANCELLED') {
      return { status: 'CANCELLED', message: 'This darshan booking was cancelled.', booking };
    }

    const bookingDate = booking.bookingDate || booking.date;
    const slotTime = booking.slotTime || booking.slot;
    const timeCheck = validateBookingSlotTime(bookingDate, slotTime, {
      graceMinutesBefore: 15,
      graceMinutesAfter: 15
    });

    if (!timeCheck.isValid && !allowOverride) {
      return {
        status: timeCheck.status,
        code: timeCheck.code,
        message: timeCheck.message,
        booking,
        timingDetails: {
          targetDate: timeCheck.targetDate,
          slotTime: timeCheck.slotTime,
          startTime: timeCheck.startTime,
          endTime: timeCheck.endTime,
          minutesRemaining: timeCheck.minutesRemaining || null
        }
      };
    }

    const updated = this.update('bookings', booking.id, {
      bookingStatus: 'CHECKED_IN',
      checkedInAt: new Date().toISOString(),
      checkedInBy: staffEmployeeCode,
      overrideUsed: !timeCheck.isValid && allowOverride
    });

    return {
      status: 'VALID',
      message: allowOverride && !timeCheck.isValid
        ? `QR Token verified with Staff Override. Entry permitted (${slotTime}).`
        : `QR Token verified successfully. Entry permitted for current slot (${slotTime}).`,
      booking: updated,
      timingDetails: {
        targetDate: timeCheck.targetDate,
        slotTime: timeCheck.slotTime,
        startTime: timeCheck.startTime,
        endTime: timeCheck.endTime
      }
    };
  }

  // ── Update Area Crowd Density ────────────────────────────
  updateAreaCrowd(areaCodeOrId, peopleCount, source = 'YOLO_AI_SERVICE', deviceId = 'CAM-01') {
    const area = this.findOne('templeAreas', a => a.id === areaCodeOrId || a.code === areaCodeOrId || a.name === areaCodeOrId);
    if (!area) return null;

    const count = Math.max(0, parseInt(peopleCount, 10));
    const occupancyPct = parseFloat(((count / area.capacity) * 100).toFixed(1));

    let crowdLevel = 'LOW';
    if (occupancyPct >= 75) crowdLevel = 'HIGH';
    else if (occupancyPct >= 45) crowdLevel = 'MODERATE';

    const updatedArea = this.update('templeAreas', area.id, {
      currentCount: count,
      occupancyPct,
      crowdLevel,
      updatedAt: new Date().toISOString()
    });

    const queue = this.findOne('queues', q => q.areaId === area.id);
    if (queue) {
      this.update('queues', queue.id, { highCrowdWarning: crowdLevel === 'HIGH' });
    }

    this.insert('crowdLogs', {
      id: `clog-${Date.now()}`,
      areaId: area.id,
      areaName: area.name,
      peopleCount: count,
      capacity: area.capacity,
      occupancyPct,
      crowdLevel,
      source,
      deviceId,
      timestamp: new Date().toISOString()
    });

    if (crowdLevel === 'HIGH') {
      const recentAlert = this.findOne('notifications', n =>
        n.type === 'CROWD_ALERT' &&
        n.title.includes(area.name) &&
        Date.now() - new Date(n.createdAt).getTime() < 1800000
      );
      if (!recentAlert) {
        this.insert('notifications', {
          userId: null,
          title: `High Crowd Warning: ${area.name}`,
          message: `Occupancy in ${area.name} is currently at ${occupancyPct}% (${count}/${area.capacity}). Flow management measures activated.`,
          type: 'CROWD_ALERT',
          readStatus: false
        });
      }
    }

    return updatedArea;
  }

  // ── Direct MySQL Query Helper ────────────────────────────
  async rawQuery(sql, params = []) {
    return query(sql, params);
  }
}

export const db = new MySQLDataStore();
await db.init();
