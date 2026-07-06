# 🔬 knowYourFood — AI-Powered Ingredient Safety Analyzer

> Instant, color-coded health analysis of packaged food ingredients using multimodal AI.

<p align="center">
  <img src="https://raw.githubusercontent.com/Mahi-S83/know-your-food/main/frontend/screenshots/hero.png" alt="knowYourFood App Hero Screenshot" width="800"/>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/Vite-Frontend-646CFF?logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/FastAPI-Backend-009688?logo=fastapi&logoColor=white" />
  <img src="https://img.shields.io/badge/PostgreSQL-Database-4169E1?logo=postgresql&logoColor=white" />
  <img src="https://img.shields.io/badge/Gemini%202.0%20Flash-AI-8E44AD?logo=googlegemini&logoColor=white" />
  <img src="https://img.shields.io/badge/License-MIT-green.svg" />
</p>

<p align="center">
  <a href="https://know-your-food-nine.vercel.app"><b>🚀 Live Demo</b></a> •
  <a href="https://know-your-food-4toj.onrender.com/docs"><b>📖 API Docs</b></a> •
  <a href="#-features">Features</a> •
  <a href="#-tech-stack">Tech Stack</a> •
  <a href="#-local-development">Setup</a>
</p>

---

## 🎯 Problem Statement

Consumers struggle to understand complex, chemically dense ingredient labels. Dense medical and scientific terminology makes it hard to make informed health decisions while shopping — especially for parents, health-conscious buyers, and people with dietary restrictions who don't have a nutrition background.

## 💡 Solution

**knowYourFood** uses Google's **Gemini 2.0 Flash** multimodal AI to scan and analyze ingredient labels in real time, translating them into a simple, scannable health score. It provides:

- 🟢🟡🔴 Color-coded safety ratings for every ingredient
- 🗣️ Plain-language explanations — no chemistry degree required
- 💯 An overall health score (0–100) for the product
- ⚡ Full analysis in under 3 seconds

---

## ✨ Features

| | |
|---|---|
| 📸 **Instant Scanning** | Upload or capture a photo of any ingredient label |
| 🤖 **AI-Powered Analysis** | Multimodal processing with Gemini 2.0 Flash |
| 🎨 **Visual Health Scoring** | Color-coded ratings for quick, at-a-glance decisions |
| 📱 **Mobile-First Design** | Feels like a native app on phones, a dashboard on desktop |
| 🔐 **User Accounts** | Secure JWT-based auth to save and revisit scan history |
| 🕓 **Scan History** | Every analysis is persisted so users can track past scans |

---

## 📱 App Walkthrough

<table>
  <tr>
    <td align="center"><b>Login</b></td>
    <td align="center"><b>Loading / Analyzing</b></td>
  </tr>
  <tr>
    <td><img src="https://raw.githubusercontent.com/Mahi-S83/know-your-food/main/frontend/screenshots/login.png" width="380"/></td>
    <td><img src="https://raw.githubusercontent.com/Mahi-S83/know-your-food/main/frontend/screenshots/loading.png" width="380"/></td>
  </tr>
  <tr>
    <td align="center"><b>Ingredient Analysis</b></td>
    <td align="center"><b>Scan History</b></td>
  </tr>
  <tr>
    <td><img src="https://raw.githubusercontent.com/Mahi-S83/know-your-food/main/frontend/screenshots/analysis.png" width="380"/></td>
    <td><img src="https://raw.githubusercontent.com/Mahi-S83/know-your-food/main/frontend/screenshots/history.png" width="380"/></td>
  </tr>
</table>

<p align="center">
  <img src="https://raw.githubusercontent.com/Mahi-S83/know-your-food/main/frontend/screenshots/result1.png" width="270"/>
  <img src="https://raw.githubusercontent.com/Mahi-S83/know-your-food/main/frontend/screenshots/result2.png" width="270"/>
  <img src="https://raw.githubusercontent.com/Mahi-S83/know-your-food/main/frontend/screenshots/result3.png" width="270"/>
</p>
<p align="center"><i>Sample scan results across different products</i></p>

---

## 🛠️ Tech Stack

**Frontend**
- React 18 + Vite (native ES modules for near-instant HMR)
- Tailwind CSS (mobile-first responsive design)
- Lucide React (icons)

**Backend**
- Python FastAPI (ASGI, async, Pydantic validation)
- Google Gemini 2.0 Flash API (multimodal ingredient analysis)
- PostgreSQL + SQLAlchemy ORM
- JWT (stateless authentication) + bcrypt (password hashing)

**Deployment / DevOps**
- Frontend: **Vercel** (Edge Network, CI/CD from `main`)
- Backend: **Render** (Web Service, CI/CD from `main`)
- Database: **Railway** (PostgreSQL)

---

## 🏗️ Architecture

