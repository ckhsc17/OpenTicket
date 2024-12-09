from sqlalchemy.orm import Session
from app.models import SeatStatus, User, Event, Venue, Seat, Ticket, Order, Payment, OrderStatus, PaymentStatus
from app.schemas import (
    UserCreate, UserOut, EventCreate, EventOut,
    VenueCreate, VenueOut, SeatCreate, SeatOut,
    TicketCreate, TicketOut, OrderCreate, OrderOut,
    PaymentCreate, PaymentOut
)
from passlib.context import CryptContext
from typing import List, Optional
from datetime import datetime
from fastapi import HTTPException
from sqlalchemy import and_

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# 密碼加密
def get_password_hash(password):
    return pwd_context.hash(password)

# --- 用戶 CRUD 操作 ---

def create_user(db: Session, user: UserCreate) -> User:
    hashed_password = get_password_hash(user.password)
    db_user = User(
        username=user.username,
        email=user.email,
        password=hashed_password,
        phone=user.phone,
        role=user.role,
        created_at=user.created_at
    )
    db.add(db_user)
    db.commit() 
    db.refresh(db_user)
    return db_user

def get_user(db: Session, user_id: int) -> Optional[User]:
    return db.query(User).filter(User.user_id == user_id).first()

def get_user_by_email(db: Session, email: str) -> Optional[User]:
    return db.query(User).filter(User.email == email).first()

def update_user(db: Session, user_id: int, user_update: UserCreate) -> Optional[User]:
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        return None

    # 使用 setattr 更新屬性
    for key, value in user_update.model_dump(exclude_unset=True).items():
        if key == 'password' and value:
            value = get_password_hash(value)
        setattr(user, key, value)

    db.commit()
    db.refresh(user)
    return user

def delete_user(db: Session, user_id: int) -> bool:
    user = db.query(User).filter(User.user_id == user_id).first()
    
    if not user:
        return False
    
    db.delete(user)
    db.commit()

    return True

# --- 活動 CRUD 操作 ---

def create_event(db: Session, event: EventCreate, organizer_id: int) -> Event:
    db_event = Event(
        organizer_id=organizer_id,
        #event_id=event.event_id,
        event_name=event.event_name,
        performer=event.performer,
        event_date=event.event_date,
        venue_id=event.venue_id,
        #description=event.description, 未來可加入活動描述
        status=event.status
    )
    db.add(db_event)
    db.commit()
    db.refresh(db_event)
    return db_event

def get_event(db: Session, event_id: int) -> Optional[Event]:
    return db.query(Event).filter(Event.event_id == event_id).first()

def get_events(db: Session, skip: int = 0, limit: int = 100) -> List[Event]:
    current_time = datetime.now()
    # return db.query(Event).filter(Event.event_date >= current_time).offset(skip).limit(limit).all()
    return db.query(Event).offset(skip).limit(limit).all()

# 參加活動
def join_event(db: Session, event_id: int, user_id: int):
    db_event = db.query(Event).filter(Event.event_id == event_id).first()
    if db_event:
        #db_event.participants.append(user_id)  # 假設有一個參與者欄位
        db.commit()
        db.refresh(db_event)
    return db_event

def update_event(db: Session, event_id: int, event_update: EventCreate) -> Optional[Event]:
    event = db.query(Event).filter(Event.event_id == event_id).first()
    if not event:
        return None
    
    for key, value in event_update.model_dump(exclude_unset=True).items():
        setattr(event, key, value)
    
    db.commit()
    db.refresh(event)
    
    return event

def leave_event(db: Session, event_id: int, user_id: int):
    db_event = db.query(Event).filter(Event.event_id == event_id).first()
    if db_event:
        #db_event.participants.remove(user_id)  # 假設有一個參與者欄位
        db.commit()
        db.refresh(db_event)
    return db_event

def delete_event(db: Session, event_id: int) -> bool:
    event = db.query(Event).filter(Event.event_id == event_id).first()
    if not event:
        return False
    db.delete(event)
    db.commit()
    return True

# --- 場地 CRUD 操作 ---

def create_venue(db: Session, venue: VenueCreate) -> Venue:
    db_venue = Venue(
        venue_name=venue.venue_name,
        address=venue.address,
        city=venue.city,
        capacity=venue.capacity
    )
    db.add(db_venue)
    db.commit()
    db.refresh(db_venue)
    return db_venue

