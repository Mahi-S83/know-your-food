from fastapi import FastAPI, UploadFile, File, Depends, HTTPException
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from datetime import datetime, timedelta
from jose import jwt, JWTError
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
import models, schemas, database
from database import engine, Base
import os
import json # <--- NEW: Needed to parse the AI result
from typing import List # <--- NEW: Needed for lists
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import google.generativeai as genai

# SECURITY CONFIGURATION
SECRET_KEY = "my_super_secret_key_change_this_in_production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    print("❌ ERROR: API Key not found!")
else:
    genai.configure(api_key=api_key)

models.Base.metadata.create_all(bind=engine)

app = FastAPI()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password):
    return pwd_context.hash(password)

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

# AI MODEL CONFIGURATION
model = genai.GenerativeModel("gemini-flash-latest")

@app.get("/")
def home():
    return {"status": "Online", "model": "Gemini Flash Latest"}

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
        
    user = db.query(models.User).filter(models.User.email == email).first()
    if user is None:
        raise credentials_exception
        
    return user

# --- 1. THE ANALYZE ENDPOINT (Now SAVES data!) ---
@app.post("/analyze")
async def analyze_ingredients(
    file: UploadFile = File(...), 
    db: Session = Depends(get_db),        # <--- Added DB access
    current_user: models.User = Depends(get_current_user) # <--- Added User access
):
    try:
        contents = await file.read()
        image_parts = [{"mime_type": file.content_type, "data": contents}]

        prompt = """
        Analyze the ingredients in this image. Identify every additive.
        You MUST return ONLY a valid JSON object. Do not include any other text, markdown formatting (like ```json), or conversational filler. 

        The JSON object must strictly follow this exact structure:
        {
            "ingredients": [{"name": "Ingredient Name", "rating": "Red", "reason": "Short explanation"}],
            "summary": "Short overall summary.",
            "score": 85
        }

        Rules: 
        - rating must be EXACTLY "Red", "Yellow", or "Green".
        - Red=Harmful, Yellow=Moderate, Green=Safe. 
        - For 'reason', provide a short 1-sentence explanation.
        """

        response = model.generate_content(
            [prompt, image_parts[0]],
            generation_config={"temperature": 0.0} 
        )
        
        # --- NEW LOGIC: SAVE TO DATABASE ---
        try:
            # 1. Clean the text (remove ```json if present)
            clean_text = response.text.replace("```json", "").replace("```", "").strip()
            
            # 2. Convert text to Python Dictionary
            ai_data = json.loads(clean_text) 
            
            # 3. Create the Database Record
            new_scan = models.Scan(
                filename=file.filename,
                score=ai_data.get("score", 0),
                summary=ai_data.get("summary", "No summary available"),
                ingredients=clean_text, # Save the raw JSON string for details
                user_id=current_user.id
            )
            
            # 4. Save to DB
            db.add(new_scan)
            db.commit()
            db.refresh(new_scan)
            print(f"✅ Saved Scan ID: {new_scan.id} for user {current_user.email}")

        except json.JSONDecodeError:
            print("⚠️ Could not parse JSON for saving, but sending raw text.")

        return {"message": response.text}

    except Exception as e:
        print(f"❌ Error: {e}")
        return {"message": "Error analyzing image."}

# --- 2. NEW ENDPOINT: GET HISTORY ---
@app.get("/history", response_model=List[schemas.ScanOut])
def get_history(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # Fetch all scans belonging to this user, newest first
    scans = db.query(models.Scan).filter(models.Scan.user_id == current_user.id).order_by(models.Scan.created_at.desc()).all()
    return scans

# --- AUTH ROUTES ---
@app.post("/signup", response_model=schemas.UserOut)
def signup(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = get_password_hash(user.password)
    new_user = models.User(email=user.email, hashed_password=hashed_password)
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@app.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    if not user or not pwd_context.verify(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(data={"sub": user.email}, expires_delta=access_token_expires)
    return {"access_token": access_token, "token_type": "bearer"}