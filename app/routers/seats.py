from arrow import get
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List

from dependencies import get_current_user
from schemas import TicketCreate, OrderCreate
from models import Event, SeatStatus
from crud import create_tickets, create_order, update_seat, get_seats, get_event
from routers.tickets import get_designated_seats
from database_connection import get_db


class SeatUpdateRequest(BaseModel):
    seat_numbers: List[int]
    status: SeatStatus

router = APIRouter()

# Search for available seats by event
@router.get("/events/{event_id}/get_seats", tags=["Seats"])
def get_all_seats(event_id: int, db: Session = Depends(get_db)):
    event = get_event(db, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    venue_id = event.venue_id
    #reserved_seats = db.query(Ticket).filter(Ticket.event_id == event_id).all() #如果ticket是動態生成的，這裡會有問題
    
    seats = get_seats(db, venue_id)
    
    return seats

# Confirm a seat, check if it's available then create an order and ticket
@router.post("/events/{event_id}/confirm_seat", tags=["Seats"])
def confirm_seat(
    ticketCreate: TicketCreate, 
    orderCreate: OrderCreate, 
    db: Session = Depends(get_db)
    ):
    #ticket.venue_id = event.venue_id #venue_id由後端取得
    #reserved_seats = db.query(Ticket).filter(Ticket.event_id == event_id).all()
    
    if (get_designated_seats(ticketCreate.event_id, ticketCreate.seat_number, db) == None):
        raise HTTPException(status_code=404, detail="Seat not found")
    #檢查designated_seats是否有人:待實作

    # Check if the user is logged in
    '''
    reserved_seat_numbers = [ticket.seat_number for ticket in reserved_seats]
    
    if seat_number in reserved_seat_numbers:
        raise HTTPException(status_code=400, detail="Seat is already taken")
    '''
    new_order = create_order(db, orderCreate)
    
    # create multiple tickets
    ticketCreate = create_tickets(db, ticketCreate)  
    #order.user_id = current_user.user_id
    return {"order_id": new_order.order_id, "ticket_id": ticketCreate.ticket_id}

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