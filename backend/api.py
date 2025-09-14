try:
    from main import app
except ImportError as e:
    print(f"Import error: {e}")
    # Create a minimal app for debugging
    from fastapi import FastAPI
    app = FastAPI()
    
    @app.get("/")
    def root():
        return {"error": "Import failed", "message": str(e)}
    
    @app.get("/health")
    def health():
        return {"status": "error", "message": "Import failed"}

# Export the app for Vercel
handler = app
