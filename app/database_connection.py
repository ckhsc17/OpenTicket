import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# 僅開發模式時才讀 .env
if os.environ.get("ENV") != "production":
    from dotenv import load_dotenv
    load_dotenv()

DATABASE_URL = os.getenv("SUPABASE_DB_URL")

if not DATABASE_URL:
    print("❌ Environment variable SUPABASE_DB_URL not found.")
    raise RuntimeError("❌ SUPABASE_DB_URL is not set. Check your environment variables.")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
