from app.core.database import engine
from app.models.event_db import Base

Base.metadata.create_all(bind=engine)

print("Tables Created Successfully")