from datetime import datetime

from app.services.json_logger import save_event
from app.services.threat_scorer import score_event
from app.services.db_logger import save_event_db

active_tracks = set()


def process_tracks(track_ids):

    global active_tracks

    current_tracks = set(track_ids)

    entered = current_tracks - active_tracks
    exited = active_tracks - current_tracks

    # New tracks detected
    for track in entered:

        score, severity = score_event("person_detected")

        event = {
            "event_type": "person_detected",
            "track_id": track,
            "threat_score": score,
            "severity": severity,
            "timestamp": datetime.now().isoformat()
        }

        print(event)
        save_event(event)
        save_event_db(event)

    # Tracks that disappeared
    for track in exited:

        score, severity = score_event("person_exited")

        event = {
            "event_type": "person_exited",
            "track_id": track,
            "threat_score": score,
            "severity": severity,
            "timestamp": datetime.now().isoformat()
        }

        print(event)
        save_event(event)
        save_event_db(event)

    active_tracks = current_tracks