from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from schemas import EventAnalytics, OrderOut
from crud import count_total_seats, utilized_seats, total_sales, total_participants, get_event, get_venue, get_recent_orders, get_events_by_organizer
from database_connection import get_db

router = APIRouter()

@router.get("/analysis/events/{event_id}", response_model=EventAnalytics, tags=["Analytics"])
def get_event_analysis(event_id: int, db: Session = Depends(get_db)):
    # 獲取活動的座位總數
    Total_seats = count_total_seats(db, event_id)

    # 獲取已售座位數
    Utilized_seats = utilized_seats(db, event_id)

    # 計算座位利用率
    seat_utilization = (Utilized_seats / Total_seats * 100) if Total_seats > 0 else 0

    # 獲取活動的總銷售額
    Total_sales = total_sales(db, event_id)

    # 獲取活動的參加人數
    Total_participants = total_participants(db, event_id)
    
    event = get_event(db, event_id)
    
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    venue = get_venue(db, event.venue_id)
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
        total_sales=float(Total_sales),
        total_seats=Total_seats,
        utilized_seats=Utilized_seats,
        seat_utilization=round(seat_utilization, 2),
        total_participants=Total_participants,
        venue=venue_name
    )
    
@router.get("/analysis/organizer/{organizer_id}", response_model=List[EventAnalytics], tags=["Analytics"])
def get_organizer_analysis(organizer_id: int, db: Session = Depends(get_db)):
    # 獲取組織者的所有活動
    events = get_events_by_organizer(db, organizer_id)

    # 獲取每個活動的分析數據
    analytics = []
    for event in events:
        total_seats = count_total_seats(db, event.event_id)
        Utilized_seats = utilized_seats(db, event.event_id)
        seat_utilization = (Utilized_seats / total_seats * 100) if total_seats > 0 else 0
        Total_sales = total_sales(db, event.event_id)
        Total_participants = total_participants(db, event.event_id)

        venue = get_venue(db, event.venue_id)
        if not venue:
            raise HTTPException(status_code=404, detail="Venue not found")
        venue_name = str(venue.venue_name)

        analytics.append(
            EventAnalytics(
                event_id=event.event_id,
                event_name=str(event.event_name),
                performer=str(event.performer),
                description=str(event.description),
                event_date=event.event_date.strftime("%Y-%m-%d"),
                venue_id=event.venue_id,
                total_sales=float(Total_sales),
                total_seats=total_seats,
                utilized_seats=Utilized_seats,
                seat_utilization=round(seat_utilization, 2),
                total_participants=Total_participants,
                venue=venue_name
            )
        )

    return analytics

# Recent orders
@router.get("/analysis/orders/recent/{organizer_id}", response_model=List[OrderOut], tags=["Analytics"])
def recent_order(organizer_id: int, db: Session = Depends(get_db)):
    orders = get_recent_orders(db, organizer_id)
    return orders