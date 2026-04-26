from sqlalchemy import Column, Integer, String, DateTime, JSON
from services.db import Base, SessionLocal
from datetime import datetime
import bcrypt

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    email = Column(String, unique=True, index=True)
    phone = Column(String, nullable=True)
    city = Column(String, nullable=True)
    password = Column(String)
    role = Column(String, default="buyer")
    created_at = Column(DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            "_id": str(self.id),
            "name": self.name,
            "email": self.email,
            "phone": self.phone,
            "city": self.city,
            "role": self.role,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }

class Inquiry(Base):
    __tablename__ = "inquiries"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, index=True)
    message = Column(String)
    category = Column(String)
    urgency = Column(String)
    location = Column(String, nullable=True)
    budget = Column(Integer, nullable=True)
    bhk = Column(Integer, nullable=True)
    ids = Column(JSON, nullable=True)
    dates = Column(JSON, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)

def hash_password(password: str) -> bytes:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode(), salt)


def create_user(data):
    db = SessionLocal()
    try:
        if db.query(User).filter(User.email == data["email"]).first():
            raise Exception("Email already registered")

        hashed_pw = hash_password(data["password"]).decode('utf-8')

        user = User(
            name=data["name"],
            email=data["email"],
            phone=data.get("phone"),
            city=data.get("city"),
            password=hashed_pw,
            role=data.get("role", "buyer"),
            created_at=datetime.utcnow()
        )

        db.add(user)
        db.commit()
        db.refresh(user)
        return str(user.id)
    finally:
        db.close()


def get_user_by_email(email):
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == email).first()
        if user:
            return user.to_dict()
        return None
    finally:
        db.close()

def verify_password(email, password):
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == email).first()
        if not user:
            return False

        stored_hash = user.password.encode('utf-8')
        if bcrypt.checkpw(password.encode(), stored_hash):
            return True
        return False
    finally:
        db.close()
