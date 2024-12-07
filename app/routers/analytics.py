from fastapi import APIRouter, Depends, HTTPException
from app.models import Event, Seat, Ticket, Order, Venue
from sqlalchemy.orm import Session
from app.database_connection import get_db
from typing import List
from app.schemas import EventAnalytics, OrderOut

router = APIRouter()

@router.get("/analysis/events/{event_id}", response_model=EventAnalytics, tags=["Analytics"])
def get_event_analysis(event_id: int, db: Session = Depends(get_db)):
    # 獲取活動的座位總數
    total_seats = db.query(Seat).filter(Seat.venue_id == Event.venue_id).count()

    # 獲取已售座位數
    utilized_seats = db.query(Ticket).filter(Ticket.event_id == event_id, Ticket.order_id.isnot(None)).count()

    # 計算座位利用率
    seat_utilization = (utilized_seats / total_seats * 100) if total_seats > 0 else 0

    # 獲取活動的總銷售額
    total_sales = db.query(Ticket).filter(Ticket.event_id == event_id, Ticket.order_id.isnot(None)).join(Order).with_entities(Ticket.price).all()
    total_sales = sum(ticket.price for ticket in total_sales)

    # 獲取活動的參加人數
    total_participants = db.query(Order).join(Ticket).filter(Ticket.event_id == event_id).distinct(Order.user_id).count()

    event = db.query(Event).filter(Event.event_id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    venue = db.query(Venue).filter(Venue.venue_id == event.venue_id).first()
    if not venue:
        raise HTTPException(status_code=404, detail="Venue not found")
    
    venue_name = str(venue.venue_name)

    return EventAnalytics(
        event_id=event_id,
        event_name=str(event.event_name),
        performer=str(event.performer),
        event_date=event.event_date.strftime("%Y-%m-%d"),
        venue_id=event.venue_id, # type: ignore
        description=str(event.description),
        total_sales=float(total_sales),
        total_seats=total_seats,
        utilized_seats=utilized_seats,
        seat_utilization=round(seat_utilization, 2),
        total_participants=total_participants,
        venue=venue_name
    )
    
@router.get("/analysis/organizer/{organizer_id}", response_model=List[EventAnalytics], tags=["Analytics"])
def get_organizer_analysis(organizer_id: int, db: Session = Depends(get_db)):
    # 獲取組織者的所有活動
    events = db.query(Event).filter(Event.organizer_id == organizer_id).all()
    print(events)

    # 獲取每個活動的分析數據
    analytics = []
    for event in events:
        total_seats = db.query(Seat).filter(Seat.venue_id == event.venue_id).count()
        utilized_seats = db.query(Ticket).filter(Ticket.event_id == event.event_id, Ticket.order_id.isnot(None)).count()
        seat_utilization = (utilized_seats / total_seats * 100) if total_seats > 0 else 0

        total_sales = db.query(Ticket).filter(Ticket.event_id == event.event_id, Ticket.order_id.isnot(None)).join(Order).with_entities(Ticket.price).all()
        total_sales = sum(ticket.price for ticket in total_sales)

        total_participants = db.query(Order).join(Ticket).filter(Ticket.event_id == event.event_id).distinct(Order.user_id).count()

        venue = db.query(Venue).filter(Venue.venue_id == event.venue_id).first()
        if not venue:
            raise HTTPException(status_code=404, detail="Venue not found")
        venue_name = str(venue.venue_name)

        analytics.append(
            EventAnalytics(
                event_id=event.event_id, # type: ignore
                event_name=str(event.event_name),
                performer=str(event.performer),
                description=str(event.description),
                event_date=event.event_date.strftime("%Y-%m-%d"),
                venue_id=event.venue_id, # type: ignore
                total_sales=float(total_sales),
                total_seats=total_seats,
                utilized_seats=utilized_seats,
                seat_utilization=round(seat_utilization, 2),
                total_participants=total_participants,
                venue=str(venue_name)
            )
        )

    return analytics

# Recent orders
@router.get("/analysis/orders/recent/{organizer_id}", response_model=List[OrderOut], tags=["Analytics"])
def get_recent_orders(organizer_id: int, db: Session = Depends(get_db)):
    orders = db.query(Order).join(Ticket).join(Event).filter(Event.organizer_id == organizer_id).order_by(Order.order_date.desc()).limit(10).all()
    return orders