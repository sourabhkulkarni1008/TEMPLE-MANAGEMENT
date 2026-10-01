# System Testing & Quality Assurance Checklist

## 1. Authentication & Role-Based Access
- [x] Register new pilgrim with full name, email, phone, and password.
- [x] Verify email duplicate check rejects existing emails with 409 status.
- [x] Log in as Pilgrim (`pilgrim@templedemo.com` / `TemplePass@123`) &rarr; Redirects to `/user/dashboard`.
- [x] Log in as Staff (`staff@templedemo.com` / `TemplePass@123`) &rarr; Redirects to `/staff/dashboard`.
- [x] Log in as Admin (`admin@templedemo.com` / `TemplePass@123`) &rarr; Redirects to `/admin/dashboard`.
- [x] Confirm that a Pilgrim cannot access `/admin/dashboard` or `/staff/qr-scanner` (blocked by ProtectedRoute & backend 403 middleware).

---

## 2. Darshan Booking & QR Generation Flow
- [x] Step 1: Select visit date.
- [x] Step 2: Choose darshan category (General, Special Quick Darshan, Senior Citizen, Suprabhata).
- [x] Step 3: Pick available 2-hour slot (validates remaining seat quota).
- [x] Step 4: Enter pilgrim name, phone, number of people, and Govt ID proof.
- [x] Step 5: Confirm booking &rarr; Automatically generates unique Booking ID `DAR-2026-XXXXXX` and secure QR token.
- [x] Verify that confirmation email is triggered via Nodemailer template.
- [x] View booking at `/user/booking/:id` & check rendered QR code image.

---

## 3. QR Entry Scanner & Verification
- [x] Open `/staff/qr-scanner` as Staff.
- [x] Test `QR-DAR-2026-000101-SECURE-TOKEN-X79` &rarr; Status: `VALID`, marks entry as `CHECKED_IN`.
- [x] Test the same token a second time &rarr; Status: `ALREADY_USED`, displays previous check-in timestamp and blocks entry.
- [x] Test invalid token &rarr; Status: `INVALID`, rejects entry.

---

## 4. Live Crowd Monitoring & Heatmap Flow
- [x] Open `/crowd` & `/admin/crowd`.
- [x] Verify all 6 temple zones render with capacity, current count, and occupancy % badges.
- [x] Click **Simulate Shift** & verify dynamic headcount fluctuations across all zones.
- [x] Test manual sensor calibration slider in Admin console & observe real-time recalculation of occupancy tier (`LOW`, `MODERATE`, `HIGH`).

---

## 5. Smart Queue Regulation
- [x] Open `/staff/queue`.
- [x] Click **Call Next Token Batch** & verify token increments (e.g. `A-142` &rarr; `A-143`) and waiting count decrements.
- [x] Click **Pause Queue** & verify status changes to `PAUSED`.
- [x] Click **Resume Queue** & verify lane reactivates.
- [x] Verify `highCrowdWarning` banner appears if queue bay occupancy exceeds 75%.

---

## 6. Emergency SOS & Lost and Found
- [x] Submit emergency SOS from Pilgrim portal (`/user/emergency`).
- [x] Confirm real-time notification alert appears in Staff and Admin consoles.
- [x] Staff opens `/staff/emergency`, accepts alert, and updates status to `RESOLVED` with resolution notes.
- [x] Submit lost property ticket in `/user/lost-found` & update status in Admin property ledger.

---

## 7. Reports, Analytics & CSV Export
- [x] Open `/admin/reports`.
- [x] Verify hourly visiting profile chart, weekly footfall trends, and monthly distribution tables.
- [x] Click **Export Bookings CSV** and **Export Crowd Logs CSV** & confirm files download properly.
