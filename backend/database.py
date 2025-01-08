from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Connect to PostgreSQL database
SQLALCHEMY_DATABASE_URL = "postgresql+psycopg2://postgres:10004@104.155.99.76:5432/postgres"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()