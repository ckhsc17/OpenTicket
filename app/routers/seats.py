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


# Search for available seats by event
@router.get("/events/{event_id}/available_seats", tags=["Seats"])
def get_available_seats(event_id: int, db: Session = Depends(get_db)):
    event = db.query(Event).filter(Event.event_id == event_id).first()
    vanue_id = event.venue_id
    reserved_seats = db.query(Ticket).filter(Ticket.event_id == event_id).all()
    all_seats = db.query(Seat).filter(Seat.venue_id == vanue_id).all()
    reserved_seat_numbers = [ticket.seat_number for ticket in reserved_seats]
    
    available_seats = [seat for seat in all_seats if seat.seat_number not in reserved_seat_numbers]
    
    return available_seats