# NTU-Database-Management

## Installation

**Backend**
> pip install "fastapi[standard]"
> pip install "uvicorn[standard]"
> pip install python-jose[cryptography]

如果問題仍然存在，請嘗試重啟 Python 語言伺服器：

Ctrl+Shift+P（或 Cmd+Shift+P）並選擇 Python: Restart Language Server。

**Frontend**
> sudo rm -rf ~/.npm/_npx
> npx create-next-app@latest --use-npm supabase-nextjs
> npx create-next-app nextjs //影片中的做法
> sudo npm install axios bootstrap //功能：
> sudo chown -R $USER:staff /Users/bowen/fastapi_prac/frontend/src/app

## Execution

**Server**
> uvicorn app.main:app --reload

**Client**
> sudo npm run dev

## 
python: 3.11版(3.9也行)，各種package才能順利運行

'''
pip3 install fastapi uvicorn supabase-py sqlalchemy alembic python-dotenv supabase
pip3 install bcrypt
pip3 install passlib[bcrypt] python-jose
'''

## Update Log
---
> ### 2024/12/02.a
> Add codes to events.py, some functions to crud.py to deal with event operation (yet to debug)
> Add data generation codes (users, venues, events) and update in supabase

> ### 2024/12/02.b
> Finish the function of searching for events.py

> ### 2024/12/02.c
> Finish the fake data which satisfy that "every ticket is belong to an order"

> ### 2024/12/03.a
> Implement the function create_event successfully!

> ### 2024/12/03.b
> Implement the function of searching for seats in tickets.py

> ### 2024/12/03.c
> Implement the function of creating a ticket in orders.py