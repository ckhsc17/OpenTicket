# NTU-Database-Management

## Installation

### **Backend**

> pip install fastapi[standard]  
> pip install uvicorn[standard]  
> pip install python-jose[cryptography]  
> pip install python-multipart  

如果問題仍然存在，請嘗試重啟 Python 語言伺服器：

Ctrl+Shift+P（或 Cmd+Shift+P）並選擇 Python: Restart Language Server。

### **Frontend**

> sudo rm -rf ~/.npm/_npx  
> npx create-next-app@latest --use-npm supabase-nextjs  
> npx create-next-app nextjs // 影片中的做法  
> sudo npm install axios bootstrap // 功能：  
> sudo chown -R $USER:staff /Users/bowen/fastapi_prac/frontend/src/app  

## Execution

### **Server**

> uvicorn app.main:app --reload

### **Client**

> sudo npm run dev

### **MUI**

> npm install react@18 react-dom@18  
> npm install @mui/material @emotion/react @emotion/styled  
> npm install @fontsource/roboto  
> npm install @mui/icons-material  

python: 3.11版(3.9也行)，各種package才能順利運行

```python
pip3 install fastapi uvicorn supabase-py sqlalchemy alembic python-dotenv supabase
pip3 install bcrypt
pip3 install passlib[bcrypt] python-jose
```

## Update Log

---

### 2024/12/02.a

> Add codes to events.py, some functions to crud.py to deal with event operation (yet to debug)
> Add data generation codes (users, venues, events) and update in supabase

### 2024/12/02.b

> Finish the function of searching for events.py

### 2024/12/02.c

> Finish the fake data which satisfy that "every ticket is belong to an order"

### 2024/12/03.a

> Implement the function create_event successfully!

### 2024/12/03.b

> Implement the function of searching for seats in tickets.py

### 2024/12/03.c

> Implement the function of creating a ticket in orders.py

### 2024/12/03.d

> Implement the function of searching for orders in payment.py, seats.py.
> Add the function of who is currently login

### 2024/12/05.a

> Implement the function of creating order and ticket after user selects a seat
> Fix some schema issues for users, tickets and orders

### 2024/12/05.b

> Fix data generation

### 2024/12/06.a

> Do some basic setup for frontend

### 2024/12/06.b

> Fix schema and data generation

### 2024/12/06.c
> Fix login bug

### 2024/12/07.a
> Add event looking page and setup frontend routing

### 2024/12/07.b
> Fix seats generating and tickets history for users

### 2024/12/07.c
> Add seat page, payment page to the frontend
>
> Implement create payment and update payment to the backend

### 2024/12/07.d
> Fix the routing of seat and auth
>
> Implement create_order in the front end
