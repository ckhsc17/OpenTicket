from fastapi import APIRouter, Depends, HTTPException, status
from app.schemas import EventCreate, EventOut, UserOut, OrderCreate, OrderOut
from app.models import Event, Seat, Ticket, Order
from app.dependencies import user_dependency, db_dependency
#from app.routers.auth import SECRET_KEY, ALGORITHM  # 导入 SECRET_KEY 和 ALGORITHM
from app.crud import get_user, get_user_by_email, create_order, get_orders_by_event
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

@router.get("/orders/{user_id}", response_model=List[OrderOut], tags=["Orders"])
def get_orders_by_user(user_id: int, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.user_id == user_id).all()
    return order

@router.get("/orders/{event_id}", response_model=List[OrderOut], tags=["Orders"])
def get_orders_by_event(event_id: int, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.event_id == event_id).all()
    return order

@router.post("/orders", response_model=OrderOut, tags=["Orders"])
def create_order_for_user(order: OrderCreate, db: Session = Depends(get_db)):
    new_order = create_order(db, order)
    return new_order