def get_venue(db: Session, venue_id: int) -> Optional[Venue]:
    return db.query(Venue).filter(Venue.venue_id == venue_id).first()

def get_venues(db: Session, skip: int = 0, limit: int = 100) -> List[Venue]:
    return db.query(Venue).offset(skip).limit(limit).all()

def update_venue(db: Session, venue_id: int, venue_update: VenueCreate) -> Optional[Venue]:
    venue = db.query(Venue).filter(Venue.venue_id == venue_id).first()
    if not venue:
        return None
    
    for key, value in venue_update.model_dump(exclude_unset=True).items():
        setattr(venue, key, value)
    
    db.commit()
    db.refresh(venue)
    return venue

def delete_venue(db: Session, venue_id: int) -> bool:
    venue = db.query(Venue).filter(Venue.venue_id == venue_id).first()
    if not venue:
        return False
    db.delete(venue)
    db.commit()
    return True


# --- 座位 CRUD 操作 ---

def create_seat(db: Session, seat: SeatCreate) -> Seat:
    db_seat = Seat(
        venue_id=seat.venue_id,
        section=seat.section,
        row=seat.row,
        seat_number=seat.seat_number,
        seat_type=seat.seat_type
    )
    db.add(db_seat)
    db.commit()
    db.refresh(db_seat)
    return db_seat

def get_seat(db: Session, seat_id: int) -> Optional[Seat]:
    return db.query(Seat).filter(Seat.seat_id == seat_id).first()

def get_seats(db: Session, venue_id: int) -> List[Seat]:
    return db.query(Seat).filter(Seat.venue_id == venue_id).all()

def update_seat(db: Session, venue_id: int, status: SeatStatus, seat_numbers: List[int]) -> List[Seat]:
    # 查询所有在 seat_numbers 中的座位
    # 查詢符合 venue_id 和 seat_number 的座位
    seats = db.query(Seat).filter(
        and_(Seat.venue_id == venue_id, Seat.seat_number.in_(seat_numbers))
    ).all()
    print("hi from update seat")
    print(len(seats))
    print(type(seats))
    print(seats[0]._status)
    if not seats:
        return []  # 如果没有找到对应的座位
    
    updated_seats = []
    for seat in seats:
        print(seat.seat_number)
        seat._status = status  # 更新每个座位的 status
        print(seat._status)
        updated_seats.append({"seat_id": seat.seat_number, "status": status})  # 保存更新信息
    
    db.commit()  # 提交更改
    
    return updated_seats  # 返回更新后的座位信息


# --- 票券 CRUD 操作 ---

def create_tickets(db: Session, tickets: List[TicketCreate]) -> List[Ticket]:
    db_tickets = [
        Ticket(
            event_id=ticket.event_id,
            order_id=ticket.order_id,
            venue_id=ticket.venue_id, 
            seat_number=ticket.seat_number,
            price=ticket.price,
            type=ticket.type
        )
        for ticket in tickets  # 遍歷 tickets 列表中的每一個票券資料
    ]
    db.add_all(db_tickets) # 這裡要用 add_all()，因為 db_ticket 是一個列表
    db.commit()
    #db.refresh(db_tickets)
    return db_tickets

def get_ticket(db: Session, ticket_id: int) -> Optional[Ticket]:
    return db.query(Ticket).filter(Ticket.ticket_id == ticket_id).first()

def get_tickets(db: Session, event_id: int, status: Optional[str] = None, skip: int = 0, limit: int = 100) -> List[Ticket]:
    query = db.query(Ticket).filter(Ticket.event_id == event_id)
    if status:
        query = query.filter(Ticket.status == status)
    return query.offset(skip).limit(limit).all()

def update_ticket(db: Session, ticket_id: int, ticket_update: TicketCreate) -> Optional[Ticket]:
    ticket = db.query(Ticket).filter(Ticket.ticket_id == ticket_id).first()
    if not ticket:
        return None
    
    for key, value in ticket_update.model_dump(exclude_unset=True).items():
        setattr(ticket, key, value)
    
    db.commit()
    db.refresh(ticket)
    return ticket

def delete_ticket(db: Session, ticket_id: int) -> bool:
    ticket = db.query(Ticket).filter(Ticket.ticket_id == ticket_id).first()
    if not ticket:
        return False
    db.delete(ticket)
    db.commit()
    return True

