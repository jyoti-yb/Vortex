# GigShield — Deployment Guide

Parametric insurance for India's gig workers. Zero-touch payouts triggered by live weather, AQI, and traffic data.

---

## Architecture

```
Frontend (Vercel)  →  Backend API (Render)  →  MongoDB Atlas
                            ↓
                    ML Service (Render/Docker)
                            ↓
              OpenWeatherMap + OpenAQ APIs (cron every 10 min)
```

---

## Step 1 — MongoDB Atlas

1. Go to [mongodb.com/atlas](https://mongodb.com/atlas) → create a free **M0** cluster
2. **Database Access** → Add user → copy username + password
3. **Network Access** → Add IP `0.0.0.0/0` (allow all, fine for demo)
4. **Connect** → Drivers → copy the connection string
5. Replace in `backend/.env`:
   ```
   MONGO_URI=mongodb+srv://<user>:<pass>@cluster0.xxxxx.mongodb.net/gigshield
   ```

---

## Step 2 — Deploy ML Service to Render

The `ml-service/Dockerfile` is already set up.

1. Push this repo to GitHub
2. [Render](https://render.com) → **New Web Service** → connect your GitHub repo
3. Settings:
   - **Root Directory**: `ml-service`
   - **Runtime**: Docker
   - **Port**: `8000`
4. Deploy → wait for build → copy the service URL (e.g. `https://gigshield-ml.onrender.com`)

**Verify:**
```bash
curl https://gigshield-ml.onrender.com/health
# → {"status":"ok","models":["DisruptionScorer","IncomePredictor","FraudDetector"]}
```

---

## Step 3 — Deploy Backend to Render

1. Render → **New Web Service** → same repo
2. Settings:
   - **Root Directory**: `backend`
   - **Runtime**: Node
   - **Build command**: `npm install`
   - **Start command**: `node src/index.js`
3. **Environment Variables** (add all):

   | Key | Value |
   |-----|-------|
   | `PORT` | `5000` |
   | `MONGO_URI` | your Atlas connection string |
   | `JWT_SECRET` | any long random string |
   | `OPENWEATHER_API_KEY` | from [openweathermap.org](https://openweathermap.org/api) (free) |
   | `OPENAQ_API_KEY` | from [openaq.org](https://openaq.org) (free) |
   | `ML_SERVICE_URL` | `https://gigshield-ml.onrender.com` |

4. Deploy → copy backend URL (e.g. `https://gigshield-backend.onrender.com`)

**Verify:**
```bash
curl https://gigshield-backend.onrender.com/health
# → {"status":"ok","time":"..."}
```

---

## Step 4 — Seed Demo Data

After backend is live, run locally (with your Atlas URI in `backend/.env`):

```bash
cd backend
npm run seed
# ✅ Seed complete.
#    Login: ravi@demo.com / demo123
#    Ravi has ₹550 in payouts (rain ₹340 + AQI ₹210)
#    Mumbai fraud claim flagged (fraudScore: 0.91)
```

---

## Step 5 — Deploy Frontend to Vercel

```bash
cd frontend
```

Update `frontend/.env`:
```
VITE_API_URL=https://gigshield-backend.onrender.com/api
```

**Option A — Vercel CLI:**
```bash
npm run build
npx vercel --prod
```

**Option B — Vercel Dashboard:**
1. [vercel.com](https://vercel.com) → Import Git repo → select `frontend/` as root
2. Add environment variable: `VITE_API_URL` = `https://gigshield-backend.onrender.com/api`
3. Deploy

---

## Step 6 — Verify Everything

```bash
# Backend health
curl https://gigshield-backend.onrender.com/health

# ML service health
curl https://gigshield-ml.onrender.com/health

# Test registration
curl -X POST https://gigshield-backend.onrender.com/api/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Ravi Kumar","phone":"9876543210","email":"ravi@test.com","password":"test123","city":"Hyderabad","platform":"Swiggy"}'

# Test login
curl -X POST https://gigshield-backend.onrender.com/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"ravi@demo.com","password":"demo123"}'
```

---

## Demo Script (2 minutes)

### [0:00] Intro
> "Meet Ravi — a Swiggy delivery rider in Hyderabad. He earns ₹800/day. Today it's raining heavily."

### [0:15] Registration
- Open app → Register as **Ravi / Swiggy / Hyderabad**
- Point out: *"System already assigned a risk score (55) based on city + platform — no manual underwriting."*

### [0:30] Subscribe to Standard Plan
- Select **Standard** → premium auto-calculated: **₹99/week**
- *"Covers rain, AQI, traffic. Up to ₹1,200 payout. No agent. No paperwork. Just subscribe."*

### [0:50] Live Conditions
- Dashboard loads → **Rain: 7.3mm**, **AQI: 240** → both triggered
- Disruption score bar fills to **78 (HIGH)**
- Alert banner: *"High disruption detected in Hyderabad"*

### [1:05] Zero-Touch Payout
- Scroll to **Recent Payouts**
- Two payouts already appeared: **₹340 (rain) + ₹210 (AQI) = ₹550**
- *"Ravi received ₹550 automatically. He never clicked anything."*

### [1:20] AI Components
- Disruption score breakdown: Rain 40% + AQI 35% + Traffic 25%
- *"Isolation Forest blocked a fraudulent claim in Mumbai — 8 claims in 3 days"*
- Show `fraudScore: 0.91` → `status: flagged`

### [1:40] Differentiation
- *"Unlike traditional insurance: no forms, no waiting, no agent."*
- *"Triggers fire every 10 minutes via cron. Multi-source validation."*
- *"AI prevents over-payouts. Parametric = speed."*

### [1:55] Close
> "This is GigShield — protecting India's 50M gig workers, automatically."

---

## Key Differentiators

| Feature | GigShield | Traditional Insurance |
|---------|-----------|----------------------|
| Claim process | Zero-touch, automatic | Forms + agent + waiting |
| Trigger source | Live weather + AQI + traffic APIs | Manual claim submission |
| Fraud detection | Isolation Forest ML model | Manual review |
| Premium pricing | Dynamic (city risk × profile score) | Flat rate |
| Payout speed | Seconds (cron every 10 min) | Days to weeks |
| Payout amount | Proportional to disruption severity | Binary (yes/no) |

---

## Local Development

```bash
# Terminal 1 — ML service
cd ml-service
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# Terminal 2 — Backend
cd backend
npm install
npm run dev        # nodemon, port 5000

# Terminal 3 — Frontend
cd frontend
npm install
npm run dev        # Vite, port 3000

# Seed demo data (after backend is running)
cd backend
npm run seed
```

---

## One-Click Render Deploy

The `render.yaml` at the repo root defines both services. In Render dashboard:
**New → Blueprint** → connect repo → Render reads `render.yaml` and creates both services automatically.
Set `MONGO_URI`, `OPENWEATHER_API_KEY`, `OPENAQ_API_KEY` manually after creation.
