from pydantic import BaseModel

# 1. What the user sends us to Sign Up
class UserCreate(BaseModel):
    email: str
    password: str

# 2. What we send back (Notice we DO NOT include the password!)
class UserOut(BaseModel):
    id: int
    email: str

    class Config:
        from_attributes = True