import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
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
} from './seedData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const STORAGE_FILE = path.join(__dirname, '..', '..', '.storage.json');

class DataStore {
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

  // Generic Helpers
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

  // Specific Business Methods

  // Check in QR Token
  verifyAndCheckInQr(qrToken, staffEmployeeCode = 'STAFF-VERIFIER') {
    const booking = this.findOne('bookings', b => b.qrToken === qrToken || b.id === qrToken);
    if (!booking) {
      return { status: 'INVALID', message: 'No matching booking found for this QR token.' };
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

    // Check if expired (if date is before today)
    const todayStr = new Date().toISOString().split('T')[0];
    if (booking.bookingDate < todayStr) {
      return { status: 'EXPIRED', message: 'Booking date has passed.', booking };
    }

    // Mark as checked in
    const updated = this.update('bookings', booking.id, {
      bookingStatus: 'CHECKED_IN',
      checkedInAt: new Date().toISOString(),
      checkedInBy: staffEmployeeCode
    });

    return {
      status: 'VALID',
      message: 'QR Token verified successfully. Entry permitted.',
      booking: updated
    };
  }

  // Update Crowd Density from AI or Sensor
  updateAreaCrowd(areaCodeOrId, peopleCount, source = 'YOLO_AI_SERVICE', deviceId = 'CAM-01') {
    const area = this.findOne('templeAreas', a => a.id === areaCodeOrId || a.code === areaCodeOrId || a.name === areaCodeOrId);
    if (!area) return null;

    const count = Math.max(0, parseInt(peopleCount, 10));
    const occupancyPct = parseFloat(((count / area.capacity) * 100).toFixed(1));

    let crowdLevel = 'LOW';
    if (occupancyPct >= 75) {
      crowdLevel = 'HIGH';
    } else if (occupancyPct >= 45) {
      crowdLevel = 'MODERATE';
    }

    const updatedArea = this.update('templeAreas', area.id, {
      currentCount: count,
      occupancyPct,
      crowdLevel,
      updatedAt: new Date().toISOString()
    });

    // Also update high crowd warning in queue if applicable
    const queue = this.findOne('queues', q => q.areaId === area.id);
    if (queue) {
      this.update('queues', queue.id, {
        highCrowdWarning: crowdLevel === 'HIGH'
      });
    }

    // Record log entry
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

    // If High Crowd detected, automatically log a temple announcement notification
    if (crowdLevel === 'HIGH') {
      const recentAlert = this.findOne('notifications', n =>
        n.type === 'CROWD_ALERT' &&
        n.title.includes(area.name) &&
        Date.now() - new Date(n.createdAt).getTime() < 1800000 // Within last 30 mins
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

export const db = new DataStore();
