from fastapi import FastAPI
from api.customer import router as customer_router

# Include routers
app.include_router(customer_router)

@app.get("/health")
def read_root():
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8080, reload=True, log_level="info")