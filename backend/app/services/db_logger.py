from app.core.database import SessionLocal
from app.models.event_db import EventDB


def save_event_db(event):

    db = SessionLocal()

    try:

        db_event = EventDB(
            event_type=event["event_type"],
            track_id=event["track_id"],
            threat_score=event["threat_score"],
            severity=event["severity"],
            timestamp=event["timestamp"]
        )

        db.add(db_event)
        db.commit()

    finally:
        db.close()