from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import date, datetime
from models import OrderStatus, PaymentStatus, PaymentMethod, UserRole
import enum

class UserBase(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    phone: Optional[str] = Field(None, max_length=20)

class UserCreate(UserBase):
    created_at: datetime = datetime.now()
    password: str = Field(..., min_length=6)
    role: UserRole

#看你有哪些屬性需要在輸出時顯示
class UserOut(UserBase):
    user_id: int
    role: UserRole
    created_at: datetime

    class Config:
        from_attributes = True 
        #orm_mode = True

class EventBase(BaseModel):
    #event_id: int #先手動加入，之後會自動生成
    event_name: str
    performer: str
    event_date: date
    venue_id: int
    description: Optional[str] = None 
    status: Optional[str] = "Scheduled"

    

# 參考 UserCreate 的寫法，定義 EventCreate
class EventCreate(EventBase):
    #event_id: int #先手動加入，之後會自動生成
    event_name: str = Field(..., min_length=1, max_length=100)
    performer: str = Field(..., min_length=1, max_length=50)
    venue_id: int
    event_date: date
    status: Optional[str] = "Scheduled"

    class Config:
        from_attributes = True 


class EventOut(EventBase):
    event_id: int
    #event_name: str
    #performer: str
    #event_date: date
    #venue_id: int
    #status: str
    organizer_id: int

    class Config:
        from_attributes = True 
        #orm_mode = True

class EventAnalytics(EventBase):
    event_id: int
    event_name: str
    venue: str
    event_date: str
    total_sales: float
    total_seats: int
    utilized_seats: int
    seat_utilization: float
    total_participants: int

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
        from_attributes = True 

class SeatBase(BaseModel):
    venue_id: int
    section: Optional[str] = None
    row: Optional[str] = None
    seat_number: str
    seat_type: Optional[str] = "Regular"
    status: Optional[str] = "Available"

class SeatCreate(SeatBase):
    pass

class SeatOut(SeatBase):
    #seat_id: int

    class Config:
        from_attributes = True 

class TicketBase(BaseModel):
    #ticket_id: int
    event_id: int
    venue_id: int
    order_id: int
    seat_number: int
    price: float
    type: Optional[str] = "Adult"

    class Config:
        from_attributes = True 

class TicketCreate(TicketBase):
    event_id: int
    venue_id: int
    order_id: int
    seat_number: int
    price: float #先手動加入，之後會自動生成對應座位價格
    type: Optional[str] = "Adult"

    class Config:
        from_attributes = True 

class TicketOut(TicketBase):
    ticket_id: int

    class Config:
        from_attributes = True 

class OrderBase(BaseModel):
    user_id: int
    total_amount: float
    status: Optional[OrderStatus] = OrderStatus.Pending

class OrderCreate(OrderBase):
    user_id: int
    total_amount: float #先手動加入，之後會根據所選位子、張數自動計算價格
    order_date: datetime = datetime.now()
    status: Optional[OrderStatus] = OrderStatus.Pending

class OrderOut(OrderBase):
    order_id: int
    order_date: datetime

    class Config:
        from_attributes = True 

class PaymentBase(BaseModel):
    order_id: int
    amount: float
    method: Optional[PaymentMethod]
    status: PaymentStatus = PaymentStatus.Pending
    payment_date: datetime = datetime.now()
    
class PaymentCreate(PaymentBase):
    order_id: int
    amount: float
    method: Optional[PaymentMethod]
    status: PaymentStatus = PaymentStatus.Pending

class PaymentOut(PaymentBase):
    payment_id: int

    class Config:
        from_attributes = True 
