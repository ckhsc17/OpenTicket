from fastapi import APIRouter, Depends, HTTPException, status
from app.schemas import EventCreate, EventOut, UserOut, PaymentOut, PaymentCreate
from app.models import Event, Seat, Ticket, Order, Payment
from app.dependencies import user_dependency, db_dependency
#from app.routers.auth import SECRET_KEY, ALGORITHM  # 导入 SECRET_KEY 和 ALGORITHM
from app.crud import get_user, get_user_by_email
from app.crud import get_event, get_events, create_event, join_event, leave_event
from sqlalchemy.orm import Session
from app.database_connection import get_db
from passlib.context import CryptContext
from datetime import datetime, timedelta
from jose import JWTError, jwt
from typing import Optional
import os
from dotenv import load_dotenv
from pydantic import BaseModel
from typing import List
from fastapi.security import OAuth2PasswordBearer

router = APIRouter()

# Get payments by order
@router.get("/payments/{order_id}", response_model=List[PaymentOut], tags=["Payments"])
def get_payments_by_order(order_id: int, db: Session = Depends(get_db)):
    payments = db.query(Payment).filter(Payment.order_id == order_id).all()
    if not payments:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Payments not found")
    return payments