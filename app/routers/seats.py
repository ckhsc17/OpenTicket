from fastapi import APIRouter, Depends, HTTPException, status, Query
from app.schemas import TicketCreate, OrderCreate, EventOut, UserOut
from app.models import Event, Seat, Ticket, Order
from app.dependencies import user_dependency, db_dependency
#from app.routers.auth import SECRET_KEY, ALGORITHM  # 导入 SECRET_KEY 和 ALGORITHM
from app.crud import get_user, get_user_by_email
from app.crud import create_tickets, create_order, update_seat
from app.routers.tickets import get_designated_seats
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

from pydantic import BaseModel
from typing import List

class SeatUpdateRequest(BaseModel):
    seat_numbers: List[int]
    status: str


router = APIRouter()


# Search for available seats by event
@router.get("/events/{event_id}/available_seats", tags=["Seats"])
def get_available_seats(event_id: int, db: Session = Depends(get_db)):
    event = db.query(Event).filter(Event.event_id == event_id).first()
    venue_id = event.venue_id
    reserved_seats = db.query(Ticket).filter(Ticket.event_id == event_id).all() #如果ticket是動態生成的，這裡會有問題
    all_seats = db.query(Seat).filter(Seat.venue_id == venue_id).all()
    reserved_seat_numbers = [ticket.seat_number for ticket in reserved_seats]
    
    available_seats = [seat for seat in all_seats if seat.seat_number not in reserved_seat_numbers]
    
    return available_seats

# Confirm a seat, check if it's available then create an order and ticket
@router.post("/events/{event_id}/confirm_seat", tags=["Seats"])
def confirm_seat(ticket: TicketCreate, order: OrderCreate, current_user: user_dependency, db: Session = Depends(get_db)): #event_id到時會由前端傳入
    event = db.query(Event).filter(Event.event_id == ticket.event_id).first()
    #ticket.venue_id = event.venue_id #venue_id由後端取得
    #reserved_seats = db.query(Ticket).filter(Ticket.event_id == event_id).all()
    if (get_designated_seats(ticket.event_id, ticket.seat_number, db) == None):
        raise HTTPException(status_code=404, detail="Seat not found")
    #檢查designated_seats是否有人:待實作

    # Check if the user is logged in
    if not current_user:
        raise HTTPException(status_code=401, detail="Unauthorized")
    '''
    reserved_seat_numbers = [ticket.seat_number for ticket in reserved_seats]
    
    if seat_number in reserved_seat_numbers:
        raise HTTPException(status_code=400, detail="Seat is already taken")
    '''
    new_order = create_order(db, order, current_user.get('id'))
    #get order_id
    #order_id = db.query(Order).filter(Order.user_id == current_user.user_id).first().order_id
    ticket = create_tickets(db, ticket)  
    #order.user_id = current_user.user_id
    
    
    return {"order_id": new_order.order_id, "ticket_id": ticket.ticket_id}

'''
# update seat status
@router.put("/seats/{venue_id}/update_seat", tags=["Seats"])
async def update_seat_status(venue_id: int, status: str, seat_numbers: List[int], db: Session = Depends(get_db)): #= Query(...)
    #status = "Sold" 
    print("hi from update_seat_status")
    print("venue_id", venue_id)
    print("status", status)
    print("seat_numbers", seat_numbers)
    update_seat(db, venue_id, status, seat_numbers)
'''
@router.put("/seats/{venue_id}/update_seat", tags=["Seats"])
async def update_seat_status(
    venue_id: int, 
    request: SeatUpdateRequest, 
    db: Session = Depends(get_db)
):
    print("venue_id", venue_id)
    print("status", request.status)
    print("seat_numbers", request.seat_numbers)
    update_seat(db, venue_id, request.status, request.seat_numbers)