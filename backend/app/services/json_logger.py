import json
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parents[3]

EVENT_FILE = BASE_DIR / "data" / "events" / "events.json"

EVENT_FILE.parent.mkdir(parents=True, exist_ok=True)

def save_event(event):

    if not EVENT_FILE.exists():
        with open(EVENT_FILE, "w") as f:
            json.dump([], f)

    with open(EVENT_FILE, "r") as f:
        events = json.load(f)

    events.append(event)

    with open(EVENT_FILE, "w") as f:
        json.dump(events, f, indent=4)