def get_ticket_by_ticket_id(db: Session, ticket_id: int) -> Optional[Ticket]:
    return db.query(Ticket).filter(Ticket.ticket_id == ticket_id).first()

# --- 訂單 CRUD 操作 ---

def create_order(db: Session, order: OrderCreate) -> Order:
    db_order = Order(
        user_id=order.user_id,
        total_amount=order.total_amount,
        status=order.status,
        order_date=order.order_date
    )
    db.add(db_order)
    db.commit()
    db.refresh(db_order)
    return db_order

def get_order(db: Session, order_id: int) -> Optional[Order]:
    return db.query(Order).filter(Order.order_id == order_id).first()

def get_orders_by_event(db: Session, event_id: int) -> List[Order]:
    return db.query(Order).join(Ticket).filter(Ticket.event_id == event_id).all()

def get_orders_list(db: Session, user_id: int, skip: int = 0, limit: int = 100) -> List[Order]:
    return db.query(Order).filter(Order.user_id == user_id).offset(skip).limit(limit).all()

def update_order(db: Session, order_id: int, status: OrderStatus) -> Optional[Order]:
    order = db.query(Order).filter(Order.order_id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
        return None
    
    setattr(order, 'status', status) # (object, attribute, value)
    db.commit()
    db.refresh(order)
    return order

def delete_order(db: Session, order_id: int) -> bool:
    order = db.query(Order).filter(Order.order_id == order_id).first()
    if not order:
        return False
    db.delete(order)
    db.commit()
    return True

# --- 付款 CRUD 操作 ---

def get_payment(db: Session, payment_id: int) -> Optional[Payment]:
    return db.query(Payment).filter(Payment.payment_id == payment_id).first()

def get_payments(db: Session, order_id: int, skip: int = 0, limit: int = 100) -> List[Payment]:
    return db.query(Payment).filter(Payment.order_id == order_id).offset(skip).limit(limit).all()

def create_payment(db: Session, payment: PaymentCreate) -> Payment:
    db_payment = Payment(
        order_id=payment.order_id,
        amount=payment.amount,
        method=payment.method,
        status=PaymentStatus.Pending,
        payment_date=datetime.now()
    )
    db.add(db_payment)
    db.commit()
    db.refresh(db_payment)
    return db_payment

def confirm_payment(db: Session, payment_id: int) -> Optional[Payment]:
    payment = get_payment(db, payment_id)
    if not payment:
        return None
    
    order = get_order(db, int(payment.order_id))
    if order is None or str(order.status) != str(OrderStatus.Pending):
        return None

    setattr(payment, 'status', PaymentStatus.Completed)
    setattr(payment, 'payment_date', datetime.now())
    
    update_order(db, int(payment.order_id), OrderStatus.Paid)
    
    db.commit()
    db.refresh(payment)
    return payment

def cancel_payment(db: Session, payment_id: int) -> Optional[Payment]:
    payment = get_payment(db, payment_id)
    if not payment:
        return None
    
    order = get_order(db, int(payment.order_id))
    if order is None:
        return None

    setattr(payment, 'status', PaymentStatus.Canceled)
    setattr(payment, 'payment_date', datetime.now())
    
    update_order(db, int(payment.order_id), OrderStatus.Canceled)
    
    db.commit()
    db.refresh(payment)
    return payment
    return True


# --- 分析功能 ---

def count_total_seats(db: Session, venue_id: int) -> int:
    return db.query(Seat).filter(Seat.venue_id == venue_id).count()

def utilized_seats(db: Session, event_id: int) -> int:
    return db.query(Ticket).filter(Ticket.event_id == event_id, Ticket.order_id.isnot(None)).count()

def total_sales(db: Session, event_id: int) -> float:
    tickets = db.query(Ticket).filter(Ticket.event_id == event_id, Ticket.order_id.isnot(None)).join(Order).with_entities(Ticket.price).all()
    return sum(ticket.price for ticket in tickets)

def total_participants(db: Session, event_id: int) -> int:
    return db.query(Ticket).filter(Ticket.event_id == event_id, Ticket.order_id.isnot(None)).count()

def get_events_by_organizer(db: Session, organizer_id: int) -> List[Event]:
    return db.query(Event).filter(Event.organizer_id == organizer_id).all()

def get_recent_orders(db: Session, organizer_id: int) -> List[Order]:
    return db.query(Order).join(Ticket).join(Event).filter(Event.organizer_id == organizer_id).order_by(Order.order_date.desc()).limit(10).all()