# REST API Specification & Endpoint Documentation

All REST API endpoints are served under the `/api` prefix on `http://localhost:5000`.

---

## 1. Authentication Endpoints (`/api/auth`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register new pilgrim account | None |
| `POST` | `/api/auth/login` | Log in as Pilgrim, Staff, or Admin | None |
| `GET` | `/api/auth/me` | Fetch active user session profile | Bearer JWT |
| `PUT` | `/api/auth/profile` | Update user name, phone, or password | Bearer JWT |
| `POST` | `/api/auth/forgot-password` | Request password reset instructions | None |
| `POST` | `/api/auth/reset-password` | Set new password with reset token | None |

---

## 2. Bookings & QR Verification Endpoints (`/api/bookings`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/bookings` | List bookings (Pilgrim gets own, Admin gets all) | Bearer JWT |
| `POST` | `/api/bookings` | Create a new darshan booking & generate QR token | Bearer JWT |
| `GET` | `/api/bookings/:id` | Get booking details + generated QR Data URL | Bearer JWT |
| `DELETE` | `/api/bookings/:id` | Cancel an unverified upcoming booking | Bearer JWT |
| `POST` | `/api/bookings/verify-qr` | Verify & check in QR token (Gate scanner) | STAFF / ADMIN |

### QR Verification Request:
```json
{
  "qrToken": "QR-DAR-2026-000101-SECURE-TOKEN-X79"
}
```
### QR Verification Responses:
- `VALID`: Entry permitted, marks booking `CHECKED_IN`
- `ALREADY_USED`: Rejects double entry with original check-in timestamp
- `INVALID`: Token non-existent
- `EXPIRED`: Booking date passed

---

## 3. Crowd Monitoring Endpoints (`/api/crowd`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/crowd` | Get real-time crowd status across all 6 zones | None / Public |
| `GET` | `/api/crowd/:area` | Get specific area logs and headcount | None / Public |
| `POST` | `/api/crowd/update` | Ingest headcount from AI vision or sensor | None / AI Key |
| `POST` | `/api/crowd/demo-tick` | Simulate realistic natural crowd shift | None / Admin |

---

## 4. Smart Queue Endpoints (`/api/queue`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/queue` | Get live serving token and waiting counts | None / Public |
| `POST` | `/api/queue/next` | Advance queue to next batch token | STAFF / ADMIN |
| `POST` | `/api/queue/pause` | Pause queue intake lane | STAFF / ADMIN |
| `POST` | `/api/queue/resume` | Resume paused queue lane | STAFF / ADMIN |
| `PUT` | `/api/queue/:id` | Manual queue calibration | STAFF / ADMIN |

---

## 5. Staff Management Endpoints (`/api/staff`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/staff` | List all staff members with zone and shift filters | STAFF / ADMIN |
| `POST` | `/api/staff` | Onboard new staff officer | ADMIN |
| `PUT` | `/api/staff/:id` | Update staff zone, shift, or department | ADMIN / STAFF |
| `DELETE` | `/api/staff/:id` | Remove staff profile | ADMIN |

---

## 6. Emergency & Incidents Endpoints (`/api/emergency`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/emergency` | Transmit emergency SOS alert | Public / Pilgrim |
| `GET` | `/api/emergency` | List emergency incidents | Pilgrim / Staff / Admin |
| `PUT` | `/api/emergency/:id` | Update incident status (Responding / Resolved) | STAFF / ADMIN |

---

## 7. Reports & CSV Export Endpoints (`/api/reports`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/reports/daily` | Get today's footfall, check-ins, and hour profile | ADMIN |
| `GET` | `/api/reports/weekly` | Get 7-day visitor volume and wait trends | ADMIN |
| `GET` | `/api/reports/monthly` | Get monthly footfall and festival stats | ADMIN |
| `GET` | `/api/reports/export-csv` | Download CSV export (`type=bookings` or `type=crowd`) | ADMIN |

---

## 8. Chatbot Assistant Endpoint (`/api/chatbot`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/chatbot/ask` | Ask question grounded in temple rules & schedule | None / Public |
