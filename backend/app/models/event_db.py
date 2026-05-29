from sqlalchemy import Column, Integer, String, Float
from sqlalchemy.orm import declarative_base

Base = declarative_base()


class EventDB(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True)

    event_type = Column(String)
    track_id = Column(Integer)

    threat_score = Column(Float)
    severity = Column(String)

    timestamp = Column(String)