import os
from dotenv import load_dotenv
from pydantic_settings import BaseSettings

load_dotenv()

class Settings(BaseSettings):
    supabase_url: str = os.getenv("SUPABASE_URL")
    supabase_public_api_key: str = os.getenv("SUPABASE_PUBLIC_API_KEY")
    supabase_secret_api_key: str = os.getenv("SUPABASE_SECRET_API_KEY")
    if not supabase_url or not supabase_public_api_key or not supabase_secret_api_key:
        raise ValueError("Missing Supabase environment variables")
    
    class Config:
        env_file = ".env"

settings = Settings()