```
[Client]                [API Gateway / Server]          [External Services]
Vercel Edge Network     Render Web Service

┌─────────────┐         ┌──────────────┐                ┌──────────────┐
│ React (Vite)│  REST   │ FastAPI      │    REST        │ Gemini 2.0   │
│ Frontend    │ ──────▶ │ Python App   │ ─────────────▶ │ Flash API    │
└─────────────┘         └──────────────┘                └──────────────┘
      │                        │
      │                        │ (SQLAlchemy ORM)
      │                        ▼
      │                 ┌──────────────┐
      └──────────────── │ PostgreSQL   │
        (Auth Tokens)   │ Database     │
                        └──────────────┘
```

### The "Scan" Journey

1. **Frontend** — User uploads an image; app state moves to `ANALYZING`. The image is packed into `FormData`, and the JWT (from `localStorage`) is attached via the `Authorization: Bearer` header.
2. **Network** — A `POST` request hits the FastAPI `/analyze` endpoint.
3. **Backend** — CORS + JWT are validated; the image bytes are streamed in.
4. **AI Integration** — FastAPI asynchronously sends the image + a strict JSON prompt to Gemini 2.0 Flash.
5. **Parsing** — The AI's response is parsed with `json.loads()` into a structured result.
6. **Persistence** — A new `ScanHistory` record is created and linked to the user via SQLAlchemy, then committed to PostgreSQL.
7. **Response** — The JSON result flows back to React, `appState` becomes `SUCCESS`, and `<IngredientList />` renders the color-coded breakdown.

### Data Model (ER Diagram)

```
[ Users Table ] 1 ------------- ∞ [ Scans Table ]
- id (PK)                         - id (PK)
- email (Unique)                  - user_id (FK -> Users.id)
- hashed_password                 - product_name
- created_at                      - health_score
                                   - raw_json_data
```

---

## 🧠 Key Engineering Decisions

- **FastAPI over Node.js/Express** — Python is the natural fit for AI workloads, and FastAPI's ASGI core keeps performance comparable to Node while adding native type-hint validation via Pydantic.
- **PostgreSQL over MongoDB** — The data is inherently relational (one user → many scans), so a SQL database enforces integrity through ACID compliance rather than risking orphaned records.
- **JWT over session-based auth** — Stateless verification means no database lookup is needed on every request; the server just validates the token signature.
- **Low temperature (0.1–0.2) for Gemini prompts** — Prioritizes deterministic, factual ingredient extraction over creative variance.
- **Strict JSON-only prompting** — LLMs default to conversational replies (e.g. "Here is your analysis..."), which breaks `JSON.parse()` on the frontend. The prompt explicitly forbids prose and markdown fences.

---

## 🚀 Live Demo

- **Frontend Application:** https://know-your-food-nine.vercel.app
- **API Documentation (Swagger UI):** https://know-your-food-4toj.onrender.com/docs

> ⚠️ **Note:** The backend runs on Render's free tier, which spins down after 15 minutes of inactivity. The first request after idling (e.g. logging in) may take up to ~50 seconds while the server cold-starts. The frontend handles this gracefully with a loading state.

---

## 📊 Key Metrics

| Metric | Value |
|---|---|
| ⚡ Analysis Time | < 3 seconds |
| 👥 Active Users | 30+ |
| 📦 Products Analyzed | 150+ |
| ⭐ User Satisfaction | 85% |

---

## 💻 Local Development

### Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL

### Setup

```bash
# Clone the repository
git clone https://github.com/Mahi-S83/know-your-food.git
cd know-your-food

# --- Backend setup ---
cd backend
python -m venv venv
source venv/bin/activate      # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Add the following to a .env file in /backend:
#   GEMINI_API_KEY=your_gemini_api_key
#   DATABASE_URL=your_postgresql_connection_string

uvicorn main:app --reload

# --- Frontend setup (in a new terminal) ---
cd frontend
npm install

# Add the following to a .env file in /frontend:
#   VITE_API_URL=http://127.0.0.1:8000

npm run dev
```

The frontend will be available at `http://localhost:5173` and the backend (with interactive Swagger docs) at `http://127.0.0.1:8000/docs`.

---

## 🔒 Security Measures

- **API Keys** — The Gemini API key lives only in Render's environment variables; the frontend never has access to it.
- **SQL Injection Protection** — Handled automatically by the SQLAlchemy ORM, which parameterizes every query.
- **Password Storage** — Passwords are hashed with `bcrypt`; plaintext passwords are never persisted.

---

## 📈 Future Enhancements

- [ ] Barcode scanning for direct product lookup
- [ ] Personalized health profiles (allergies, diabetes, etc.)
- [ ] Healthier alternative product recommendations
- [ ] Weekly/monthly health reports
- [ ] Social sharing of scan results

---

## 👤 Author

**Mahi Singh**

- GitHub: [@Mahi-S83](https://github.com/Mahi-S83)
- LinkedIn: [Mahi Singh](https://www.linkedin.com/in/mahi-singh-6a4622206/)
- Email: mahisinghh9597@gmail.com

---

## 📄 License

Distributed under the **MIT License** — feel free to use this project for learning!

---

<p align="center">⭐ If you found this project useful, please consider starring the repository!</p>
