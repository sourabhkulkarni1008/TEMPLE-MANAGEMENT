// ==========================================================
// SMART TEMPLE MANAGEMENT & PILGRIM FLOW SYSTEM
// Smart Data Store Switcher
// Selects MySQL or JSON-file backend based on USE_LOCAL_STORAGE env var
// ==========================================================

import dotenv from 'dotenv';
dotenv.config();

const USE_LOCAL_STORAGE = process.env.USE_LOCAL_STORAGE !== 'false';

let db;

if (USE_LOCAL_STORAGE) {
  // ── JSON File Store (zero-config, for demos) ─────────────
  console.log('[DATA STORE] Mode: JSON File Store (USE_LOCAL_STORAGE=true)');

  const { default: fs } = await import('fs');
  const { default: pathModule } = await import('path');
  const { fileURLToPath } = await import('url');
  const { validateBookingSlotTime } = await import('../utils/timeValidator.js');

  const {
    initialUsers,
    initialTempleAreas,
    initialStaffProfiles,
    initialDarshanTypes,
    generateInitialSlots,
    initialQueues,
    initialFestivals,
    initialEmergencies,
    initialLostFound,
    initialNotifications,
    generateInitialBookings,
    initialSystemSettings
  } = await import('./seedData.js');

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = pathModule.dirname(__filename);
  const STORAGE_FILE = pathModule.join(__dirname, '..', '..', '.storage.json');

  class JsonDataStore {
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
      this.init();
    }

    init() {
      try {
        if (fs.existsSync(STORAGE_FILE)) {
          const fileContent = fs.readFileSync(STORAGE_FILE, 'utf-8');
          const parsed = JSON.parse(fileContent);
          this.data = { ...this.data, ...parsed };
          console.log('[DATA STORE] Loaded existing persistent data from disk.');
        } else {
          this.seedInitial();
        }
      } catch (err) {
        console.warn('[DATA STORE WARNING] Could not parse existing storage.json, re-seeding initial data.', err.message);
        this.seedInitial();
      }
    }

    seedInitial() {
      console.log('[DATA STORE] Populating initial demo seed data (100+ pilgrims, 20 staff, slots, areas)...');
      this.data.users = [...initialUsers];
      this.data.templeAreas = [...initialTempleAreas];
      this.data.darshanTypes = [...initialDarshanTypes];
      this.data.darshanSlots = generateInitialSlots();
      this.data.bookings = generateInitialBookings();
      this.data.staff = [...initialStaffProfiles];
      this.data.queues = [...initialQueues];
      this.data.festivals = [...initialFestivals];
      this.data.emergencies = [...initialEmergencies];
      this.data.lostFound = [...initialLostFound];
      this.data.notifications = [...initialNotifications];
      this.data.settings = { ...initialSystemSettings };
      this.data.crowdLogs = [
        {
          id: 'log-1',
          areaId: 'area-1',
          areaName: 'Main Entrance & Security Gate',
          peopleCount: 110,
          capacity: 250,
          occupancyPct: 44.0,
          crowdLevel: 'LOW',
          source: 'YOLO_AI_SERVICE',
          deviceId: 'CAM-ENTRY-01',
          timestamp: new Date().toISOString()
        },
        {
          id: 'log-2',
          areaId: 'area-2',
          areaName: 'Queue Complex & Holding Bays',
          peopleCount: 285,
          capacity: 350,
          occupancyPct: 81.4,
          crowdLevel: 'HIGH',
          source: 'YOLO_AI_SERVICE',
          deviceId: 'CAM-QUEUE-02',
          timestamp: new Date().toISOString()
        }
      ];
      this.persist();
    }

    persist() {
      try {
        fs.writeFileSync(STORAGE_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
      } catch (err) {
        console.error('[DATA STORE ERROR] Failed to persist data to storage.json:', err.message);
      }
    }

    find(collection, filterFn) {
      return this.data[collection].filter(filterFn);
    }

    findOne(collection, filterFn) {
      return this.data[collection].find(filterFn);
    }

    findById(collection, id) {
      return this.data[collection].find(item => item.id === id);
    }

    insert(collection, item) {
      if (!item.id) {
        item.id = `${collection.substring(0, 3)}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      }
      if (!item.createdAt) {
        item.createdAt = new Date().toISOString();
      }
      this.data[collection].unshift(item);
      this.persist();
      return item;
    }

    update(collection, id, updates) {
      const idx = this.data[collection].findIndex(item => item.id === id);
      if (idx === -1) return null;
      this.data[collection][idx] = {
        ...this.data[collection][idx],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      this.persist();
      return this.data[collection][idx];
    }

    delete(collection, id) {
      const idx = this.data[collection].findIndex(item => item.id === id);
      if (idx === -1) return false;
      const removed = this.data[collection].splice(idx, 1)[0];
      this.persist();
      return removed;
    }

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
  }

  db = new JsonDataStore();

} else {
  // ── MySQL Database Store ─────────────────────────────────
  console.log('[DATA STORE] Mode: MySQL Database (USE_LOCAL_STORAGE=false)');
  const mysqlModule = await import('../database/mysqlStore.js');
  db = mysqlModule.db;
}

export { db };
