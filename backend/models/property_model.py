from sqlalchemy import Column, Integer, String, DateTime, Float
from sqlalchemy.sql import func, desc, asc
from services.db import Base, SessionLocal
from datetime import datetime

class Property(Base):
    __tablename__ = "properties"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    price = Column(Float, index=True)
    city = Column(String, index=True)
    bedrooms = Column(Integer, default=0, index=True)
    bathrooms = Column(Integer, default=0)
    area_sqft = Column(Float, nullable=True)
    listed_by = Column(String, nullable=True)
    created_by = Column(String, nullable=True)
    action = Column(String, default="Buy")
    created_at = Column(DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            "_id": str(self.id),
            "title": self.title,
            "price": self.price,
            "city": self.city,
            "bedrooms": self.bedrooms,
            "bathrooms": self.bathrooms,
            "area_sqft": self.area_sqft,
            "listed_by": self.listed_by,
            "created_by": self.created_by,
            "action": self.action,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }

# ---------- CREATE ----------
def create_property(data):
    db = SessionLocal()
    try:
        new_prop = Property(
            title=data.get("title"),
            price=float(data.get("price", 0)),
            city=data.get("city"),
            bedrooms=int(data.get("bedrooms", 0)),
            bathrooms=int(data.get("bathrooms", 0)),
            area_sqft=float(data.get("area_sqft")) if data.get("area_sqft") else None,
            listed_by=data.get("listed_by"),
            created_by=data.get("created_by"),
            action=data.get("action", "Buy")
        )
        db.add(new_prop)
        db.commit()
        db.refresh(new_prop)
        return str(new_prop.id)
    finally:
        db.close()


def city_market_stats(city):
    db = SessionLocal()
    try:
        stats = db.query(
            Property.city.label("_id"),
            func.avg(Property.price).label("avgPrice"),
            func.min(Property.price).label("minPrice"),
            func.max(Property.price).label("maxPrice"),
            func.count(Property.id).label("totalListings")
        ).filter(func.lower(Property.city) == city.lower()).group_by(Property.city).all()
        
        return [dict(row._mapping) for row in stats]
    finally:
        db.close()


def recommend_properties(city, max_price, bedrooms):
    db = SessionLocal()
    try:
        props = db.query(Property).filter(
            func.lower(Property.city) == city.lower(),
            Property.price <= float(max_price),
            Property.bedrooms == int(bedrooms)
        ).order_by(asc(Property.price)).limit(5).all()
        
        return [{"title": p.title, "price": p.price, "bedrooms": p.bedrooms, "city": p.city} for p in props]
    finally:
        db.close()


def city_overview():
    db = SessionLocal()
    try:
        stats = db.query(
            Property.city.label("_id"),
            func.avg(Property.price).label("avgPrice"),
            func.count(Property.id).label("totalListings")
        ).group_by(Property.city).order_by(asc("avgPrice")).all()
        
        return [dict(row._mapping) for row in stats]
    finally:
        db.close()


def price_by_bedrooms():
    db = SessionLocal()
    try:
        stats = db.query(
            Property.bedrooms.label("_id"),
            func.avg(Property.price).label("avgPrice"),
            func.min(Property.price).label("minPrice"),
            func.max(Property.price).label("maxPrice"),
            func.count(Property.id).label("count")
        ).group_by(Property.bedrooms).order_by(asc(Property.bedrooms)).all()
        
        return [dict(row._mapping) for row in stats]
    finally:
        db.close()


def cheapest_segment(city):
    db = SessionLocal()
    try:
        stats = db.query(
            Property.bedrooms.label("_id"),
            func.avg(Property.price).label("avgPrice"),
            func.count(Property.id).label("count")
        ).filter(func.lower(Property.city) == city.lower()).group_by(Property.bedrooms).order_by(asc("avgPrice")).limit(1).all()
        
        return [{"bedrooms": row._id, "avgPrice": row.avgPrice, "count": row.count} for row in stats]
    finally:
        db.close()


# ---------- READ ----------
def get_property_by_id(pid):
    db = SessionLocal()
    try:
        prop = db.query(Property).filter(Property.id == int(pid)).first()
        return prop.to_dict() if prop else None
    except ValueError:
        return None
    finally:
        db.close()


# ---------- SEARCH ----------
def search_properties(filters):
    db = SessionLocal()
    try:
        query = db.query(Property)
        
        if "city" in filters and filters["city"]:
            query = query.filter(func.lower(Property.city) == filters["city"].lower())
            
        if "minPrice" in filters and filters["minPrice"]:
            query = query.filter(Property.price >= float(filters["minPrice"]))
            
        if "maxPrice" in filters and filters["maxPrice"]:
            query = query.filter(Property.price <= float(filters["maxPrice"]))
            
        page = int(filters.get("page", 1))
        limit = int(filters.get("limit", 5))
        skip = (page - 1) * limit
        
        sort_field = filters.get("sortBy", "price")
        order = filters.get("order", "asc")
        
        sort_attr = getattr(Property, sort_field, Property.price)
        if order == "desc":
            query = query.order_by(desc(sort_attr))
        else:
            query = query.order_by(asc(sort_attr))
            
        props = query.offset(skip).limit(limit).all()
        return [p.to_dict() for p in props]
    finally:
        db.close()


# ---------- UPDATE ----------
def update_property(pid, updates):
    db = SessionLocal()
    try:
        prop = db.query(Property).filter(Property.id == int(pid)).first()
        if not prop:
            return 0
            
        for key, value in updates.items():
            if hasattr(prop, key) and key != "id":
                setattr(prop, key, value)
                
        db.commit()
        return 1
    except ValueError:
        return 0
    finally:
        db.close()


# ---------- DELETE ----------
def delete_property(pid):
    db = SessionLocal()
    try:
        prop = db.query(Property).filter(Property.id == int(pid)).first()
        if prop:
            db.delete(prop)
            db.commit()
            return {"deleted_count": 1}
        return {"deleted_count": 0}
    except ValueError:
        return {"deleted_count": 0}
    finally:
        db.close()
