# System Architecture & Technical Design

## "Smart Temple Management & Pilgrim Flow System"

### 1. High-Level System Architecture

```mermaid
graph TD
    subgraph Client Layer [Frontend - React + Vite + CSS]
        P[Pilgrim Web App / Mobile View]
        S[Staff QR Scanner & Queue Console]
        A[Admin Central Management Dashboard]
    end

    subgraph Backend Layer [Node.js + Express REST API]
        Auth[JWT Authentication & Role Middleware]
        Book[Booking Engine & QR Token Generator]
        Queue[Queue Throttle & Batch Manager]
        Crowd[Crowd Aggregation Controller]
        Email[Nodemailer Email Dispatcher]
        Emg[Emergency & Lost Property Desk]
        Chat[Temple Knowledge Assistant]
    end

    subgraph AI Vision Layer [Python + FastAPI + OpenCV + YOLOv8]
        YOLO[YOLOv8 Person Detection Engine]
        Occ[Occupancy & Density Calculator]
        Stream[CCTV RTSP / Synthetic Stream]
    end

    subgraph Data Layer [PostgreSQL / Prisma / Persistent Store]
        DB[(Relational Database: Users, Bookings, Slots, Logs, Staff)]
    end

    P -->|REST API / JWT| Auth
    S -->|Verify QR / Manage Queue| Auth
    A -->|Manage Quotas / System Overrides| Auth

    Auth --> Book
    Auth --> Queue
    Auth --> Crowd
    Auth --> Emg
    Auth --> Chat

    Book --> DB
    Queue --> DB
    Crowd --> DB
    Emg --> DB
    Book --> Email

    Stream --> YOLO
    YOLO --> Occ
    Occ -->|POST /api/crowd/update| Crowd
```

---

### 2. Core Project Workflow & Storyline (For Viva & Presentation)

$$\text{Pilgrim} \longrightarrow \text{Book Darshan} \longrightarrow \text{Generate QR Token} \longrightarrow \text{Gate Scanner Verification} \longrightarrow \text{YOLO Crowd Vision Monitor} \longrightarrow \text{Queue Throttle} \longrightarrow \text{Admin Oversight}$$

1. **Pilgrim Booking**: Pilgrim registers, selects date, darshan category, and time slot. System auto-generates a unique Booking ID (`DAR-YYYY-XXXXXX`) and a secure non-sensitive QR token.
2. **Email & Confirmation**: Automated confirmation email and digital entry pass dispatched to the pilgrim.
3. **Gate Entry Check-in**: Ground staff scans QR code or enters code via `/staff/qr-scanner`. System validates against double check-in, marks entry completed, and prevents fraud.
4. **AI Crowd Vision Monitoring**: FastAPI microservice runs YOLOv8 person detection on temple holding bay cameras to compute real-time headcounts, occupancy percentages, and crowd tiers (`LOW`, `MODERATE`, `HIGH`).
5. **Smart Queue Regulation**: If holding bay occupancy exceeds 75%, system flags `highCrowdWarning`, dynamically slows batch calls, and alerts staff.
6. **Executive Dashboard**: Administrator monitors real-time CCTV feeds, slot utilization, staff assignments, festival surges, emergency incidents, and exports audit compliance reports in CSV format.
