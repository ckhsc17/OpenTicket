from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from app.schemas import UserCreate, UserOut
from app.models import User
from app.crud import create_user, get_user_by_email, get_user
from sqlalchemy.orm import Session
from app.database_connection import get_db
from passlib.context import CryptContext
from datetime import datetime, timedelta, timezone
from jose import JWTError, jwt
from typing import Optional
import os
from dotenv import load_dotenv
from pydantic import BaseModel
from fastapi.security import OAuth2PasswordBearer
#from app.dependencies import db_dependency

#oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")  # This will look for the token in the 'Authorization' header

load_dotenv() # 載入 .env 檔案

router = APIRouter(
    prefix="/auth",
)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT 配置
SECRET_KEY = os.getenv("SECRET_KEY") 
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

class Login(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def authenticate_user(email: str, password: str, db: Session = Depends(get_db)):
    user = get_user_by_email(db, email)
    if not user:
        return False
    if not verify_password(password, user.password):
        return False
    return user
# 這個token 會在登入成功後回傳給前端，前端在每次發送請求時都要帶著這個token，而加密的方式是用jwt
def create_access_token(username: str, user_id: int, expires_delta: timedelta):
    encode = {'sub': username, 'id': user_id}
    expires = datetime.now(timezone.utc) + expires_delta
    encode.update({'exp': expires})
    return jwt.encode(encode, SECRET_KEY, algorithm=ALGORITHM)

def check_organizer_role(user: User):
    if user.role != "Organizer":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only organizers can perform this action")
'''
async def get_current_user(db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)):
    print("hi from get_current_user function call")
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        print("payload", payload)
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token is invalid",
            )
        user = get_user(db, user_id)
        print("hi from get_current_user")
        if user is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found",
            )
        return user
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token is invalid",
        )
'''
''' 
def test(token: str = Depends(oauth2_scheme)):
    print("Received Token:", token)  # 這會顯示從 Authorization 標頭中提取的 token
    # 以下是處理 token 的邏輯
    if not token:
        raise HTTPException(status_code=401, detail="Token is missing")
    # 這裡可以繼續解碼 token 或其他處理
''' 
@router.post("/register", response_model=UserOut, tags=["Authentication"])
def register(user: UserCreate, db: Session = Depends(get_db)):
    existing_user = get_user_by_email(db, user.email)
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    db_user = create_user(db, user)
    return db_user

@router.post("/login", tags=["Authentication"])
def login(credentials: Login, db: Session = Depends(get_db)):
    print("hi login")
    user = authenticate_user(credentials.email, credentials.password, db)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        #data={"sub": str(user.user_id)}, expires_delta=access_token_expires
        username=user.username,
        user_id=user.user_id,
        expires_delta=access_token_expires
    )
    #oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")  # This will look for the token in the 'Authorization' header
    print("hi login2")
    print("access_token", access_token)
    return {"access_token": access_token, "token_type": "bearer"}

@router.post('/token', response_model=Token)
async def login_for_access_token(form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
                                 db: Session = Depends(get_db)): #FastAPI 自動解析請求中的表單數據，生成 OAuth2PasswordRequestForm 類型的對象，並注入到 form_data 中。
    user = authenticate_user(form_data.username, form_data.password, db)
    if not user:
        print("hi from login_for_access_token")
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Could not validate user")
    token = create_access_token(user.username, user.user_id, timedelta(minutes=20))
    
    return {'access_token': token, 'token_type': 'bearer'}

# Get current user
async def get_current_user(db: Session = Depends(get_db), token: str = Depends(OAuth2PasswordBearer(tokenUrl="token"))):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("id")
        if user_id is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token is invalid")
        user = get_user(db, user_id)
        if user is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
        return user
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token is invalid")

@router.get("/users/me", response_model=UserOut, tags=["Authentication"])
async def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user