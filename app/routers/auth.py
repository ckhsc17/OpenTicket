from typing import Annotated
from dotenv import load_dotenv
from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.schemas import UserCreate, UserOut
from app.models import User
from app.crud import create_user, get_user_by_email
from app.database_connection import get_db
from app.dependencies import (
    authenticate_user,
    get_current_user,
    create_access_token,
    Login,
    Token,
    ACCESS_TOKEN_EXPIRE_MINUTES
)

load_dotenv() # 載入 .env 檔案

router = APIRouter(
    prefix="/auth",
)

@router.post("/register", response_model=UserOut, tags=["Authentication"])
def register(user: UserCreate, db: Session = Depends(get_db)):
    existing_user = get_user_by_email(db, user.email)
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    db_user = create_user(db, user)
    return db_user

@router.post("/login", response_model=Token, tags=["Authentication"])
def login(credentials: Login, db: Session = Depends(get_db)):
    
    user = authenticate_user(credentials.email, credentials.password, db)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        username=str(user.username), # 將 username 轉換為字串
        user_id=int(user.user_id), # type: ignore 使用 scalar() 方法獲取純量值
        expires_delta=access_token_expires
    )
    print("access_token", access_token) 
    return {"access_token": access_token, "token_type": "bearer"}

@router.post('/token', response_model=Token, tags=["Authentication"])
async def login_for_access_token(form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
                                 db: Session = Depends(get_db)): 
    user = authenticate_user(form_data.username, form_data.password, db)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        username=str(user.username), # 將 username 轉換為字串
        user_id=int(user.user_id), # type: ignore 使用 scalar() 方法獲取純量值 
        expires_delta=access_token_expires
    )
    print("access_token", access_token) 
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/users/me", response_model=UserOut, tags=["Authentication"])
async def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user