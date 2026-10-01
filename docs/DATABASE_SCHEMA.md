# Database Design & Relational Entity Specifications

## 1. Entity Relationship Overview

```
[Users] 1 --- * [Bookings] * --- 1 [DarshanSlots]
[Users] 1 --- 0..1 [Staff]
[Users] 1 --- * [EmergencyReports]
[Users] 1 --- * [LostFound]
[Users] 1 --- * [Notifications]

[TempleAreas] 1 --- * [Queues]
[TempleAreas] 1 --- * [CrowdDataLogs]
```

---

## 2. Table Schemas

### `users`
- `id` (VARCHAR PK)
- `name` (VARCHAR)
- `email` (VARCHAR UNIQUE)
- `password_hash` (VARCHAR)
- `phone` (VARCHAR)
- `role` (ENUM: `PILGRIM`, `STAFF`, `ADMIN`)
- `is_verified` (BOOLEAN)
- `created_at` (TIMESTAMP)

### `bookings`
- `id` (VARCHAR PK, format: `DAR-YYYY-XXXXXX`)
- `user_id` (FK &rarr; `users.id`)
- `slot_id` (FK &rarr; `darshan_slots.id`)
- `darshan_type` (VARCHAR)
- `booking_date` (DATE)
- `slot_time` (VARCHAR)
- `number_of_people` (INT)
- `primary_pilgrim_name` (VARCHAR)
- `primary_pilgrim_phone` (VARCHAR)
- `primary_pilgrim_id_proof` (VARCHAR)
- `total_amount` (DECIMAL)
- `payment_status` (`PENDING`, `SUCCESSFUL`, `FAILED`)
- `booking_status` (`CONFIRMED`, `CHECKED_IN`, `CANCELLED`, `EXPIRED`)
- `qr_token` (VARCHAR UNIQUE)
- `checked_in_at` (TIMESTAMP)
- `checked_in_by` (VARCHAR)
- `created_at` (TIMESTAMP)

### `temple_areas`
- `id` (VARCHAR PK)
- `name` (VARCHAR)
- `code` (VARCHAR UNIQUE)
- `capacity` (INT)
- `current_count` (INT)
- `crowd_level` (`LOW`, `MODERATE`, `HIGH`)
- `occupancy_pct` (DECIMAL)
- `camera_id` (VARCHAR)

### `darshan_slots`
- `id` (VARCHAR PK)
- `darshan_type` (VARCHAR)
- `slot_date` (DATE)
- `start_time` (VARCHAR)
- `end_time` (VARCHAR)
- `price` (DECIMAL)
- `capacity` (INT)
- `booked_count` (INT)
- `status` (`OPEN`, `FULL`, `CANCELLED`)

### `staff`
- `id` (VARCHAR PK)
- `user_id` (FK &rarr; `users.id` UNIQUE)
- `employee_code` (VARCHAR UNIQUE)
- `department` (VARCHAR)
- `assigned_area` (VARCHAR)
- `shift` (VARCHAR)
- `status` (`ON_DUTY`, `OFF_DUTY`, `ON_LEAVE`)

### `queues`
- `id` (VARCHAR PK)
- `area_id` (FK &rarr; `temple_areas.id`)
- `area_name` (VARCHAR)
- `current_serving_token` (VARCHAR)
- `waiting_count` (INT)
- `estimated_wait_time_mins` (INT)
- `status` (`ACTIVE`, `PAUSED`, `STOPPED`)
- `high_crowd_warning` (BOOLEAN)
