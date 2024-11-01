from pydantic import BaseModel, EmailStr
from pydantic.types import constr
from typing import Optional, List
from datetime import date, datetime
import enum

class UserRole(str, enum.Enum):
    User = "User"
    Organizer = "Organizer"
    Admin = "Admin"

class UserBase(BaseModel):
    username: constr(min_length=3, max_length=50)
    email: EmailStr
    phone: Optional[constr(max_length=20)] = None

class UserCreate(UserBase):
    password: constr(min_length=6)
    role: UserRole

class UserOut(UserBase):
    user_id: int
    role: UserRole
    created_at: datetime

    class Config:
        orm_mode = True

class EventBase(BaseModel):
    event_name: str
    performer: str
    event_date: date
    venue_id: int
    description: Optional[str] = None
    status: Optional[str] = "Scheduled"

class EventCreate(EventBase):
    pass

class EventOut(EventBase):
    event_id: int
    organizer_id: int

    class Config:
        orm_mode = True

class VenueBase(BaseModel):
    venue_name: str
    address: Optional[str] = None
    city: Optional[str] = None
    capacity: Optional[int] = None

class VenueCreate(VenueBase):
    pass

class VenueOut(VenueBase):
    venue_id: int

    class Config:
        orm_mode = True

class SeatBase(BaseModel):
    venue_id: int
    section: Optional[str] = None
    row: Optional[str] = None
    seat_number: str
    seat_type: Optional[str] = "Regular"

class SeatCreate(SeatBase):
    pass

class SeatOut(SeatBase):
    seat_id: int

    class Config:
        orm_mode = True

class TicketBase(BaseModel):
    event_id: int
    seat_id: int
    price: float
    status: Optional[str] = "Available"

class TicketCreate(TicketBase):
    pass

class TicketOut(TicketBase):
    ticket_id: int

    class Config:
        orm_mode = True

class OrderBase(BaseModel):
    user_id: int
    total_amount: float
    status: Optional[str] = "Pending"

class OrderCreate(OrderBase):
    pass

class OrderOut(OrderBase):
    order_id: int
    order_date: datetime

    class Config:
        orm_mode = True

class PaymentBase(BaseModel):
    order_id: int
    amount: float
    method: str
    status: Optional[str] = "Completed"

class PaymentCreate(PaymentBase):
    pass

class PaymentOut(PaymentBase):
    payment_id: int
    payment_date: datetime

    class Config:
        orm_mode = True
