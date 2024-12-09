"""
dependencies.py 模組包含了 FastAPI 應用中的依賴項，實作了用戶驗證。
"""

import os
from typing import List
from arrow import get
from dotenv import load_dotenv 
from datetime import datetime, timedelta, timezone

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from passlib.context import CryptContext
from jose import JWTError, jwt
from pydantic import BaseModel

from sqlalchemy.orm import Session
from app.models import User, UserRole
from app.database_connection import get_db
from app.crud import get_user_by_email, get_user

load_dotenv()
SECRET_KEY = os.getenv("SECRET_KEY")
if SECRET_KEY is None:
    raise ValueError("SECRET_KEY is not set")
else:
    SECRET_KEY = str(SECRET_KEY)  # 確保 SECRET_KEY 是字串類型

ALGORITHM = "HS256" # 加密算法
ACCESS_TOKEN_EXPIRE_MINUTES = 30 # token 過期時間

class Login(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

bcrypt_context = CryptContext(schemes=['bcrypt'], deprecated='auto') # 密碼加密上下文
oauth2_bearer = OAuth2PasswordBearer(tokenUrl='auth/token') # oauth2_bearer 是一個 OAuth2 密碼模式的 token，用於驗證用戶


# Get current user
async def get_current_user(
        db: Session = Depends(get_db), 
        token: str = Depends(oauth2_bearer)
        ) -> User:

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM]) # type: ignore
        user_id = payload.get("id")

        if user_id is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
        # 確保 user_id 是整數
        
        user = get_user(db, int(user_id))
        if user is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
        return user
    
    except (JWTError, ValueError):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token is invalid")

def require_role(required_roles: List[str]):
    def role_dependency(current_user: User = Depends(get_current_user)):
        if current_user.role not in required_roles:
            raise HTTPException(status_code=403, detail="Operation not permitted")
        return current_user
    return role_dependency

# 這個token 會在登陸成功後回傳給前端，前端在每次發送請求時都要帶著這個token，而加密的方式是用jwt
def create_access_token(username: str, user_id: int, expires_delta: timedelta):
    encode = {'sub': username, 'id': user_id}
    expires = datetime.now(timezone.utc) + expires_delta
    encode.update({'exp': expires})
    return jwt.encode(encode, SECRET_KEY, algorithm=ALGORITHM) # type: ignore

def check_organizer_role(user: User):
    if str(user.role) != UserRole.Organizer:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only organizers can perform this action")

def check_admin_role(user: User):
    if str(user.role) != UserRole.Admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only admins can perform this action")

def verify_password(plain_password, hashed_password):
    return bcrypt_context.verify(plain_password, hashed_password)

def authenticate_user(email: str, password: str, db: Session = Depends(get_db)):
    user = get_user_by_email(db, email)
    if not user:
        return False
    if not verify_password(password, user.password):
        return False
    return user
