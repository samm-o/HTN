from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Project BASTION API", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "Project BASTION API", "status": "running"}

@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/api/v1/test")
def test():
    return {"test": "success", "message": "API is working"}

# Export the app for Vercel
handler = app
