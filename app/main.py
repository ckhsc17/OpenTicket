"""
main.py 模組是 FastAPI 應用的入口點，用於創建 FastAPI 應用實例、設置路由、中間件等。
uvicorn 命令行工具將使用此模組中的 app 實例來啟動 FastAPI 應用。
"""

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# 從 app.routers 導入各個模組的路由
from app.routers import analytics, auth, events, tickets, orders, payments, seats

# 創建 FastAPI 應用實例，並設置應用的標題
app = FastAPI(
    title="OpenTicket API",
    description="一個用於管理和購買活動票券的後端服務。",
    version="1.0.0"
)

# 設置允許跨來源資源共享（CORS）的來源。這裏允許所有來源
origins = [
    "*",  # 允許所有來源
    # 您也可以指定具體的前端應用網址，例如：
    # "http://localhost",
    "http://localhost:3000",
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

# 定義根路由，提供簡單的健康檢查或歡迎訊息
@app.get("/")
async def read_root():
    return {"message": "Welcome to OpenTicket API"}

# 定義一個健康檢查路由
@app.get("/health")
async def health_check():
    return {"status": "OK"}

app.include_router(auth.router) 
app.include_router(events.router) 
app.include_router(tickets.router)
app.include_router(orders.router) 
app.include_router(seats.router) 
app.include_router(payments.router) 
app.include_router(analytics.router)
# app.include_router(users.router)

if __name__ == "__main__":
    import os
    port = int(os.environ.get("PORT", 8000))  # 預設為 8000，但也支援環境變數 PORT
    uvicorn.run("main:app", host="0.0.0.0", port=port) #reload=True