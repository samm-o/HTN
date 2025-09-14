# Project BASTION - Vercel Web Deployment Guide

This guide covers deploying the complete Project BASTION fraud detection system to Vercel using the web interface.

## Architecture Overview

- **Backend**: FastAPI application deployed as Vercel serverless functions
- **Bastion Frontend**: React/Vite admin dashboard for fraud monitoring
- **Storefront Frontend**: React/Vite e-commerce interface with fraud detection integration

## Prerequisites

1. [Vercel account](https://vercel.com/signup)
2. GitHub repository with your Project BASTION code
3. Supabase project with database setup
4. Cohere API key for ML fraud detection

## Web Deployment Steps

### Step 1: Push Code to GitHub

First, ensure your code is in a GitHub repository:

```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

### Step 2: Deploy Backend (API) via Vercel Web

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"New Project"**
3. Import your GitHub repository
4. **Configure the Backend:**
   - **Framework Preset**: Other
   - **Root Directory**: `backend`
   - **Build Command**: Leave empty (uses vercel.json)
   - **Output Directory**: Leave empty
   - **Install Command**: `pip install -r requirements.txt`

5. **Add Environment Variables** (click "Environment Variables"):
   ```
   SUPABASE_URL = your_supabase_project_url
   SUPABASE_KEY = your_supabase_anon_key
   COHERE_API_KEY = your_cohere_api_key
   VERCEL_ENV = production
   ```
   
6. Click **"Deploy"**
7. **Note the deployed URL** (e.g., `https://bastion-backend-xyz.vercel.app`)

### Step 3: Deploy Bastion Frontend (Admin Dashboard)

1. In Vercel dashboard, click **"New Project"** again
2. Import the same GitHub repository
3. **Configure the Frontend:**
   - **Framework Preset**: Vite
   - **Root Directory**: `bastion-frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

4. **Add Environment Variables:**
   ```
   VITE_API_BASE_URL = https://your-backend-url.vercel.app
   ```
   (Use the backend URL from Step 2)

5. Click **"Deploy"**
6. **Note the deployed URL** (e.g., `https://bastion-frontend-xyz.vercel.app`)

### Step 4: Deploy Storefront Frontend

1. In Vercel dashboard, click **"New Project"** again
2. Import the same GitHub repository
3. **Configure the Storefront:**
   - **Framework Preset**: Vite
   - **Root Directory**: `storefront-frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

4. **Add Environment Variables:**
   ```
   VITE_BASTION_API_URL = https://your-backend-url.vercel.app
   ```
   (Use the backend URL from Step 2)

5. Click **"Deploy"**
6. **Note the deployed URL** (e.g., `https://storefront-frontend-xyz.vercel.app`)

### Step 5: Update Backend CORS Settings

1. Go back to your **Backend project** in Vercel
2. Click **"Settings"** → **"Environment Variables"**
3. **Add/Update these variables:**
   ```
   STOREFRONT_URL = https://your-storefront-url.vercel.app
   BASTION_FRONTEND_URL = https://your-bastion-frontend-url.vercel.app
   ```
   (Use the URLs from Steps 3 and 4)

4. Go to **"Deployments"** tab and click **"Redeploy"** on the latest deployment

### Step 6: Custom Domain Names (Optional)

For each project, you can add custom domains:

1. In each project's settings, go to **"Domains"**
2. Add your custom domain (e.g., `api.bastion.com`, `admin.bastion.com`, `store.bastion.com`)
3. Update environment variables to use custom domains instead of Vercel URLs

## Visual Deployment Guide

### Backend Configuration Screenshot Guide:
```
┌─────────────────────────────────────────┐
│ Import Git Repository                   │
├─────────────────────────────────────────┤
│ Framework Preset: [Other ▼]            │
│ Root Directory: backend                 │
│ Build Command: (leave empty)           │
│ Output Directory: (leave empty)        │
│ Install Command: pip install -r req... │
└─────────────────────────────────────────┘
```

### Frontend Configuration Screenshot Guide:
```
┌─────────────────────────────────────────┐
│ Import Git Repository                   │
├─────────────────────────────────────────┤
│ Framework Preset: [Vite ▼]             │
│ Root Directory: bastion-frontend        │
│ Build Command: npm run build           │
│ Output Directory: dist                  │
│ Install Command: npm install           │
└─────────────────────────────────────────┘
```

## Environment Variables Setup

### Backend Environment Variables:
```
Key: SUPABASE_URL
Value: https://your-project.supabase.co

Key: SUPABASE_KEY  
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

Key: COHERE_API_KEY
Value: your-cohere-api-key

Key: VERCEL_ENV
Value: production

Key: STOREFRONT_URL
Value: https://storefront-frontend-xyz.vercel.app

Key: BASTION_FRONTEND_URL
Value: https://bastion-frontend-xyz.vercel.app
```

### Frontend Environment Variables:
```
For Bastion Frontend:
Key: VITE_API_BASE_URL
Value: https://bastion-backend-xyz.vercel.app

For Storefront Frontend:
Key: VITE_BASTION_API_URL
Value: https://bastion-backend-xyz.vercel.app
```

## Testing Your Deployment

1. **Backend Health Check**: Visit `https://your-backend.vercel.app/health`
2. **Bastion Frontend**: Visit your admin dashboard URL
3. **Storefront**: Visit your e-commerce frontend URL
4. **End-to-End Test**: 
   - Create a test order in storefront
   - Submit a fraud claim
   - Check results in admin dashboard

## Configuration Files

Each component includes a `vercel.json` configuration file optimized for deployment:

- **Backend**: Configured for Python serverless functions
- **Frontends**: Configured for Vite builds with SPA routing

## API Endpoints

Once deployed, the backend will provide these key endpoints:

- `POST /api/v1/claims/submit` - Main fraud detection
- `POST /api/v1/ml-fraud/analyze` - ML fraud analysis
- `GET /api/v1/admin/flagged-claims` - Admin monitoring
- `GET /health` - Health check

## CORS Configuration

The backend is configured to allow requests from:
- Your deployed frontend URLs
- Localhost for development

## Database Setup

Ensure your Supabase database includes the required tables:
- `users` - Customer KYC data
- `stores` - Merchant information  
- `claims` - Fraud detection claims
- `items` - Claimed items data

## Testing Deployment

1. Visit your deployed storefront
2. Create a test order and initiate a claim
3. Complete KYC verification
4. Check fraud detection results
5. Monitor in the admin dashboard

## Environment Variables Summary

### Backend
```
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
COHERE_API_KEY=your_cohere_key
STOREFRONT_URL=https://storefront.vercel.app
BASTION_FRONTEND_URL=https://bastion.vercel.app
VERCEL_ENV=production
```

### Bastion Frontend
```
VITE_API_BASE_URL=https://backend.vercel.app
```

### Storefront Frontend
```
VITE_BASTION_API_URL=https://backend.vercel.app
```

## Troubleshooting

1. **CORS Issues**: Verify frontend URLs are added to backend CORS origins
2. **API Connection**: Check environment variables match deployed URLs
3. **Database Connection**: Ensure Supabase credentials are correct
4. **ML Service**: Verify Cohere API key is valid

## Production Considerations

- Monitor API usage and costs
- Set up proper logging and error tracking
- Configure rate limiting if needed
- Implement proper authentication for admin endpoints
- Set up monitoring and alerts for fraud detection accuracy
