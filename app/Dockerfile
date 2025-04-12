# 使用 Python 基底映像檔
FROM python:3.8.16-slim

# 設定工作目錄
WORKDIR /app

# 安裝必要的套件
COPY backend/requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

# 複製程式碼
COPY backend/ .

# 啟動 FastAPI with Uvicorn
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]
