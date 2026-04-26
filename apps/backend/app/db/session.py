"""
Database session management.
Provides engine, SessionLocal factory, and get_db dependency.
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from typing import Generator

from app.core.config import settings

# Build engine — supports both MySQL and PostgreSQL
_url = settings.DATABASE_URL
if _url.startswith("postgresql://"):
    engine = create_engine(_url, pool_pre_ping=True)
elif _url.startswith("mysql://") or _url.startswith("mysql+pymysql://"):
    engine = create_engine(_url, pool_pre_ping=True, pool_recycle=3600)
else:
    # SQLite (testing)
    engine = create_engine(_url, connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db() -> Generator[Session, None, None]:
    """FastAPI dependency — yields a DB session and closes it after the request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
