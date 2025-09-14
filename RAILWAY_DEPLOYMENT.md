# Railway Deployment Guide for Project BASTION

Railway is perfect for FastAPI apps - it supports your full `main.py` directly without serverless complications.

## 🚂 Deploy Backend on Railway

### 1. Create Railway Account
- Go to [railway.app](https://railway.app)
- Sign up with GitHub account

### 2. Deploy Backend
1. **New Project** → **Deploy from GitHub repo**
2. Connect your GitHub account
3. Select your `HTN` repository
4. **Configure Service:**
   - **Root Directory:** `backend`
   - **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Health Check Path:** `/health`

### 3. Set Environment Variables
In Railway dashboard → **Variables** tab:
```
SUPABASE_URL=your_supabase_url
SUPABASE_SECRET_API_KEY=your_supabase_key
COHERE_API_KEY=your_cohere_key
STOREFRONT_URL=https://storefront-frontend-wine.vercel.app
BASTION_FRONTEND_URL=https://bastion-frontend-wine.vercel.app
```

### 4. Deploy
- Railway will automatically deploy
- Get your backend URL (e.g., `https://your-app.railway.app`)

## 🔄 Update Frontend Environment Variables

### Bastion Frontend
In Vercel dashboard → **bastion-frontend-wine** → **Settings** → **Environment Variables**:
```
VITE_API_BASE_URL=https://your-app.railway.app
```

### Storefront Frontend  
In Vercel dashboard → **storefront-frontend-wine** → **Settings** → **Environment Variables**:
```
VITE_BASTION_API_URL=https://your-app.railway.app
```

## ✅ Test Full System
1. Backend: `https://your-app.railway.app/health`
2. Analytics: `https://your-app.railway.app/api/v1/analytics/dashboard-metrics`
3. Frontend dashboards should load with real data

## 🎯 Benefits of Railway
- ✅ Full FastAPI support (no serverless limitations)
- ✅ All your Supabase/Cohere integrations work
- ✅ Real-time logs and monitoring
- ✅ Automatic deployments from GitHub
- ✅ Built-in PostgreSQL if needed
- ✅ No cold starts (always-on containers)

Railway handles the complexity that Vercel's serverless Python couldn't manage.
