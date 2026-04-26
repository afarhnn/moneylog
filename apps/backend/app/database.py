from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
import os

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")

# Auto detect driver berdasarkan URL
if DATABASE_URL:
    if DATABASE_URL.startswith("postgresql://"):
        DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+pg8000://", 1)
    
    if "postgresql" in DATABASE_URL:
        engine = create_engine(DATABASE_URL)
    else:
        engine = create_engine(
            DATABASE_URL,
            connect_args={"charset": "utf8mb4"}
        )
else:
    raise ValueError("DATABASE_URL tidak ditemukan di .env")

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()