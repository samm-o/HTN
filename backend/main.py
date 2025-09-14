from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from routes.customer import router as customer_router
from routes.user_api import router as user_router
from routes.store_api import router as store_router
from routes.claim_api import router as claim_router
from routes.ml_fraud_api import router as ml_fraud_router
from routes.admin_api import router as admin_router
from routes.analytics_api import router as analytics_router
from routes.users_api import router as users_router
from services.risk_score_cache import risk_score_cache
import asyncio
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Project BASTION - B2B Fraud Detection API", version="1.0.0")
storefront_url = os.getenv("STOREFRONT_URL")
bastion_frontend_url = os.getenv("BASTION_FRONTEND_URL")

@app.on_event("startup")
async def startup_event():
    """Initialize risk score cache on startup"""
    try:
        asyncio.create_task(risk_score_cache.initialize_cache())
    except Exception as e:
        print(f"Warning: Could not initialize cache: {e}")

# Add explicit CORS headers for all responses
@app.middleware("http")
async def add_cors_header(request, call_next):
    response = await call_next(request)
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    return response

# Add CORS middleware for frontend connection
origins = [
    "https://bastion-frontend-wine.vercel.app",
    "https://storefront-frontend-wine.vercel.app", 
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:5173",
    "http://localhost:5174"
]

# Allow all origins in development
if os.getenv("RAILWAY_ENVIRONMENT") != "production":
    origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(customer_router)
app.include_router(user_router)
app.include_router(store_router)
app.include_router(claim_router)
app.include_router(ml_fraud_router)
app.include_router(admin_router)
app.include_router(analytics_router)
app.include_router(users_router)

@app.get("/health")
def read_root():
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True, log_level="info")