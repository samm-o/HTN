from fastapi import FastAPI
from api.customer import router as customer_router
from api.user_api import router as user_router
from api.store_api import router as store_router
from api.claim_api import router as claim_router
from api.admin_api import router as admin_router

app = FastAPI(title="Project BASTION - B2B Fraud Detection API", version="1.0.0")

# Include routers
app.include_router(customer_router)
app.include_router(user_router)
app.include_router(store_router)
app.include_router(claim_router)
app.include_router(admin_router)

@app.get("/health")
def read_root():
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8080, reload=True, log_level="info")