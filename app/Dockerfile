# 使用 Python 基底映像檔
FROM python:3.8.16-slim

# 設定工作目錄
WORKDIR /app

# 複製需求檔案並安裝
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 複製整個應用程式碼
COPY . .

# 設定容器執行時的 Port
EXPOSE 8080

# 開啟 Uvicorn 啟動 FastAPI
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]
