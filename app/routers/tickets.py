from fastapi import APIRouter, Depends, HTTPException, status
from app.schemas import EventCreate, EventOut, UserOut
from app.models import Event, Seat, Ticket, Order
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

#情境：使用者選擇活動，查看活動座位
@router.get("/events/{event_id}/seats", tags=["Tickets"])
def get_available_seats(event_id: int, db: Session = Depends(get_db)):
    print("hi from get_available_seats")
    event = db.query(Event).filter(Event.event_id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    print("event", event)
    venue_id = event.venue_id
    print("venue_id", venue_id)
    seats = db.query(Seat).filter(
        Seat.venue_id == venue_id,
    ).all()
    return seats

#情境：使用者選擇座位，查看座位類型、是否有人
@router.get("/events/{event_id}/designated_seats", tags=["Tickets"])
def get_designated_seats(event_id: int, seat_number: int, db: Session = Depends(get_db)):
    event = db.query(Event).filter(Event.event_id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    seats = db.query(Seat).filter(
        Seat.venue_id == event.venue_id,
        Seat.seat_number == seat_number,
    ).first()
    
    return seats
'''
# Get a user's ticket
@router.get("/tickets/{user_id}", tags=["Tickets"])
def get_tickets_by_user(user_id: int, db: Session = Depends(get_db)):
    tickets = db.query(Ticket).join(Order).filter(Order.user_id == user_id).all()
    return tickets
'''
# Search for sold tickets by event
@router.get("/events/{event_id}/sold_tickets", tags=["Tickets"])
def get_sold_tickets(event_id: int, db: Session = Depends(get_db)):
    tickets = db.query(Ticket).filter(Ticket.event_id == event_id).all()
    return tickets



'''
@router.post("/tickets", tags=["Tickets"])
def select_ticket(event_id: int, seat_number: int, db: Session = Depends(get_db)):
    seats = db.query(Seat).filter(
        Seat.venue_id == venue_id,
        Seat.seat_number == seat_number,
    ).all()
    if not seat:
        raise HTTPException(status_code=404, detail="Seat not found")

    ticket = db.query(Ticket).filter(
        Ticket.event_id == event_id,
        Ticket.seat_id == seat_id,
        Ticket.status == "Available"
    ).first()
    if not ticket:
        raise HTTPException(status_code=400, detail="Ticket unavailable")

    ticket.status = "Reserved"
    db.commit()
    return ticket
'''