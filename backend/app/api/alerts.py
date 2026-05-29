from fastapi import APIRouter
from sqlalchemy import text

from app.core.database import engine

router = APIRouter()


@router.get("/alerts")
def get_alerts():

    with engine.connect() as conn:

        result = conn.execute(
            text("""
            SELECT *
            FROM events
            WHERE severity IN ('L2', 'L3')
            ORDER BY id DESC
            LIMIT 100
            """)
        )

        rows = result.mappings().all()

    return rows