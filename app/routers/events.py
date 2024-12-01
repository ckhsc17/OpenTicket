from fastapi import APIRouter, Depends, HTTPException, status
from app.schemas import EventCreate, EventOut
from app.models import User
from app.crud import get_user_by_email
from app.crud import get_event, get_events, create_event, join_event, leave_event
from sqlalchemy.orm import Session
from app.database_connection import get_db
from passlib.context import CryptContext
from datetime import datetime, timedelta
from jose import JWTError, jwt
from typing import Optional
import os
from dotenv import load_dotenv
from pydantic import BaseModel
from typing import List


load_dotenv() # 載入 .env 檔案

router = APIRouter()

@router.get("/events", response_model=List[EventOut])
def list_events(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    events = get_events(db, skip=skip, limit=limit)
    return events

# 透過 event_id 參數，從資料庫中查詢特定活動
@router.get("/events/{event_id}", response_model=EventOut)

@router.post("/events", response_model=EventOut)
def create_new_event(event: EventCreate, db: Session = Depends(get_db), current_user: User = Depends(get_user_by_email)):
    #check_organizer_role(current_user)  # 檢查使用者是否是 organizer 待補
    new_event = create_event(db, event, current_user.user_id)
    return new_event

@router.post("/events/{event_id}/join", response_model=EventOut)
def join_event_api(event_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_user_by_email)):
    event = join_event(db, event_id, current_user.user_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return event

@router.post("/events/{event_id}/leave", response_model=EventOut)
def leave_event_api(event_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_user_by_email)):
    event = leave_event(db, event_id, current_user.user_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return event