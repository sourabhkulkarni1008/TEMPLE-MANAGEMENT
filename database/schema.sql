-- ==========================================================
-- SMART TEMPLE MANAGEMENT & PILGRIM FLOW SYSTEM
-- Database Schema (PostgreSQL / SQLite Compatible DDL)
-- ==========================================================

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(160) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'PILGRIM', -- 'PILGRIM', 'STAFF', 'ADMIN'
    is_verified BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. TEMPLE AREAS TABLE
CREATE TABLE IF NOT EXISTS temple_areas (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    code VARCHAR(50) NOT NULL UNIQUE,
    capacity INTEGER NOT NULL DEFAULT 200,
    current_count INTEGER NOT NULL DEFAULT 0,
    crowd_level VARCHAR(20) NOT NULL DEFAULT 'LOW', -- 'LOW', 'MODERATE', 'HIGH'
    occupancy_pct DECIMAL(5,2) DEFAULT 0.00,
    camera_id VARCHAR(50) DEFAULT 'CAM-01',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. DARSHAN SLOTS TABLE
CREATE TABLE IF NOT EXISTS darshan_slots (
    id VARCHAR(64) PRIMARY KEY,
    darshan_type VARCHAR(80) NOT NULL, -- 'General Darshan', 'Special Darshan', 'Senior Citizen Darshan', 'VIP Quick Entry'
    slot_date DATE NOT NULL,
    start_time VARCHAR(10) NOT NULL,
    end_time VARCHAR(10) NOT NULL,
    price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    capacity INTEGER NOT NULL DEFAULT 150,
    booked_count INTEGER NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'OPEN', -- 'OPEN', 'FULL', 'CANCELLED'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. BOOKINGS TABLE
CREATE TABLE IF NOT EXISTS bookings (
    id VARCHAR(64) PRIMARY KEY, -- Format: DAR-YYYY-XXXXXX
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    slot_id VARCHAR(64) REFERENCES darshan_slots(id),
    darshan_type VARCHAR(80) NOT NULL,
    booking_date DATE NOT NULL,
    slot_time VARCHAR(30) NOT NULL,
    number_of_people INTEGER NOT NULL DEFAULT 1,
    primary_pilgrim_name VARCHAR(120) NOT NULL,
    primary_pilgrim_phone VARCHAR(20) NOT NULL,
    primary_pilgrim_id_proof VARCHAR(50),
    total_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    payment_status VARCHAR(20) NOT NULL DEFAULT 'SUCCESSFUL', -- 'PENDING', 'SUCCESSFUL', 'FAILED'
    booking_status VARCHAR(20) NOT NULL DEFAULT 'CONFIRMED', -- 'CONFIRMED', 'CHECKED_IN', 'CANCELLED', 'EXPIRED'
    qr_token VARCHAR(255) UNIQUE NOT NULL,
    checked_in_at TIMESTAMP NULL,
    checked_in_by VARCHAR(64) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. STAFF TABLE
CREATE TABLE IF NOT EXISTS staff (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    employee_code VARCHAR(30) UNIQUE NOT NULL,
    department VARCHAR(80) NOT NULL, -- 'Security', 'Queue Management', 'Help Desk', 'Cleaning', 'Medical Assistance', 'Entry Management'
    assigned_area VARCHAR(100) NOT NULL,
    shift VARCHAR(30) NOT NULL, -- 'Morning (06:00 - 14:00)', 'Evening (14:00 - 22:00)', 'Night (22:00 - 06:00)'
    status VARCHAR(20) NOT NULL DEFAULT 'ON_DUTY', -- 'ON_DUTY', 'OFF_DUTY', 'ON_LEAVE'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. QUEUE TABLE
CREATE TABLE IF NOT EXISTS queues (
    id VARCHAR(64) PRIMARY KEY,
    area_id VARCHAR(64) REFERENCES temple_areas(id),
    area_name VARCHAR(100) NOT NULL,
    current_serving_token VARCHAR(20) NOT NULL DEFAULT 'A-101',
    waiting_count INTEGER NOT NULL DEFAULT 0,
    estimated_wait_time_mins INTEGER NOT NULL DEFAULT 15,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE', -- 'ACTIVE', 'PAUSED', 'STOPPED'
    high_crowd_warning BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. EMERGENCY REPORTS TABLE
CREATE TABLE IF NOT EXISTS emergency_reports (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id),
    reporter_name VARCHAR(120) NOT NULL,
    reporter_phone VARCHAR(20) NOT NULL,
    emergency_type VARCHAR(50) NOT NULL, -- 'Medical', 'Lost Person', 'Security', 'Crowd Surge', 'Other'
    area VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'RESPONDING', 'RESOLVED'
    assigned_staff_id VARCHAR(64) NULL,
    resolution_notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP NULL
);

-- 8. LOST AND FOUND TABLE
CREATE TABLE IF NOT EXISTS lost_found (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id),
    item_name VARCHAR(120) NOT NULL,
    category VARCHAR(50) NOT NULL, -- 'Valuables', 'Documents/Cards', 'Electronics', 'Clothing/Bags', 'Other'
    description TEXT NOT NULL,
    area VARCHAR(100) NOT NULL,
    contact_phone VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'REPORTED', -- 'REPORTED', 'FOUND_IN_CUSTODY', 'CLAIMED', 'CLOSED'
    reported_date DATE NOT NULL,
    image_url VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 9. FESTIVALS TABLE
CREATE TABLE IF NOT EXISTS festivals (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    description TEXT NOT NULL,
    special_announcement TEXT,
    extra_staff_allocated INTEGER DEFAULT 25,
    extended_darshan_hours VARCHAR(100) DEFAULT '04:00 AM - 11:30 PM',
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE', -- 'ACTIVE', 'UPCOMING', 'COMPLETED'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 10. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NULL, -- NULL means global announcement to all users
    title VARCHAR(160) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(40) NOT NULL DEFAULT 'INFO', -- 'INFO', 'BOOKING', 'CROWD_ALERT', 'FESTIVAL', 'EMERGENCY'
    read_status BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 11. CROWD DATA (LOGS & SENSOR INGESTION)
CREATE TABLE IF NOT EXISTS crowd_data_logs (
    id VARCHAR(64) PRIMARY KEY,
    area_id VARCHAR(64) NOT NULL,
    area_name VARCHAR(100) NOT NULL,
    people_count INTEGER NOT NULL,
    capacity INTEGER NOT NULL,
    occupancy_pct DECIMAL(5,2) NOT NULL,
    crowd_level VARCHAR(20) NOT NULL, -- 'LOW', 'MODERATE', 'HIGH'
    source VARCHAR(40) NOT NULL DEFAULT 'YOLO_AI_SERVICE', -- 'YOLO_AI_SERVICE', 'IOT_SENSOR', 'MANUAL', 'DEMO_SIMULATION'
    device_id VARCHAR(50) DEFAULT 'CAM-ENTRY-01',
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 12. SYSTEM SETTINGS TABLE
CREATE TABLE IF NOT EXISTS system_settings (
    key VARCHAR(64) PRIMARY KEY,
    value TEXT NOT NULL,
    description VARCHAR(255),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
