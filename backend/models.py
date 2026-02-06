from sqlalchemy import Column, Integer, String, ForeignKey, Text, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    
    # Relationship: One user has many scans
    scans = relationship("Scan", back_populates="owner")

class Scan(Base):
    __tablename__ = "scans"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String)
    score = Column(Integer)
    summary = Column(Text)
    ingredients = Column(Text) # We will store the JSON list as a long string
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Foreign Key: Links this scan to a specific user
    user_id = Column(Integer, ForeignKey("users.id"))
    
    # Relationship: Link back to the user
    owner = relationship("User", back_populates="scans")