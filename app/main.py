import uvicorn
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
# 從 app.routers 導入各個模組的路由
from app.routers import auth, users, events, tickets, orders, payments
from app.dependencies import SessionLocal


# 創建 FastAPI 應用實例，並設置應用的標題
app = FastAPI(
    title="TicketEase 活動訂票系統",
    description="一個用於管理和購買活動票券的後端服務。",
    version="1.0.0"
)

# 設置允許跨來源資源共享（CORS）的來源
# 這裡設置為允許所有來源，根據需求調整
origins = [
    "*",  # 允許所有來源
    # 您也可以指定具體的前端應用網址，例如：
    # "http://localhost",
    # "http://localhost:3000",
    # "https://your-frontend-app.com",
]

# 添加 CORS 中間件到 FastAPI 應用
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,            # 允許的來源
    allow_credentials=True,           # 是否允許憑證
    allow_methods=["*"],              # 允許的 HTTP 方法
    allow_headers=["*"],              # 允許的 HTTP 標頭
)

# 包含各個路由模組到應用中，並設置路由的前綴和標籤
# app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
# app.include_router(users.router, prefix="/users", tags=["Users"])
# app.include_router(events.router, prefix="/events", tags=["Events"])
# app.include_router(tickets.router, prefix="/tickets", tags=["Tickets"])
# app.include_router(orders.router, prefix="/orders", tags=["Orders"])
# app.include_router(payments.router, prefix="/payments", tags=["Payments"])

# 定義根路由，提供簡單的健康檢查或歡迎訊息
@app.get("/")
async def read_root():
    return {"message": "Welcome to TicketEase API"}

# 定義一個健康檢查路由
@app.get("/health")
async def health_check():
    return {"status": "OK"}



# 定義獲取資料庫會話的依賴
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# 將依賴傳遞給路由


if __name__ == "__main__":
    uvicorn.run("main:app", host="localhost", port=8000, reload=True)