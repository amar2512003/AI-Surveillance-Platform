from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import sqlite3

# Import your routers
from app.api.events import router as events_router
from app.api.alerts import router as alerts_router
from app.api.stats import router as stats_router
from app.api.dashboard import router as dashboard_router
from app.api.recent_events import router as recent_router
from app.api.video_feed import router as video_router
from app.api.report import router as report_router

app = FastAPI(
    title="AI Surveillance Platform",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # React frontend access
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Root endpoint
@app.get("/")
def root():
    return {"message": "AI Surveillance Platform Running"}

# Register routers
app.include_router(events_router)
app.include_router(alerts_router)
app.include_router(stats_router)
app.include_router(dashboard_router)
app.include_router(recent_router)
app.include_router(video_router)
app.include_router(report_router)

@app.get("/recent-events")
def recent_events():

    conn = sqlite3.connect("events.db")
    cursor = conn.cursor()

    cursor.execute("""
        SELECT event_type,
               severity,
               timestamp
        FROM events
        ORDER BY id DESC
        LIMIT 10
    """)

    rows = cursor.fetchall()

    conn.close()

    return [
        {
            "event_type": row[0],
            "severity": row[1],
            "timestamp": row[2]
        }
        for row in rows
    ]