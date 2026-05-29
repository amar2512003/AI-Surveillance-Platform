from fastapi import APIRouter
from sqlalchemy import func

from app.core.database import SessionLocal
from app.models.event_db import EventDB

router = APIRouter()


@router.get("/dashboard")
def dashboard():

    db = SessionLocal()

    total_events = db.query(EventDB).count()

    zone_intrusions = (
        db.query(EventDB)
        .filter(EventDB.event_type == "zone_intrusion")
        .count()
    )

    loitering = (
        db.query(EventDB)
        .filter(EventDB.event_type == "loitering")
        .count()
    )

    high_risk = (
        db.query(EventDB)
        .filter(EventDB.severity == "L3")
        .count()
    )

    db.close()

    return {
        "total_events": total_events,
        "zone_intrusions": zone_intrusions,
        "loitering_events": loitering,
        "high_risk_events": high_risk
    }