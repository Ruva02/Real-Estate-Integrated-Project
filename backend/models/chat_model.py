from sqlalchemy import Column, Integer, String, DateTime, JSON
from services.db import Base, SessionLocal
from datetime import datetime

class ChatSession(Base):
    __tablename__ = "chat_sessions"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    history = Column(JSON, default=[])
    last_updated = Column(DateTime, default=datetime.utcnow)

def get_session_by_email(email):
    db = SessionLocal()
    try:
        return db.query(ChatSession).filter(ChatSession.email == email).first()
    finally:
        db.close()

def update_session(email, history):
    db = SessionLocal()
    try:
        session = db.query(ChatSession).filter(ChatSession.email == email).first()
        if session:
            session.history = history
            session.last_updated = datetime.utcnow()
        else:
            session = ChatSession(email=email, history=history)
            db.add(session)
        db.commit()
    finally:
        db.close()
