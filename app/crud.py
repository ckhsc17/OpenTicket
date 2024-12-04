from sqlalchemy.orm import Session
from app.models import User, Event, Venue, Seat, Ticket, Order, Payment
from app.schemas import (
    UserCreate, UserOut, EventCreate, EventOut,
    VenueCreate, VenueOut, SeatCreate, SeatOut,
    TicketCreate, TicketOut, OrderCreate, OrderOut,
    PaymentCreate, PaymentOut
)
from passlib.context import CryptContext
from typing import List, Optional

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
    user.username = user_update.username
    user.email = user_update.email
    user.phone = user_update.phone
    user.role = user_update.role
    if user_update.password:
        user.password = get_password_hash(user_update.password)
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
    event.event_name = event_update.event_name
    event.performer = event_update.performer
    event.event_date = event_update.event_date
    event.venue_id = event_update.venue_id
    event.description = event_update.description
    event.status = event_update.status
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
    venue.venue_name = venue_update.venue_name
    venue.address = venue_update.address
    venue.city = venue_update.city
    venue.capacity = venue_update.capacity
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

def get_seats(db: Session, venue_id: int, skip: int = 0, limit: int = 100) -> List[Seat]:
    return db.query(Seat).filter(Seat.venue_id == venue_id).offset(skip).limit(limit).all()

def update_seat(db: Session, seat_id: int, seat_update: SeatCreate) -> Optional[Seat]:
    seat = db.query(Seat).filter(Seat.seat_id == seat_id).first()
    if not seat:
        return None
    seat.section = seat_update.section
    seat.row = seat_update.row
    seat.seat_number = seat_update.seat_number
    seat.seat_type = seat_update.seat_type
    db.commit()
    db.refresh(seat)
    return seat

def delete_seat(db: Session, seat_id: int) -> bool:
    seat = db.query(Seat).filter(Seat.seat_id == seat_id).first()
    if not seat:
        return False
    db.delete(seat)
    db.commit()
    return True

# --- 票券 CRUD 操作 ---

def create_ticket(db: Session, ticket: TicketCreate, venue_id: int, order_id: int) -> Ticket:
    db_ticket = Ticket(
        event_id=ticket.event_id,
        order_id=order_id,
        venue_id=venue_id, 
        seat_number=ticket.seat_number,
        price=ticket.price,
        status=ticket.status
    )
    db.add(db_ticket)
    db.commit()
    db.refresh(db_ticket)
    return db_ticket

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
    ticket.event_id = ticket_update.event_id
    ticket.seat_id = ticket_update.seat_id
    ticket.price = ticket_update.price
    ticket.status = ticket_update.status
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

# --- 訂單 CRUD 操作 ---

def create_order(db: Session, order: OrderCreate, user_id: int) -> Order:
    db_order = Order(
        user_id=user_id,
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

def get_orders(db: Session, user_id: int, skip: int = 0, limit: int = 100) -> List[Order]:
    return db.query(Order).filter(Order.user_id == user_id).offset(skip).limit(limit).all()

def update_order(db: Session, order_id: int, order_update: OrderCreate) -> Optional[Order]:
    order = db.query(Order).filter(Order.order_id == order_id).first()
    if not order:
        return None
    order.user_id = order_update.user_id
    order.total_amount = order_update.total_amount
    order.status = order_update.status
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

def create_payment(db: Session, payment: PaymentCreate) -> Payment:
    db_payment = Payment(
        order_id=payment.order_id,
        amount=payment.amount,
        method=payment.method,
        status=payment.status
    )
    db.add(db_payment)
    db.commit()
    db.refresh(db_payment)
    return db_payment

def get_payment(db: Session, payment_id: int) -> Optional[Payment]:
    return db.query(Payment).filter(Payment.payment_id == payment_id).first()

def get_payments(db: Session, order_id: int, skip: int = 0, limit: int = 100) -> List[Payment]:
    return db.query(Payment).filter(Payment.order_id == order_id).offset(skip).limit(limit).all()

def update_payment(db: Session, payment_id: int, payment_update: PaymentCreate) -> Optional[Payment]:
    payment = db.query(Payment).filter(Payment.payment_id == payment_id).first()
    if not payment:
        return None
    payment.order_id = payment_update.order_id
    payment.amount = payment_update.amount
    payment.method = payment_update.method
    payment.status = payment_update.status
    db.commit()
    db.refresh(payment)
    return payment

def delete_payment(db: Session, payment_id: int) -> bool:
    payment = db.query(Payment).filter(Payment.payment_id == payment_id).first()
    if not payment:
        return False
    db.delete(payment)
    db.commit()
    return True
