from fastapi import APIRouter, Depends, HTTPException, status
from app.schemas import EventCreate, EventOut, UserOut, PaymentOut, PaymentCreate
from app.models import Event, Seat, Ticket, Order, Payment
from app.dependencies import user_dependency, db_dependency
#from app.routers.auth import SECRET_KEY, ALGORITHM  # 导入 SECRET_KEY 和 ALGORITHM
from app.crud import get_user, get_user_by_email
from app.crud import create_payment
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

# Get payments by user
@router.get("/payments/user/{user_id}", response_model=List[PaymentOut], tags=["Payments"])
def get_payments_by_user(user_id: int, db: Session = Depends(get_db)):
    orders = db.query(Order).filter(Order.user_id == user_id).all()
    payments = []
    for order in orders:
        payments += db.query(Payment).filter(Payment.order_id == order.order_id).all()
    if not payments:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Payments not found")
    return payments

@router.get("/payments", response_model=List[PaymentOut], tags=["Payments"])
def pay(status: bool, current_user: user_dependency, payment: PaymentCreate, db: Session = Depends(get_db)):
    if not current_user:
        raise HTTPException(status_code=401, detail="Unauthorized")
    #create_payment
    payment.u
    payment = create_payment(db, payment)
    if (status):
        payment = Payment(user_id=current_user.user_id, order_id=1, payment_date=datetime.now())
        db.add(payment)
        db.commit()
        db.refresh(payment)
        return payment
    
@router.get("/payments/status", response_model=List[PaymentOut], tags=["Payments"])
def get_payment_status(payment_id: int, db: Session = Depends(get_db)):
    payment = db.query(Payment).filter(Payment.payment_id == payment_id).first()
    if not payment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Payment not found")
    return payment