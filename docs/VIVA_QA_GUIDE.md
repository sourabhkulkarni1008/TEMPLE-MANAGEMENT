# Final Year Viva & Project Defense Guide

## "Smart Temple Management & Pilgrim Flow System"
**Target Audience**: B.Tech AI/ML / Computer Science Final Year Project Review Panel

---

### Q1: What is the core problem this project solves?
**Answer**: Traditional temple complexes face severe challenges during peak days: physical queue congestion, stampede risks, lack of real-time crowd visibility, manual ticket forgery, and delayed emergency response. Our system solves this with an integrated flow:
1. Online quota-controlled darshan bookings
2. Digital QR entry pass verification that prevents duplicate entries
3. Real-time Computer Vision (YOLOv8) crowd monitoring across holding bays
4. Automated queue pacing to avert bottlenecks
5. Ground SOS emergency dispatch

---

### Q2: Why is the AI/ML service separated into a distinct Python FastAPI microservice?
**Answer**:
1. **Separation of Concerns**: Python is the industry standard for deep learning (PyTorch, Ultralytics YOLO, OpenCV), while Node.js Express excels in I/O-bound REST API operations and WebSocket/HTTP handling.
2. **Independent Scalability**: In a real deployment, the AI vision service could run on a GPU-enabled edge device or server near CCTV streams, while the web backend runs on a lightweight application server.
3. **Fault Isolation**: An issue in video frame decoding does not crash the booking or payment backend.

---

### Q3: How does the YOLOv8 person detection model calculate crowd level?
**Answer**:
1. Input video frame is passed to `YOLOv8n` (nano model for high FPS real-time inference).
2. The model detects bounding boxes with class label `0` (`person`) having a confidence score $\ge 0.45$.
3. Total detected person count is divided by the pre-configured maximum capacity of that temple zone:
   $$\text{Occupancy} = \left( \frac{\text{detected\_count}}{\text{capacity}} \right) \times 100$$
4. If occupancy is $< 45\%$, crowd level is `LOW`; between $45\% - 74.9\%$ is `MODERATE`; $\ge 75\%$ is classified as `HIGH` (which triggers automated queue warnings).

---

### Q4: How is the QR Code verification made secure against forgery and double entry?
**Answer**:
1. The QR token does **not** contain raw sensitive user info. It contains a cryptographic random token string mapped to the booking record in the database.
2. When the staff scans the QR code at `/staff/qr-scanner`:
   - System checks if status is `CONFIRMED`.
   - If verified, status is immediately updated to `CHECKED_IN` along with `checkedInAt` timestamp and the staff officer's employee code.
   - If scanned a second time, the API returns status `ALREADY_USED` with the previous check-in timestamp, blocking duplicate entry attempts.

---

### Q5: How is authentication and role-based access control implemented?
**Answer**:
1. Passwords are never stored in plain text; they are salted and hashed using `bcrypt` (10 rounds).
2. Upon login, a signed JSON Web Token (JWT) is issued containing the user ID, email, and role (`PILGRIM`, `STAFF`, `ADMIN`).
3. Client-side routes are protected using React `ProtectedRoute` components.
4. Server-side routes are secured with `requireAuth` and `requireRole(...)` middleware.

---

### Q6: What is "Festival Mode" and how does it function?
**Answer**: Festival Mode is an administrative override designed for heavy festive occasions (e.g. Brahmotsavam, Shivaratri). When activated:
- Darshan operational hours are automatically extended.
- Additional temporary staff quotas are allocated across queue bays.
- Broadcast announcements are automatically pinned to all pilgrim dashboards.
- Slot capacities and queue monitoring frequencies are dynamically heightened.

---

### Q7: What are the primary future enhancements for this project?
**Answer**:
1. Multi-camera pedestrian re-identification (Re-ID) across non-overlapping zones.
2. Direct integration with physical IoT turnstiles and RFID wristbands.
3. Real-time WhatsApp/SMS OTP and boarding notifications via Twilio/Gupshup.
4. Integration with government payment gateways (UPI / Bharat BillPay).
