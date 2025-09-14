# 🚀 Project BASTION - Easy Vercel Web Deployment

Deploy your complete fraud detection system using Vercel's web interface - no command line needed!

## 📋 Quick Checklist

- [ ] GitHub repository with your code
- [ ] Vercel account ([sign up here](https://vercel.com/signup))
- [ ] Supabase project URL and API key
- [ ] Cohere API key

## 🎯 Deployment Order (Important!)

Deploy in this exact order to avoid CORS issues:

1. **Backend** (API) - Deploy first to get the URL
2. **Bastion Frontend** (Admin Dashboard) 
3. **Storefront Frontend** (E-commerce)
4. **Update Backend** with frontend URLs

---

## 🔧 Step 1: Deploy Backend (API)

### In Vercel Dashboard:
1. Go to [vercel.com](https://vercel.com) → **"New Project"**
2. Import your GitHub repository
3. **Configure Project:**

```
Framework Preset: Other
Root Directory: backend
Build Command: (leave empty)
Output Directory: (leave empty) 
Install Command: pip install -r requirements.txt
```

4. **Environment Variables** (click "Environment Variables" before deploying):

```
SUPABASE_URL = https://your-project-id.supabase.co
SUPABASE_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
COHERE_API_KEY = your-cohere-api-key-here
VERCEL_ENV = production
```

5. Click **"Deploy"**
6. **📝 Save this URL:** `https://your-backend-name.vercel.app`

---

## 🖥️ Step 2: Deploy Bastion Frontend (Admin)

### In Vercel Dashboard:
1. **"New Project"** → Import same GitHub repo
2. **Configure Project:**

```
Framework Preset: Vite
Root Directory: bastion-frontend
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

3. **Environment Variables:**

```
VITE_API_BASE_URL = https://your-backend-name.vercel.app
```
*(Use the backend URL from Step 1)*

4. Click **"Deploy"**
5. **📝 Save this URL:** `https://your-bastion-frontend.vercel.app`

---

## 🛒 Step 3: Deploy Storefront Frontend

### In Vercel Dashboard:
1. **"New Project"** → Import same GitHub repo
2. **Configure Project:**

```
Framework Preset: Vite
Root Directory: storefront-frontend
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

3. **Environment Variables:**

```
VITE_BASTION_API_URL = https://your-backend-name.vercel.app
```
*(Use the backend URL from Step 1)*

4. Click **"Deploy"**
5. **📝 Save this URL:** `https://your-storefront-frontend.vercel.app`

---

## 🔄 Step 4: Update Backend CORS

### Go back to Backend project:
1. **Settings** → **Environment Variables**
2. **Add these new variables:**

```
STOREFRONT_URL = https://your-storefront-frontend.vercel.app
BASTION_FRONTEND_URL = https://your-bastion-frontend.vercel.app
```

3. **Deployments** tab → **"Redeploy"** latest deployment

---

## ✅ Testing Your Deployment

### Quick Tests:
1. **Backend Health:** Visit `https://your-backend.vercel.app/health`
   - Should return: `{"status": "ok"}`

2. **Admin Dashboard:** Visit your Bastion frontend URL
   - Should load the admin interface

3. **Storefront:** Visit your storefront URL
   - Should load the e-commerce interface

### Full End-to-End Test:
1. Go to storefront → Create test order
2. Click "I did not receive product"
3. Fill out KYC form
4. Submit fraud claim
5. Check results in admin dashboard

---

## 🎨 Visual Configuration Guide

### Backend Setup Screen:
```
┌─────────────────────────────────────────┐
│ 📁 Root Directory: backend              │
│ ⚙️  Framework: Other                     │
│ 🔨 Build: (empty)                       │
│ 📤 Output: (empty)                      │
│ 📦 Install: pip install -r requirements │
└─────────────────────────────────────────┘
```

### Frontend Setup Screen:
```
┌─────────────────────────────────────────┐
│ 📁 Root Directory: bastion-frontend     │
│ ⚙️  Framework: Vite                      │
│ 🔨 Build: npm run build                 │
│ 📤 Output: dist                         │
│ 📦 Install: npm install                 │
└─────────────────────────────────────────┘
```

---

## 🚨 Common Issues & Solutions

### ❌ "Build failed" Error:
- Check that Root Directory is set correctly
- Verify environment variables are added before deployment

### ❌ CORS Error:
- Make sure you updated backend with frontend URLs in Step 4
- Redeploy backend after adding STOREFRONT_URL and BASTION_FRONTEND_URL

### ❌ API Connection Failed:
- Double-check environment variable names (VITE_ prefix for frontends)
- Ensure backend URL doesn't have trailing slash

### ❌ Database Connection Error:
- Verify Supabase URL and key are correct
- Check Supabase project is active and accessible

---

## 🎉 Success! Your URLs:

After deployment, you'll have:
- **API:** `https://your-backend.vercel.app`
- **Admin Dashboard:** `https://your-bastion-frontend.vercel.app`  
- **E-commerce Store:** `https://your-storefront.vercel.app`

## 🔗 Custom Domains (Optional)

In each project's settings → Domains:
- `api.yourdomain.com` → Backend
- `admin.yourdomain.com` → Bastion Frontend  
- `store.yourdomain.com` → Storefront

---

**🎯 Pro Tip:** Bookmark your three Vercel project dashboards for easy access to logs and redeployments!
