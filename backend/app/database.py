"""
Database configuration.

Uses SQLite by default so the project runs anywhere with zero setup.
Swap to Postgres in production by setting the DATABASE_URL env var, e.g.:
    postgresql://user:password@localhost:5432/hr_management
No other code changes are needed — SQLAlchemy handles both.
"""
import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./hr_management.db")

connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
engine = create_engine(DATABASE_URL, connect_args=connect_args)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
