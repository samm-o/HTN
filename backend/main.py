from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.customer import router as customer_router
from api.user_api import router as user_router
from api.store_api import router as store_router
from api.claim_api import router as claim_router
from api.ml_fraud_api import router as ml_fraud_router
from api.admin_api import router as admin_router
from api.analytics_api import router as analytics_router
from api.users_api import router as users_router
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
    asyncio.create_task(risk_score_cache.initialize_cache())

# Add CORS middleware for frontend connection
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:8080", "http://localhost:8081", "http://localhost:8082", storefront_url, bastion_frontend_url],
    allow_credentials=True,
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