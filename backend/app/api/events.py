from fastapi import APIRouter
from sqlalchemy import text

from app.core.database import engine

router = APIRouter()


@router.get("/events")
def get_events():

    with engine.connect() as conn:

        result = conn.execute(
            text("""
            SELECT *
            FROM events
            ORDER BY id DESC
            LIMIT 100
            """)
        )

        rows = result.mappings().all()

    return rows