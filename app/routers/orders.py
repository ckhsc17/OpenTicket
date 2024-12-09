from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.schemas import OrderCreate, OrderOut
from app.models import User, Event, Order, OrderStatus
from app.crud import  create_order,  update_order
from app.database_connection import get_db

router = APIRouter()

@router.get("/orders/{user_id}", response_model=List[OrderOut], tags=["Orders"])
def get_orders_by_user(user_id: int, db: Session = Depends(get_db)):
    
    # check if user is in the database
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    
    order = db.query(Order).filter(Order.user_id == user_id).all()

    return order

@router.get("/orders/{event_id}", response_model=List[OrderOut], tags=["Orders"])
def get_orders_by_event(event_id: int, db: Session = Depends(get_db)):

    # check if event is in the database
    event = db.query(Event).filter(Event.event_id == event_id).first()
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found")

    order = db.query(Order).filter(Order.event_id == event_id).all()
    return order

@router.post("/orders", response_model=OrderOut, tags=["Orders"])
def create_order_for_user(order: OrderCreate, db: Session = Depends(get_db)):
    print("hi from create_order_for_user")
    # check if user is in the database
    user = db.query(User).filter(User.user_id == order.user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    
    print("order", order)
    new_order = create_order(db, order)
    print("new_order", new_order.order_id)
    return new_order

# cancel an order
@router.put("/orders/{order_id}/cancel", tags=["Orders"])
async def cancel_order(order_id: int, db: Session = Depends(get_db)):
    print("hi from cancel_order")
    update_order(db, order_id, OrderStatus.Canceled)
