from fastapi import APIRouter
from sqlalchemy import text

from app.core.database import engine

router = APIRouter()


@router.get("/stats")
def get_stats():

    with engine.connect() as conn:

        total_events = conn.execute(
            text("SELECT COUNT(*) FROM events")
        ).scalar()

        detections = conn.execute(
            text("""
            SELECT COUNT(*)
            FROM events
            WHERE event_type='person_detected'
            """)
        ).scalar()

        intrusions = conn.execute(
            text("""
            SELECT COUNT(*)
            FROM events
            WHERE event_type='zone_intrusion'
            """)
        ).scalar()

    return {
        "total_events": total_events,
        "person_detections": detections,
        "zone_intrusions": intrusions
    }