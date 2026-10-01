# Smart Temple Management & Pilgrim Flow System

An enterprise-grade, realistic full-stack web application with integrated **AI Computer Vision (YOLOv8)** crowd monitoring, digital **QR Entry Pass verification**, **Smart Queue Regulation**, **Festival Surge Mode**, **Emergency SOS Response**, and **Executive Analytics**.

Designed and structured for a **Final Year B.Tech AI/ML Project (2-Member Team)**.

---

## 🏛️ Project Architecture & Tech Stack

```
c:\Users\kulka\OneDrive\Desktop\TEMPLE/
├── /frontend       # React + Vite + Clean CSS Modules + React Router + Axios
├── /backend        # Node.js + Express.js + JWT Auth + Nodemailer + REST APIs
├── /database       # PostgreSQL DDL Schema + Prisma Schema + Initial Seed Data
├── /ai-service     # Python + FastAPI + OpenCV + YOLOv8 Crowd Vision Microservice
└── /docs           # Architecture, AI/ML Workflow, API Docs, Viva QA & Testing Checklist
```

### Technology Highlights:
- **Frontend**: React 18, Vite, React Router v6, Axios, Lucide Icons, QR Code generation & Canvas rendering.
- **Backend**: Node.js, Express.js, JWT (`jsonwebtoken`), `bcryptjs`, `helmet`, `morgan`, `express-rate-limit`, `nodemailer`.
- **Database**: PostgreSQL / SQLite / High-performance persistent JSON storage with pre-seeded **100+ realistic pilgrims, 20 staff, 6 temple zones, darshan slots, and emergency logs**.
- **AI/ML Vision**: Python 3.10+, FastAPI, OpenCV, Ultralytics YOLOv8 nano model (`yolov8n.pt`) for human person detection & occupancy calculations, with automatic zero-hardware simulation fallback.

---

## 🔑 Demo & Evaluation Credentials

All accounts are pre-seeded with the password: **`TemplePass@123`** (Fast 1-click auto-fill buttons are provided directly on the Login page):

| Role | Email Address | Default Password | Primary Dashboard |
| :--- | :--- | :--- | :--- |
| **ADMIN** | `admin@templedemo.com` | `TemplePass@123` | `/admin/dashboard` |
| **STAFF** | `staff@templedemo.com` | `TemplePass@123` | `/staff/dashboard` |
| **PILGRIM** | `pilgrim@templedemo.com` | `TemplePass@123` | `/user/dashboard` |

---

## 🚀 Quick Start & Running Instructions

### 1. Start Node.js Backend Server
```bash
cd backend
npm install
npm run dev
```
*Backend REST API will run at `http://localhost:5000`.*

---

### 2. Start React Frontend Web Application
```bash
cd frontend
npm install
npm run dev
```
*Frontend application will open at `http://localhost:5173`.*

---

### 3. Start Python AI Crowd Vision Microservice
```bash
cd ai-service
pip install -r requirements.txt
python main.py
```
*FastAPI microservice with Swagger documentation will run at `http://localhost:8000/docs`.*

---

## 📋 Key Modules & Features

1. **Pilgrim Darshan Booking**:
   - Multi-step booking wizard (Date &rarr; Darshan Category &rarr; 2-Hour Slot &rarr; Pilgrim Details &rarr; Confirmation).
   - Auto-generates unique Booking IDs (e.g. `DAR-2026-000125`) and secure QR tokens.
   - Dispatches confirmation emails via clean HTML email templates.

2. **Digital QR Code Entry Pass & Scanner**:
   - Pilgrim shows digital pass at gate.
   - Staff uses `/staff/qr-scanner` to verify tokens with immediate feedback (`VALID`, `ALREADY_USED`, `INVALID`, `EXPIRED`), marking entry as completed and blocking double check-ins.

3. **Live CCTV Crowd Vision & Heatmap**:
   - Real-time headcount and density monitoring across 6 key temple zones:
     1. *Main Entrance & Security Gate*
     2. *Queue Complex & Holding Bays*
     3. *Main Sanctum / Darshan Hall*
     4. *Prasadam Distribution Counter*
     5. *Exit Corridor & Shoe Stand*
     6. *North & South Parking Lot*
   - Dynamic classification into `LOW` ($<45\%$), `MODERATE` ($45\%-74\%$), and `HIGH` ($\ge 75\%$) crowd tiers.

4. **Smart Queue Regulation**:
   - Real-time active token numbers, waiting counts, and estimated wait times.
   - Staff controls: *Call Next Batch Token*, *Pause Queue*, *Resume Queue*, and high crowd surge warnings.

5. **Festival Mode**:
   - Administrative toggle for major festive events (e.g. Brahmotsavam, Shivaratri).
   - Automatically extends darshan operational hours, deploys surge staff quotas, and broadcasts announcements.

6. **Ground Emergency SOS & Incident Desk**:
   - Pilgrim SOS button (*Medical*, *Lost Child*, *Security*, *Crowd Surge*).
   - Real-time broadcast to ground marshals and staff with response & resolution logging.

7. **Temple Knowledge Assistant (Chatbot)**:
   - Grounded in real temple database records to answer questions regarding pooja timings, rules, dress guidelines, parking, and booking cancellations.

8. **Analytics & CSV Export**:
   - Hourly visitor distribution profiles, weekly trends, monthly summaries, and one-click CSV export for audit compliance.

---

## 📑 Project Documentation Index
- [Architecture & Workflow Diagram](file:///c:/Users/kulka/OneDrive/Desktop/TEMPLE/docs/ARCHITECTURE.md)
- [AI/ML Computer Vision Workflow](file:///c:/Users/kulka/OneDrive/Desktop/TEMPLE/docs/AI_ML_WORKFLOW.md)
- [REST API Specifications](file:///c:/Users/kulka/OneDrive/Desktop/TEMPLE/docs/API_DOCUMENTATION.md)
- [Database Schema (SQL & Prisma)](file:///c:/Users/kulka/OneDrive/Desktop/TEMPLE/docs/DATABASE_SCHEMA.md)
- [Viva Defense & Q&A Guide](file:///c:/Users/kulka/OneDrive/Desktop/TEMPLE/docs/VIVA_QA_GUIDE.md)
- [Testing & QA Checklist](file:///c:/Users/kulka/OneDrive/Desktop/TEMPLE/docs/TESTING_CHECKLIST.md)
