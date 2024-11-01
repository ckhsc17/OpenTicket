from sqlalchemy import Column, Integer, String, ForeignKey, DECIMAL, Date, DateTime, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
import enum

Base = declarative_base()

class UserRole(str, enum.Enum):
    User = "User"
    Organizer = "Organizer"
    Admin = "Admin"

class User(Base):
    __tablename__ = "users"
    user_id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False)
    password = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    phone = Column(String(20))
    role = Column(Enum(UserRole), nullable=False)
    created_at = Column(DateTime, server_default="CURRENT_TIMESTAMP")

    events = relationship("Event", back_populates="organizer")

class Event(Base):
    __tablename__ = "events"
    event_id = Column(Integer, primary_key=True, index=True)
    organizer_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"))
    event_name = Column(String(100), nullable=False)
    performer = Column(String(50), nullable=False)
    event_date = Column(Date, nullable=False)
    venue_id = Column(Integer, ForeignKey("venues.venue_id", ondelete="SET NULL"))
    description = Column(String)
    status = Column(String(20), default="Scheduled")

    organizer = relationship("User", back_populates="events")
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

class Seat(Base):
    __tablename__ = "seats"
    seat_id = Column(Integer, primary_key=True, index=True)
    venue_id = Column(Integer, ForeignKey("venues.venue_id", ondelete="CASCADE"))
    section = Column(String(20))
    row = Column(String(5))
    seat_number = Column(String(5), unique=True)
    seat_type = Column(String(20))

    venue = relationship("Venue", back_populates="seats")
    ticket = relationship("Ticket", back_populates="seat", uselist=False)

class Ticket(Base):
    __tablename__ = "tickets"
    ticket_id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("events.event_id", ondelete="CASCADE"))
    seat_id = Column(Integer, ForeignKey("seats.seat_id", ondelete="SET NULL"))
    price = Column(DECIMAL(10, 2), nullable=False)
    status = Column(String(20), default="Available")

    event = relationship("Event", back_populates="tickets")
    seat = relationship("Seat", back_populates="ticket")
    order = relationship("Order", back_populates="ticket")

class OrderStatus(str, enum.Enum):
    Pending = "Pending"
    Paid = "Paid"
    Canceled = "Canceled"

class Order(Base):
    __tablename__ = "orders"
    order_id = Column(Integer, primary_key=True, index=True)
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
    Failed = "Failed"

class Payment(Base):
    __tablename__ = "payments"
    payment_id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.order_id", ondelete="CASCADE"))
    payment_date = Column(DateTime, server_default="CURRENT_TIMESTAMP")
    amount = Column(DECIMAL(10, 2), nullable=False)
    method = Column(String(20), nullable=False)
    status = Column(Enum(PaymentStatus), default="Completed")

    order = relationship("Order", back_populates="payments")
