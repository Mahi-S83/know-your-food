from fastapi import FastAPI, UploadFile, File, Depends, HTTPException # Added Depends, HTTPException
from sqlalchemy.orm import Session
from passlib.context import CryptContext # For password hashing
from datetime import datetime, timedelta
from jose import jwt, JWTError
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
import models, schemas, database # Our new files
from database import engine, Base
import models
import os
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import google.generativeai as genai

# SECURITY CONFIGURATION
SECRET_KEY = "my_super_secret_key_change_this_in_production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# This tells FastAPI where to look for the token (the "badge")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

# Helper function to create the Token (The Badge Factory)
def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# 1. Load the hidden API key
load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    print("❌ ERROR: API Key not found! Did you create the .env file?")
else:
    print("✅ API Key found! Connecting to Gemini...")
    genai.configure(api_key=api_key)
# This command creates the 'food_app.db' file if it doesn't exist
models.Base.metadata.create_all(bind=engine)
app = FastAPI()

# 1. Setup Password Hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password):
    return pwd_context.hash(password)

# 2. Database Dependency (Helper to open/close DB for each request)
def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. Setup the AI Model
# We are upgrading to the 2.0 Flash model found in your list!
model = genai.GenerativeModel("gemini-flash-latest")

@app.get("/")
def home():
    return {"status": "Online", "model": "Gemini 1.5 Flash"}
# The "Bouncer" Function
def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        # 1. Decode the token
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
        
    # 2. Check if user exists in DB
    user = db.query(models.User).filter(models.User.email == email).first()
    if user is None:
        raise credentials_exception
        
    return user
@app.post("/analyze")
async def analyze_ingredients(
    file: UploadFile = File(...), 
    current_user: models.User = Depends(get_current_user) # <--- The Lock
):
    try:
        # 3. Read the image file
        contents = await file.read()
        
        # 4. Prepare the image for Gemini
        image_part = {
            "mime_type": file.content_type,
            "data": contents
        }

        # 5. The "Magic Prompt" - What we ask the AI to do
        prompt = """
        You are an expert nutritionist. Analyze this ingredient label.
        1. List any harmful or controversial ingredients (like Red 40, High Fructose Corn Syrup, etc).
        2. Give a health score from 0 to 100.
        3. Explain strictly in 2-3 sentences if this food is healthy or not.
        """

        # 6. Send to Gemini
        response = model.generate_content([prompt, image_part])
        
        # 7. Send the AI's answer back to the Frontend
        print("🤖 AI Response generated!")
        return {"message": response.text}

    except Exception as e:
        print(f"❌ Error: {e}")
        return {"message": "Error analyzing image. Please try again."}
    


@app.post("/signup", response_model=schemas.UserOut)
def signup(user: schemas.UserCreate, db: Session = Depends(get_db)):
    # 1. Check if email already exists
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # 2. Hash the password (Security!)
    hashed_password = get_password_hash(user.password)
    
    # 3. Create the new user object
    new_user = models.User(email=user.email, hashed_password=hashed_password)
    
    # 4. Save to Database
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return new_user
@app.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    # 1. Find the user
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    
    # 2. Check if user exists OR if password is wrong
    if not user or not pwd_context.verify(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=400, 
            detail="Incorrect email or password"
        )
    
    # 3. Create the Badge (Token)
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    
    # 4. Give the badge to the user
    return {"access_token": access_token, "token_type": "bearer"}