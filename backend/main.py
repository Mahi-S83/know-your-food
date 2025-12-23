import os
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import google.generativeai as genai

# 1. Load the hidden API key
load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    print("❌ ERROR: API Key not found! Did you create the .env file?")
else:
    print("✅ API Key found! Connecting to Gemini...")
    genai.configure(api_key=api_key)

app = FastAPI()

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

@app.post("/analyze")
async def analyze_ingredients(file: UploadFile = File(...)):
    print(f"📸 Receiving file: {file.filename}")
    
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