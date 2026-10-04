-- ==========================================================
-- SMART TEMPLE MANAGEMENT & PILGRIM FLOW SYSTEM
-- MySQL Schema – Full Database Setup
-- ==========================================================

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(160) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    role ENUM('PILGRIM', 'STAFF', 'ADMIN') NOT NULL DEFAULT 'PILGRIM',
    is_verified BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_users_email (email),
    INDEX idx_users_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. TEMPLE AREAS TABLE
CREATE TABLE IF NOT EXISTS temple_areas (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    code VARCHAR(50) NOT NULL UNIQUE,
    capacity INT NOT NULL DEFAULT 200,
    current_count INT NOT NULL DEFAULT 0,
    crowd_level ENUM('LOW', 'MODERATE', 'HIGH') NOT NULL DEFAULT 'LOW',
    occupancy_pct DECIMAL(5,2) DEFAULT 0.00,
    camera_id VARCHAR(50) DEFAULT 'CAM-01',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_areas_code (code),
    INDEX idx_areas_crowd (crowd_level)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. DARSHAN TYPES TABLE (master data)
CREATE TABLE IF NOT EXISTS darshan_types (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(80) NOT NULL,
    description TEXT,
    base_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    default_capacity INT NOT NULL DEFAULT 150,
    icon VARCHAR(10) DEFAULT '🛕',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. DARSHAN SLOTS TABLE
CREATE TABLE IF NOT EXISTS darshan_slots (
    id VARCHAR(64) PRIMARY KEY,
    darshan_type VARCHAR(80) NOT NULL,
    slot_date DATE NOT NULL,
    start_time VARCHAR(10) NOT NULL,
    end_time VARCHAR(10) NOT NULL,
    price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    capacity INT NOT NULL DEFAULT 150,
    booked_count INT NOT NULL DEFAULT 0,
    status ENUM('OPEN', 'FULL', 'CANCELLED') NOT NULL DEFAULT 'OPEN',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_slots_date (slot_date),
    INDEX idx_slots_type (darshan_type),
    INDEX idx_slots_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. BOOKINGS TABLE
CREATE TABLE IF NOT EXISTS bookings (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    slot_id VARCHAR(64),
    darshan_type VARCHAR(80) NOT NULL,
    booking_date DATE NOT NULL,
    slot_time VARCHAR(30) NOT NULL,
    number_of_people INT NOT NULL DEFAULT 1,
    primary_pilgrim_name VARCHAR(120) NOT NULL,
    primary_pilgrim_phone VARCHAR(20) NOT NULL,
    primary_pilgrim_id_proof VARCHAR(50),
    total_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    payment_status ENUM('PENDING', 'SUCCESSFUL', 'FAILED') NOT NULL DEFAULT 'SUCCESSFUL',
    booking_status ENUM('CONFIRMED', 'CHECKED_IN', 'CANCELLED', 'EXPIRED') NOT NULL DEFAULT 'CONFIRMED',
    qr_token VARCHAR(255) NOT NULL UNIQUE,
    checked_in_at TIMESTAMP NULL,
    checked_in_by VARCHAR(64) NULL,
    override_used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (slot_id) REFERENCES darshan_slots(id) ON DELETE SET NULL,
    INDEX idx_bookings_user (user_id),
    INDEX idx_bookings_date (booking_date),
    INDEX idx_bookings_status (booking_status),
    INDEX idx_bookings_qr (qr_token)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. STAFF TABLE
CREATE TABLE IF NOT EXISTS staff (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL UNIQUE,
    employee_code VARCHAR(30) NOT NULL UNIQUE,
    department VARCHAR(80) NOT NULL,
    assigned_area VARCHAR(100) NOT NULL,
    shift VARCHAR(30) NOT NULL,
    status ENUM('ON_DUTY', 'OFF_DUTY', 'ON_LEAVE') NOT NULL DEFAULT 'ON_DUTY',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_staff_code (employee_code),
    INDEX idx_staff_dept (department),
    INDEX idx_staff_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. QUEUES TABLE
CREATE TABLE IF NOT EXISTS queues (
    id VARCHAR(64) PRIMARY KEY,
    area_id VARCHAR(64),
    area_name VARCHAR(100) NOT NULL,
    current_serving_token VARCHAR(20) NOT NULL DEFAULT 'A-101',
    waiting_count INT NOT NULL DEFAULT 0,
    estimated_wait_time_mins INT NOT NULL DEFAULT 15,
    status ENUM('ACTIVE', 'PAUSED', 'STOPPED') NOT NULL DEFAULT 'ACTIVE',
    high_crowd_warning BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (area_id) REFERENCES temple_areas(id) ON DELETE SET NULL,
    INDEX idx_queues_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. EMERGENCY REPORTS TABLE
CREATE TABLE IF NOT EXISTS emergency_reports (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64),
    reporter_name VARCHAR(120) NOT NULL,
    reporter_phone VARCHAR(20) NOT NULL,
    emergency_type ENUM('Medical', 'Lost Person', 'Security', 'Crowd Surge', 'Other') NOT NULL,
    area VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    status ENUM('PENDING', 'RESPONDING', 'RESOLVED') NOT NULL DEFAULT 'PENDING',
    assigned_staff_id VARCHAR(64) NULL,
    resolution_notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_emergency_status (status),
    INDEX idx_emergency_type (emergency_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. LOST AND FOUND TABLE
CREATE TABLE IF NOT EXISTS lost_found (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64),
    item_name VARCHAR(120) NOT NULL,
    category ENUM('Valuables', 'Documents/Cards', 'Electronics', 'Clothing/Bags', 'Other') NOT NULL,
    description TEXT NOT NULL,
    area VARCHAR(100) NOT NULL,
    contact_phone VARCHAR(20) NOT NULL,
    status ENUM('REPORTED', 'FOUND_IN_CUSTODY', 'CLAIMED', 'CLOSED') NOT NULL DEFAULT 'REPORTED',
    reported_date DATE NOT NULL,
    image_url VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_lf_status (status),
    INDEX idx_lf_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. FESTIVALS TABLE
CREATE TABLE IF NOT EXISTS festivals (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    description TEXT NOT NULL,
    special_announcement TEXT,
    extra_staff_allocated INT DEFAULT 25,
    extended_darshan_hours VARCHAR(100) DEFAULT '04:00 AM - 11:30 PM',
    status ENUM('ACTIVE', 'UPCOMING', 'COMPLETED') NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_festival_status (status),
    INDEX idx_festival_dates (start_date, end_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NULL,
    title VARCHAR(160) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('INFO', 'BOOKING', 'CROWD_ALERT', 'FESTIVAL', 'EMERGENCY') NOT NULL DEFAULT 'INFO',
    read_status BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_notif_user (user_id),
    INDEX idx_notif_type (type),
    INDEX idx_notif_read (read_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. CROWD DATA LOGS TABLE
CREATE TABLE IF NOT EXISTS crowd_data_logs (
    id VARCHAR(64) PRIMARY KEY,
    area_id VARCHAR(64) NOT NULL,
    area_name VARCHAR(100) NOT NULL,
    people_count INT NOT NULL,
    capacity INT NOT NULL,
    occupancy_pct DECIMAL(5,2) NOT NULL,
    crowd_level ENUM('LOW', 'MODERATE', 'HIGH') NOT NULL,
    source VARCHAR(40) NOT NULL DEFAULT 'YOLO_AI_SERVICE',
    device_id VARCHAR(50) DEFAULT 'CAM-ENTRY-01',
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_crowd_area (area_id),
    INDEX idx_crowd_time (timestamp),
    INDEX idx_crowd_level (crowd_level)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 13. SYSTEM SETTINGS TABLE
CREATE TABLE IF NOT EXISTS system_settings (
    setting_key VARCHAR(64) PRIMARY KEY,
    setting_value TEXT NOT NULL,
    description VARCHAR(255),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
