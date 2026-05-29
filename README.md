
# AI Surveillance Platform

## Overview

AI Surveillance Platform is an intelligent video analytics system that performs real-time monitoring using Computer Vision and Artificial Intelligence techniques.

The platform combines **YOLOv8 object detection**, **face recognition**, **zone intrusion detection**, **loitering analysis**, **threat scoring**, and a **real-time React dashboard** to provide actionable security insights.

---

## Key Features

### Real-Time Surveillance

* Live surveillance feed display
* Continuous video processing

### Object Detection

* YOLOv8-based person detection
* Multi-person tracking

### Face Recognition

* Known person identification
* Unknown person detection
* Face registry support

### Zone Intrusion Detection

* Detects unauthorized entry into restricted zones
* Logs intrusion events automatically

### Loitering Detection

* Detects prolonged presence in monitored areas
* Generates alerts for suspicious activity

### Threat Scoring

* Assigns severity levels:

  * L1 (Low)
  * L2 (Medium)
  * L3 (High)

### Event Logging

* SQLite database storage
* JSON event logs
* Historical event tracking

### Dashboard Analytics

* Total events count
* Zone intrusion statistics
* Loitering statistics
* High-risk event statistics
* Threat distribution charts
* Recent alerts panel

### Reporting

* PDF incident reports
* Event summary generation

---

# System Architecture

```text
                     ┌───────────────────┐
                     │ Surveillance Video│
                     └─────────┬─────────┘
                               │
                               ▼
                     ┌───────────────────┐
                     │ YOLOv8 Detector   │
                     └─────────┬─────────┘
                               │
             ┌─────────────────┼─────────────────┐
             │                 │                 │
             ▼                 ▼                 ▼

    Face Recognition    Zone Intrusion     Loitering
       Module             Detection        Detection
             │                 │                 │
             └─────────────────┼─────────────────┘
                               │
                               ▼
                     ┌───────────────────┐
                     │ Threat Scoring    │
                     └─────────┬─────────┘
                               │
                               ▼
                     ┌───────────────────┐
                     │ Event Logger      │
                     │ SQLite Database   │
                     └─────────┬─────────┘
                               │
                 ┌─────────────┴─────────────┐
                 │                           │
                 ▼                           ▼

        FastAPI Backend              PDF Reports
                 │
                 ▼
         React Dashboard
```

---

# Technology Stack

## Backend

* Python 3.11
* FastAPI
* SQLAlchemy
* SQLite
* OpenCV
* Ultralytics YOLOv8
* Face Recognition

## Frontend

* React
* TypeScript
* Axios
* Recharts
* Vite

## Database

* SQLite

## Reporting

* ReportLab

---

# Project Structure

```text
AI-Surveillance-Platform
│
├── backend
│   ├── app
│   │   ├── api
│   │   ├── services
│   │   ├── models
│   │   ├── core
│   │   └── main.py
│   │
│   ├── data
│   └── requirements.txt
│
├── frontend
│   ├── src
│   ├── public
│   └── package.json
│
├── data
│   ├── events
│   └── face_registry
│
├── docs
│
├── docker-compose.yml
│
└── README.md
```

---

# Database Schema

### Event Table

| Field      | Type     |
| ---------- | -------- |
| id         | Integer  |
| event_type | String   |
| severity   | String   |
| timestamp  | DateTime |

---

# API Endpoints

## Dashboard

```http
GET /dashboard
```

Returns:

```json
{
  "total_events": 788,
  "zone_intrusions": 11,
  "loitering_events": 0,
  "high_risk_events": 67
}
```

---

## Recent Events

```http
GET /recent-events
```

Returns:

```json
[
  {
    "event_type":"person_detected",
    "severity":"L1",
    "timestamp":"2026-05-29T14:03:10"
  }
]
```

---

## Report Generation

```http
GET /report
```

Downloads a PDF report.

---

## Live Video Feed

```http
GET /video-feed
```

Streams surveillance feed.

---

# Installation

## Clone Repository

```bash
git clone https://github.com/amar2512003/AI-Surveillance-Platform.git

cd AI-Surveillance-Platform
```

---

# Backend Setup

```bash
cd backend

python3 -m venv venv

source venv/bin/activate

pip install -r requirements.txt
```

Run Backend:

```bash
uvicorn app.main:app --reload
```

Backend URL:

```text
http://127.0.0.1:8000
```

---

# Frontend Setup

```bash
cd frontend

npm install
```

Run Frontend:

```bash
npm run dev
```

Frontend URL:

```text
http://localhost:5173
```

---

# API Documentation

Swagger UI:

```text
http://127.0.0.1:8000/docs
```

OpenAPI JSON:

```text
http://127.0.0.1:8000/openapi.json
```

---

# Dashboard Modules

### KPI Cards

* Total Events
* Zone Intrusions
* Loitering Events
* High Risk Events

### Analytics

* Threat Distribution Pie Chart

### Monitoring

* Live Surveillance Feed
* Recent Alerts Panel

### Reporting

* PDF Incident Reports

---

# Results

The system successfully:

* Detects people using YOLOv8
* Recognizes registered faces
* Identifies unknown persons
* Detects zone intrusions
* Detects loitering behavior
* Assigns threat scores
* Logs all events
* Displays analytics on a real-time dashboard
* Generates downloadable PDF reports

---

# Future Enhancements

* Multi-camera support
* Email alert notifications
* SMS alert integration
* Cloud deployment
* WebSocket live updates
* Facial emotion recognition
* License plate recognition

---

# Authors

**Amar Sinha**

B.Tech Data Science


