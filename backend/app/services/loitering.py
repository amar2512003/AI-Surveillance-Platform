from datetime import datetime

entry_times = {}

def update_loitering(track_ids):

    now = datetime.now()

    alerts = []

    for track_id in track_ids:

        if track_id not in entry_times:
            entry_times[track_id] = now

        duration = (now - entry_times[track_id]).total_seconds()

        if duration > 20:
            alerts.append({
                "track_id": track_id,
                "event_type": "loitering",
                "severity": "L3",
                "duration": duration
            })

        elif duration > 10:
            alerts.append({
                "track_id": track_id,
                "event_type": "loitering",
                "severity": "L2",
                "duration": duration
            })

    return alerts