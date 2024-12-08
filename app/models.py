"""
models.py 模組包含了應用中的數據模型，使用 SQLAlchemy ORM 定義了用戶、活動、場地、座位、票券、訂單和支付等模型。
用 SQLAlchemy ORM 定義數據模型後，就不用直接操作 SQL 語句，而是通過對象的方式來操作數據庫。
"""

import enum
from sqlalchemy import Column, Integer, String, ForeignKey, DECIMAL, Date, DateTime, Enum, ForeignKeyConstraint
from sqlalchemy.orm import relationship
from app.database_connection import Base

class UserRole(str, enum.Enum):
    user = "User"
    organizer = "Organizer"
    admin = "Admin"

class User(Base):
    __tablename__ = "users"
    user_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    username = Column(String(50), unique=True, nullable=False)
    password = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    phone = Column(String(20))
    role = Column(Enum(UserRole), nullable=False, default="User")
    created_at = Column(DateTime, server_default="CURRENT_TIMESTAMP")

    events = relationship("Event", back_populates="organizer") 

class EventStatus(str, enum.Enum):
    Scheduled = "Scheduled"
    Canceled = "Canceled"
    Completed = "Completed"

class Event(Base):
    __tablename__ = "events"
    event_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    organizer_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"))
    event_name = Column(String(100), nullable=False)
    performer = Column(String(50), nullable=False)
    event_date = Column(Date, nullable=False)
    venue_id = Column(Integer, ForeignKey("venues.venue_id", ondelete="SET NULL"))
    description = Column(String)
    status = Column(Enum(EventStatus), nullable=False, default="Scheduled")
    organizer = relationship("User", back_populates="events") #這個拿掉會影響mapping？
    venue = relationship("Venue", back_populates="events")
    tickets = relationship("Ticket", back_populates="event")

class Venue(Base):
    __tablename__ = "venues"
    venue_id = Column(Integer, primary_key=True, index=True)
    venue_name = Column(String(50), nullable=False)
    address = Column(String(200))
    city = Column(String(50))
    capacity = Column(Integer)

    events = relationship("Event", back_populates="venue")
    seats = relationship("Seat", back_populates="venue")

class SeatType(str, enum.Enum):
    Regular = "Regular" 
    VIP = "VIP"
    Wheelchair = "Wheelchair"

class SeatStatus(str, enum.Enum):
    Available = "Available"
    Reserved = "Reserved"
    Sold = "Sold"

class Seat(Base):
    __tablename__ = "seats"
    venue_id = Column(Integer, ForeignKey("venues.venue_id", ondelete="CASCADE"), primary_key=True)
    seat_number = Column(String(5), primary_key=True)

    section = Column(String(20))
    row = Column(String(5))
    seat_number = Column(String(5), primary_key=True)
    seat_type = Column(String(20))
    _status = Column("status", String(20), default="Available")  # 使用下划线避免冲突
    '''
    @property
    def status(self) -> str:
        return self._status

    @status.setter
    def status(self, value: str):
        self._status = value
       ''' 

    venue = relationship("Venue", back_populates="seats")
    ticket = relationship("Ticket", back_populates="seat", uselist=False)

class Ticket(Base):
    __tablename__ = "tickets"
    ticket_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    event_id = Column(Integer, ForeignKey("events.event_id", ondelete="CASCADE"))
    price = Column(DECIMAL(10, 2), nullable=False)
    type = Column(String(20), default="Available")
    order_id = Column(Integer, ForeignKey('orders.order_id')) 
    venue_id = Column(Integer)
    seat_number = Column(Integer)

    # 定義複合外鍵
    __table_args__ = (
        ForeignKeyConstraint(
            ['venue_id', 'seat_number'],
            ['seats.venue_id', 'seats.seat_number'],
            ondelete="SET NULL"
        ),
    )

    event = relationship("Event", back_populates="tickets")
    seat = relationship("Seat", back_populates="ticket", uselist=False) #uselist=False表示一對一關係
    order = relationship("Order", back_populates="tickets")

class OrderStatus(str, enum.Enum):
    pending = "Pending"
    paid = "Paid"
    canceled = "Canceled"

class Order(Base):
    __tablename__ = "orders"
    order_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"))
    total_amount = Column(DECIMAL(10, 2), nullable=False)
    order_date = Column(DateTime, server_default="CURRENT_TIMESTAMP")
    status = Column(Enum(OrderStatus), default="Pending")

    user = relationship("User")
    payments = relationship("Payment", back_populates="order")
    tickets = relationship("Ticket", back_populates="order")

class PaymentStatus(str, enum.Enum):
    Pending = "Pending"
    Completed = "Completed"
    Canceled = "Canceled"

class PaymentMethod(str, enum.Enum):
    Credit_Card = "Credit Card"
    Bank_Transfer = "Bank Transfer"
    PayPal = "PayPal"

class Payment(Base):
    __tablename__ = "payments"
    payment_id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.order_id", ondelete="CASCADE"))
    payment_date = Column(DateTime, server_default="CURRENT_TIMESTAMP")
    amount = Column(DECIMAL(10, 2), nullable=False)
    method = Column(Enum(PaymentMethod), nullable=False)
    status = Column(Enum(PaymentStatus), nullable=False, default="Pending")

    order = relationship("Order", back_populates="payments")