from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

# --- USER SCHEMAS ---
class UserCreate(BaseModel):
    email: str
    password: str

class UserOut(BaseModel):
    id: int
    email: str
    class Config:
        orm_mode = True

# --- SCAN SCHEMAS ---
# This is what we send to the frontend when they ask for history
class ScanOut(BaseModel):
    id: int
    filename: str
    score: int
    summary: str
    created_at: datetime
    
    class Config:
        orm_mode = True