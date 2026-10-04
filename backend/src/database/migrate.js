// ==========================================================
// SMART TEMPLE MANAGEMENT & PILGRIM FLOW SYSTEM
// MySQL Migration – Create Database, Tables & Seed Data
// Run:  node src/database/migrate.js
// ==========================================================

import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_NAME = process.env.DB_NAME || 'temple_db';
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = parseInt(process.env.DB_PORT, 10) || 3306;
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '';

// ── Utility: Generate ID ───────────────────────────────────
function genId(prefix) {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

// ── Step 1: Create Database if Not Exists ──────────────────
async function createDatabase() {
  const conn = await mysql.createConnection({
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USER,
    password: DB_PASSWORD,
    multipleStatements: true
  });
  console.log(`[MIGRATE] Creating database "${DB_NAME}" if not exists...`);
  await conn.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
  await conn.end();
  console.log(`[MIGRATE] ✅ Database "${DB_NAME}" ready.`);
}

// ── Step 2: Run Schema SQL ─────────────────────────────────
async function runSchema(conn) {
  const schemaPath = path.resolve(__dirname, '..', '..', '..', 'database', 'mysql_schema.sql');
  if (!fs.existsSync(schemaPath)) {
    console.error(`[MIGRATE] ❌ Schema file not found at ${schemaPath}`);
    process.exit(1);
  }
  const schemaSql = fs.readFileSync(schemaPath, 'utf-8');
  console.log('[MIGRATE] Running schema (13 tables)...');
  await conn.query(schemaSql);
  console.log('[MIGRATE] ✅ All tables created successfully.');
}

// ── Step 3: Seed Demo Data ─────────────────────────────────
async function seedData(conn) {
  // Check if data already exists
  const [existing] = await conn.execute('SELECT COUNT(*) as cnt FROM users');
  if (existing[0].cnt > 0) {
    console.log(`[MIGRATE] ⚡ Data already seeded (${existing[0].cnt} users found). Skipping seed.`);
    return;
  }

  console.log('[MIGRATE] Seeding demo data...');

  const passwordHash = await bcrypt.hash('temple123', 10);

  // ── Users (Admin, Staff, Pilgrims) ─────────────────────
  const users = [
    ['usr-admin-01', 'Suresh Narayanan (Temple Executive Officer)', 'admin@templedemo.com', passwordHash, '+91 98450 11223', 'ADMIN'],
    ['usr-staff-01', 'Rajesh Sharma', 'staff@templedemo.com', passwordHash, '+91 97312 44556', 'STAFF'],
    ['usr-staff-02', 'Priya Patel', 'priya.staff@templedemo.com', passwordHash, '+91 99876 22110', 'STAFF'],
    ['usr-staff-03', 'Vikram Singh', 'vikram.staff@templedemo.com', passwordHash, '+91 98123 99887', 'STAFF'],
    ['usr-pilgrim-01', 'Ananya Deshmukh', 'pilgrim@templedemo.com', passwordHash, '+91 98201 55667', 'PILGRIM'],
    ['usr-pilgrim-02', 'Rohan Mehta', 'rohan@templedemo.com', passwordHash, '+91 97654 11223', 'PILGRIM'],
    ['usr-pilgrim-03', 'Kavita Joshi', 'kavita@templedemo.com', passwordHash, '+91 96541 78899', 'PILGRIM'],
    ['usr-pilgrim-04', 'Amit Kumar', 'amit@templedemo.com', passwordHash, '+91 99887 33445', 'PILGRIM'],
    ['usr-pilgrim-05', 'Sneha Nair', 'sneha@templedemo.com', passwordHash, '+91 98765 00112', 'PILGRIM'],
  ];
  for (const u of users) {
    await conn.execute(
      'INSERT IGNORE INTO users (id, name, email, password_hash, phone, role) VALUES (?, ?, ?, ?, ?, ?)',
      u
    );
  }
  console.log(`  ✅ ${users.length} users seeded`);

  // ── Temple Areas ───────────────────────────────────────
  const areas = [
    ['area-1', 'Main Entrance & Security Gate', 'ENTRANCE', 250, 110, 'LOW', 44.0, 'CAM-ENTRY-01'],
    ['area-2', 'Queue Complex & Holding Bays', 'QUEUE', 350, 285, 'HIGH', 81.4, 'CAM-QUEUE-02'],
    ['area-3', 'Inner Sanctum (Garbhagriha)', 'SANCTUM', 50, 32, 'MODERATE', 64.0, 'CAM-SANCTUM-03'],
    ['area-4', 'Prasad Distribution Hall', 'PRASAD', 200, 95, 'LOW', 47.5, 'CAM-PRASAD-04'],
    ['area-5', 'Exit Corridor & Shoe Counter', 'EXIT', 180, 60, 'LOW', 33.3, 'CAM-EXIT-05'],
    ['area-6', 'VIP Darshan Lobby', 'VIP', 80, 25, 'LOW', 31.3, 'CAM-VIP-06'],
    ['area-7', 'Meditation & Prayer Hall', 'MEDITATION', 120, 55, 'MODERATE', 45.8, 'CAM-MED-07'],
    ['area-8', 'Temple Kitchen (Annadanam)', 'KITCHEN', 150, 70, 'MODERATE', 46.7, 'CAM-KITCHEN-08']
  ];
  for (const a of areas) {
    await conn.execute(
      'INSERT IGNORE INTO temple_areas (id, name, code, capacity, current_count, crowd_level, occupancy_pct, camera_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      a
    );
  }
  console.log(`  ✅ ${areas.length} temple areas seeded`);

  // ── Darshan Types ──────────────────────────────────────
  const darshanTypes = [
    ['dt-1', 'General Darshan', 'Free general darshan for all devotees', 0.00, 200, '🛕'],
    ['dt-2', 'Special Quick Darshan', 'Priority entry with shorter queue', 500.00, 100, '⭐'],
    ['dt-3', 'VIP Quick Entry', 'Premium VIP entry with personal escort', 2000.00, 30, '👑'],
    ['dt-4', 'Senior Citizen Darshan', 'Special slot for elderly devotees (60+)', 100.00, 80, '🧓'],
    ['dt-5', 'Abhishekam Darshan', 'Participate in holy abhishekam ritual', 1500.00, 20, '🙏']
  ];
  for (const d of darshanTypes) {
    await conn.execute(
      'INSERT IGNORE INTO darshan_types (id, name, description, base_price, default_capacity, icon) VALUES (?, ?, ?, ?, ?, ?)',
      d
    );
  }
  console.log(`  ✅ ${darshanTypes.length} darshan types seeded`);

  // ── Darshan Slots (next 3 days) ────────────────────────
  const today = new Date();
  const slotTemplates = [
    { start: '06:00', end: '08:00' },
    { start: '08:00', end: '10:00' },
    { start: '10:00', end: '12:00' },
    { start: '12:00', end: '14:00' },
    { start: '14:00', end: '16:00' },
    { start: '16:00', end: '18:00' },
    { start: '18:00', end: '20:00' }
  ];
  let slotCount = 0;
  for (let dayOffset = 0; dayOffset < 3; dayOffset++) {
    const date = new Date(today);
    date.setDate(date.getDate() + dayOffset);
    const dateStr = date.toISOString().split('T')[0];

    for (const dt of darshanTypes) {
      for (const tpl of slotTemplates) {
        const slotId = `slot-${dateStr}-${dt[0]}-${tpl.start.replace(':', '')}`;
        const bookedCount = Math.floor(Math.random() * Math.min(50, dt[4]));
        const status = bookedCount >= dt[4] ? 'FULL' : 'OPEN';
        await conn.execute(
          'INSERT IGNORE INTO darshan_slots (id, darshan_type, slot_date, start_time, end_time, price, capacity, booked_count, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [slotId, dt[1], dateStr, tpl.start, tpl.end, dt[3], dt[4], bookedCount, status]
        );
        slotCount++;
      }
    }
  }
  console.log(`  ✅ ${slotCount} darshan slots seeded (3 days × 5 types × 7 time slots)`);

  // ── Staff Profiles ─────────────────────────────────────
  const staffProfiles = [
    ['stf-01', 'usr-staff-01', 'EMP-2026-001', 'Security', 'Main Entrance & Security Gate', 'Morning (06:00 - 14:00)'],
    ['stf-02', 'usr-staff-02', 'EMP-2026-002', 'Queue Management', 'Queue Complex & Holding Bays', 'Morning (06:00 - 14:00)'],
    ['stf-03', 'usr-staff-03', 'EMP-2026-003', 'Entry Management', 'VIP Darshan Lobby', 'Evening (14:00 - 22:00)'],
  ];
  for (const s of staffProfiles) {
    await conn.execute(
      'INSERT IGNORE INTO staff (id, user_id, employee_code, department, assigned_area, shift) VALUES (?, ?, ?, ?, ?, ?)',
      s
    );
  }
  console.log(`  ✅ ${staffProfiles.length} staff profiles seeded`);

  // ── Queues ─────────────────────────────────────────────
  const queues = [
    ['q-1', 'area-1', 'Main Entrance & Security Gate', 'A-101', 45, 12, 'ACTIVE', false],
    ['q-2', 'area-2', 'Queue Complex & Holding Bays', 'B-204', 120, 35, 'ACTIVE', true],
    ['q-3', 'area-6', 'VIP Darshan Lobby', 'V-012', 8, 3, 'ACTIVE', false],
  ];
  for (const q of queues) {
    await conn.execute(
      'INSERT IGNORE INTO queues (id, area_id, area_name, current_serving_token, waiting_count, estimated_wait_time_mins, status, high_crowd_warning) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      q
    );
  }
  console.log(`  ✅ ${queues.length} queues seeded`);

  // ── Sample Bookings ────────────────────────────────────
  const bookings = [
    ['DAR-2026-100001', 'usr-pilgrim-01', null, 'General Darshan', today.toISOString().split('T')[0], '08:00 AM - 10:00 AM', 2, 'Ananya Deshmukh', '+91 98201 55667', 'Aadhar', 0.00, 'SUCCESSFUL', 'CONFIRMED', 'qr-token-100001'],
    ['DAR-2026-100002', 'usr-pilgrim-02', null, 'Special Quick Darshan', today.toISOString().split('T')[0], '10:00 AM - 12:00 PM', 3, 'Rohan Mehta', '+91 97654 11223', 'PAN Card', 1500.00, 'SUCCESSFUL', 'CONFIRMED', 'qr-token-100002'],
    ['DAR-2026-100003', 'usr-pilgrim-03', null, 'VIP Quick Entry', today.toISOString().split('T')[0], '06:00 AM - 08:00 AM', 1, 'Kavita Joshi', '+91 96541 78899', 'Passport', 2000.00, 'SUCCESSFUL', 'CHECKED_IN', 'qr-token-100003'],
  ];
  for (const b of bookings) {
    await conn.execute(
      `INSERT IGNORE INTO bookings (id, user_id, slot_id, darshan_type, booking_date, slot_time, number_of_people, 
       primary_pilgrim_name, primary_pilgrim_phone, primary_pilgrim_id_proof, total_amount, payment_status, booking_status, qr_token)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      b
    );
  }
  console.log(`  ✅ ${bookings.length} sample bookings seeded`);

  // ── Festivals ──────────────────────────────────────────
  const festivals = [
    ['fest-1', 'Ganesh Chaturthi Mahotsav', '2026-09-07', '2026-09-17', 'Grand 11-day celebration of Lord Ganesha with special poojas, cultural programs, and processions.', '24/7 temple access during festival', 50, '04:00 AM - 11:30 PM', 'COMPLETED'],
    ['fest-2', 'Navratri & Dussehra', '2026-10-01', '2026-10-10', 'Nine nights of divine worship with Garba, Dandiya, and elaborate temple decorations.', 'Free Prasad distribution for all devotees', 40, '05:00 AM - 11:00 PM', 'ACTIVE'],
    ['fest-3', 'Diwali Lakshmi Puja', '2026-10-20', '2026-10-25', 'Festival of Lights with special Lakshmi Puja and illumination ceremonies.', 'Temple illuminated with 50,000 oil lamps', 35, '04:00 AM - 12:00 AM', 'UPCOMING'],
  ];
  for (const f of festivals) {
    await conn.execute(
      `INSERT IGNORE INTO festivals (id, name, start_date, end_date, description, special_announcement, extra_staff_allocated, extended_darshan_hours, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      f
    );
  }
  console.log(`  ✅ ${festivals.length} festivals seeded`);

  // ── Emergency Reports ──────────────────────────────────
  const emergencies = [
    ['emer-1', 'usr-pilgrim-04', 'Amit Kumar', '+91 99887 33445', 'Medical', 'Queue Complex & Holding Bays', 'Elderly woman fainted in the queue area due to heat. Requires immediate medical attention.', 'RESPONDING', 'stf-02', null],
    ['emer-2', null, 'Temple Security', '+91 98765 43210', 'Crowd Surge', 'Main Entrance & Security Gate', 'Large uncontrolled crowd gathering near main gate. Risk of stampede.', 'RESOLVED', 'stf-01', 'Deployed additional barriers and staff. Crowd controlled within 15 minutes.'],
  ];
  for (const e of emergencies) {
    await conn.execute(
      `INSERT IGNORE INTO emergency_reports (id, user_id, reporter_name, reporter_phone, emergency_type, area, description, status, assigned_staff_id, resolution_notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      e
    );
  }
  console.log(`  ✅ ${emergencies.length} emergency reports seeded`);

  // ── Lost & Found ───────────────────────────────────────
  const lostItems = [
    ['lf-1', 'usr-pilgrim-05', 'Gold Chain with Pendant', 'Valuables', 'Small gold chain with Om pendant, approximately 10 grams.', 'Inner Sanctum (Garbhagriha)', '+91 98765 00112', 'REPORTED', today.toISOString().split('T')[0]],
    ['lf-2', null, 'Child Blue Backpack', 'Clothing/Bags', 'Small blue cartoon backpack with water bottle inside.', 'Prasad Distribution Hall', '+91 97123 55667', 'FOUND_IN_CUSTODY', today.toISOString().split('T')[0]],
  ];
  for (const l of lostItems) {
    await conn.execute(
      `INSERT IGNORE INTO lost_found (id, user_id, item_name, category, description, area, contact_phone, status, reported_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      l
    );
  }
  console.log(`  ✅ ${lostItems.length} lost & found items seeded`);

  // ── Notifications ──────────────────────────────────────
  const notifications = [
    ['notif-1', null, 'Navratri Special Darshan Available', 'Special extended darshan hours during Navratri festival. Book your slot now!', 'FESTIVAL'],
    ['notif-2', null, 'New VIP Darshan Slots Released', 'VIP Quick Entry slots for October are now open for booking.', 'INFO'],
    ['notif-3', 'usr-pilgrim-01', 'Booking Confirmed: DAR-2026-100001', 'Your General Darshan booking for 2 pilgrims has been confirmed.', 'BOOKING'],
  ];
  for (const n of notifications) {
    await conn.execute(
      'INSERT IGNORE INTO notifications (id, user_id, title, message, type) VALUES (?, ?, ?, ?, ?)',
      n
    );
  }
  console.log(`  ✅ ${notifications.length} notifications seeded`);

  // ── System Settings ────────────────────────────────────
  const settings = [
    ['temple_name', 'Sri Siddhivinayak & Venkateswara Temple Complex', 'Official temple name'],
    ['max_bookings_per_user', '5', 'Maximum active bookings per user'],
    ['auto_cancel_hours', '24', 'Hours before slot to auto-cancel unconfirmed bookings'],
    ['crowd_high_threshold', '75', 'Percentage threshold for HIGH crowd warning'],
    ['crowd_moderate_threshold', '45', 'Percentage threshold for MODERATE crowd level'],
    ['enable_ai_crowd', 'true', 'Enable YOLO AI crowd detection service'],
    ['enable_email_notifications', 'true', 'Enable email notifications to pilgrims'],
  ];
  for (const s of settings) {
    await conn.execute(
      'INSERT IGNORE INTO system_settings (setting_key, setting_value, description) VALUES (?, ?, ?)',
      s
    );
  }
  console.log(`  ✅ ${settings.length} system settings seeded`);

  console.log('[MIGRATE] ✅ All demo data seeded successfully!');
}

// ── Main Migration Runner ──────────────────────────────────
async function runMigration() {
  console.log('');
  console.log('══════════════════════════════════════════════════════');
  console.log('  🛕  SMART TEMPLE MANAGEMENT – MySQL Migration');
  console.log('══════════════════════════════════════════════════════');
  console.log(`  Host: ${DB_HOST}:${DB_PORT}`);
  console.log(`  User: ${DB_USER}`);
  console.log(`  Database: ${DB_NAME}`);
  console.log('══════════════════════════════════════════════════════');
  console.log('');

  try {
    // Step 1: Create database
    await createDatabase();

    // Step 2: Connect to the database
    const conn = await mysql.createConnection({
      host: DB_HOST,
      port: DB_PORT,
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME,
      multipleStatements: true,
      dateStrings: true
    });

    // Step 3: Create tables
    await runSchema(conn);

    // Step 4: Seed data
    await seedData(conn);

    await conn.end();

    console.log('');
    console.log('══════════════════════════════════════════════════════');
    console.log('  ✅  Migration complete! Your database is ready.');
    console.log('══════════════════════════════════════════════════════');
    console.log('');
    console.log('  Tables created:');
    console.log('    • users            • temple_areas');
    console.log('    • darshan_types    • darshan_slots');
    console.log('    • bookings         • staff');
    console.log('    • queues           • emergency_reports');
    console.log('    • lost_found       • festivals');
    console.log('    • notifications    • crowd_data_logs');
    console.log('    • system_settings');
    console.log('');
    console.log('  Demo credentials:');
    console.log('    Admin:   admin@templedemo.com   / temple123');
    console.log('    Staff:   staff@templedemo.com   / temple123');
    console.log('    Pilgrim: pilgrim@templedemo.com / temple123');
    console.log('');

  } catch (err) {
    console.error('');
    console.error('❌ Migration failed:', err.message);
    console.error('');
    console.error('Troubleshooting:');
    console.error('  1. Is MySQL running? Check: mysql --version');
    console.error('  2. Check credentials in backend/.env (DB_HOST, DB_USER, DB_PASSWORD)');
    console.error('  3. Ensure MySQL user has CREATE DATABASE privileges');
    console.error('');
    process.exit(1);
  }
}

runMigration();
