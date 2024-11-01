"""
dependencies.py 模組包含了 FastAPI 應用中的依賴項，實作了用戶驗證。
"""
from typing import List
import os
from dotenv import load_dotenv 

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt

from sqlalchemy.orm import Session
from app.models import User
from app.crud import get_user
from app.database_connection import get_db

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256" # 加密算法

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = get_user(db, user_id=int(user_id))
    if user is None:
        raise credentials_exception
    return user

def get_current_active_user(current_user: User = Depends(get_current_user)) -> User:
    # 可以在這裡檢查用戶是否激活或其他狀態
    return current_user

def require_role(required_roles: List[str]):
    def role_dependency(current_user: User = Depends(get_current_active_user)):
        if current_user.role not in required_roles:
            raise HTTPException(status_code=403, detail="Operation not permitted")
        return current_user
    return role_dependency
