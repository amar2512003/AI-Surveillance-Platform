from fastapi import APIRouter
from sqlalchemy import desc

from app.core.database import SessionLocal
from app.models.event_db import EventDB

router = APIRouter()


@router.get("/recent-events")
def recent_events():

    db = SessionLocal()

    events = (
        db.query(EventDB)
        .order_by(desc(EventDB.id))
        .limit(10)
        .all()
    )

    db.close()

    return [
        {
            "event_type": e.event_type,
            "severity": e.severity,
            "timestamp": str(e.timestamp)
        }
        for e in events
    ]