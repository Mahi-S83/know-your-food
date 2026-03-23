# 🔬 knowYourFood - AI-Powered Ingredient Safety Analyzer

> Instant health analysis of food products using multimodal AI

![App Screenshot](frontend/screenshots/hero.png)

## 🎯 Problem Statement 
Consumers struggle to understand complex ingredient labels. Medical terminology and chemical names make it difficult to make informed health decisions while shopping.

## 💡 Solution

knowYourFood uses Google's Gemini 2.0 Flash AI to analyze ingredient labels in real-time, providing:
- Color-coded safety ratings (Red/Yellow/Green)
- Plain-language explanations for each ingredient
- Overall health score (0-100)
- Instant analysis in under 3 seconds

## ✨ Features

- 📸 **Instant Scanning**: Upload or capture ingredient labels
- 🤖 **AI-Powered Analysis**: Multimodal processing with Gemini 2.0 Flash
- 🎨 **Visual Health Scoring**: Color-coded ratings for quick decisions
- 📱 **Mobile-First Design**: Optimized for on-the-go scanning
- 🔐 **User Accounts**: Save and track your scans

## 🛠️ Tech Stack

**Frontend:**
- React 18 + Vite
- Tailwind CSS
- Lucide React (icons)

**Backend:**
- Python FastAPI
- Google Gemini 2.0 Flash API
- PostgreSQL
- SQLAlchemy ORM

**Deployment:**
- Frontend: Vercel
- Backend: Render
- Database: Railway

## 🏗️ Architecture
```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐
│   React     │─────▶│   FastAPI    │─────▶│   Gemini    │
│  Frontend   │◀─────│   Backend    │◀─────│  2.0 Flash  │
└─────────────┘      └──────────────┘      └─────────────┘
                            │
                            ▼
                     ┌──────────────┐
                     │  PostgreSQL  │
                     │   Database   │
                     └──────────────┘
```

## 🚀 Live Demo

**Frontend Application**: https://knowyourfood-nine.vercel.app

**API Documentation**: https://know-your-food-4toj.onrender.com/docs

## 📊 Key Metrics

- ⚡ **Analysis Time**: < 3 seconds
- 👥 **Active Users**: 30+
- 📦 **Products Analyzed**: 150+
- ⭐ **User Satisfaction**: 85%

## 💻 Local Development

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL

### Setup
```bash
# Clone repository
git clone https://github.com/Mahi-S83/knowyourfood.git
cd knowyourfood

# Backend setup
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
# Add GEMINI_API_KEY and DATABASE_URL to .env file
uvicorn main:app --reload

# Frontend setup (new terminal)
cd frontend
npm install
# Add VITE_API_URL=http://127.0.0.1:8000 to .env
npm run dev
```

## 🧠 What I Learned

### Technical Challenges
- **Prompt Engineering**: Structured Gemini to return consistent JSON
- **Environment Management**: Dynamic API routing between local and production
- **Error Handling**: Proper FastAPI validation and request formatting
- **State Management**: Clean separation of upload/analysis/results flow

### Design Decisions
- **FastAPI over Node.js**: Python's AI ecosystem integration
- **Gemini 2.0 Flash**: Free tier (60 req/min), multimodal support
- **Custom grouping**: Ingredients organized by safety tier for better UX

## 📈 Future Enhancements

- [ ] Barcode scanning for product lookup
- [ ] Personalized health profiles (allergies, diabetes)
- [ ] Healthier alternative recommendations
- [ ] Weekly health reports
- [ ] Social sharing

## 👤 Author

**Mahi Singh**
- GitHub: [@Mahi-S83](https://github.com/Mahi-S83)
- LinkedIn: [Mahi Singh](https://www.linkedin.com/in/mahi-singh-6a4622206/)
- Email: mahisinghh9597@gmail.com

## 📄 License

MIT License - feel free to use this for learning!

---

⭐ If you found this project helpful, please star the repository!