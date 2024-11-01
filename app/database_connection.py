import os
from dotenv import load_dotenv

# 處理資料庫的建置
from sqlalchemy.orm import Session
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models import Base
load_dotenv() # 載入 .env 檔案

DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_engine(DATABASE_URL) # 使用 create_engine 函數創建一個資料庫引擎（Engine），這個引擎是與資料庫交互的核心組件。
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine) 

# 初始化資料庫
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
