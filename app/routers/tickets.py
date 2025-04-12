from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from schemas import TicketCreate
from models import Event, Seat, Ticket, Order
from crud import create_tickets, get_ticket_by_ticket_id
from database_connection import get_db

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
        Seat.status == "Available"
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

# Search for sold tickets by user
@router.get("/users/{user_id}/sold_tickets", tags=["Tickets"])
def get_sold_tickets_by_user(user_id: int, db: Session = Depends(get_db)):
    tickets = db.query(Ticket).join(Order).filter(Order.user_id == user_id).all()
    return tickets

@router.post("/tickets", tags=["Tickets"]) #response_model=List[TicketOut]
def create_one_or_multiple_tickets(ticket: List[TicketCreate], db: Session = Depends(get_db)):
    print("hi from create_one_or_multiple_tickets")
    print("ticket", ticket)
    new_ticket = create_tickets(db, ticket)
    return new_ticket

@router.get("/tickets/{ticket_id}", tags=["Tickets"])
def get_ticket(ticket_id: int, db: Session = Depends(get_db)):
    ticket = get_ticket_by_ticket_id(db, ticket_id)
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    return ticket

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