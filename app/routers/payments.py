import time
from fastapi import APIRouter, Depends, HTTPException, status
from app.schemas import EventCreate, EventOut, UserOut, PaymentOut, PaymentCreate
from app.models import Event, Seat, Ticket, Order, Payment, PaymentStatus
from app.dependencies import user_dependency
from app.crud import get_payment, get_orders_list, create_payment, cancel_payment
from sqlalchemy.orm import Session
from app.database_connection import get_db
from typing import List

router = APIRouter()

# Get payments by order
@router.get("/payments/{order_id}", response_model=List[PaymentOut], tags=["Payments"])
def get_payments_by_order(
    order_id: int, 
    db: Session = Depends(get_db)
    ):
    
    payments = db.query(Payment).filter(Payment.order_id == order_id).all() 
    
    if payments is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Payments not found")
    
    return payments

# Get payments by user
@router.get("/payments/user/{user_id}", response_model=List[PaymentOut], tags=["Payments"])
def get_payments_by_user(user_id: int, db: Session = Depends(get_db)):
    # 從 order 中找出 user_id 相同的 order
    orders = get_orders_list(db, user_id)
    
    payments = []
    for order in orders:
        payments += db.query(Payment).filter(Payment.order_id == order.order_id).all()
    if not payments:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Payments not found")
    return payments

'''
# 確認支付
@router.post("/payments/confirm/{payment_id}", response_model=PaymentOut, tags=["Payments"])
def router_confirm_payment(payment_id: int, db: Session = Depends(get_db)):
    db_payment = confirm_payment(db, payment_id)
    if not db_payment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Payment not found")

    return db_payment
'''
    
# Create payment
@router.post("/payments", response_model=PaymentOut, tags=["Payments"])
def confirm_payment(payment: PaymentCreate, db: Session = Depends(get_db)):
    payment = create_payment(db, payment)
    return payment

# 取消支付
@router.post("/payments/cancel/{payment_id}", response_model=PaymentOut, tags=["Payments"])
def router_cancel_payment(payment_id: int, db: Session = Depends(get_db)):
    db_payment = cancel_payment(db, payment_id)
    if not db_payment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Payment not found")

    return db_payment

@router.get("/payments/status/{payment_id}", response_model=PaymentStatus, tags=["Payments"])
def get_payment_status(payment_id: int, db: Session = Depends(get_db)):
    payment = get_payment(db, payment_id)
    if not payment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Payment not found")

    return payment.status
