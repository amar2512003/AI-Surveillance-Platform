from pydantic import BaseModel

class Event(BaseModel):
    event_id: str
    event_type: str
    severity: str
    track_id: int
    timestamp: str