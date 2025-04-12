import os
from dotenv import load_dotenv

# 處理資料庫的建置
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.orm import declarative_base
load_dotenv() # 載入 .env 檔案

DATABASE_URL = os.getenv("SUPABASE_DB_URL")
if DATABASE_URL is None:
    raise ValueError("DATABASE_URL is not set")

engine = create_engine(DATABASE_URL) # 使用 create_engine 函數創建一個資料庫引擎（Engine），這個引擎是與資料庫交互的核心組件。
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine) 

# 所有的資料表都應該繼承自 Base 類
Base = declarative_base()

# 初始化資料庫連接，當需要操作資料庫時，調用 get_db() 函數即可獲得一個資料庫 Session，使用完畢後自動關閉。
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
