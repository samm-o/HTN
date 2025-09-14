from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from mangum import Mangum

app = FastAPI(title="Project BASTION API", version="1.0.0")

# Add CORS
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

# Wrap with Mangum for serverless
handler = Mangum(app)
