import os
from supabase import create_client, Client
from typing import Optional
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class SupabaseClient:
    _instance: Optional['SupabaseClient'] = None
    _client: Optional[Client] = None
    
    def __new__(cls) -> 'SupabaseClient':
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    
    def __init__(self):
        if self._client is None:
            self._initialize_client()
    
    def _initialize_client(self):
        """Initialize Supabase client with environment variables"""
        supabase_url = os.getenv("SUPABASE_URL")
        supabase_key = os.getenv("SUPABASE_ANON_KEY") or os.getenv("SUPABASE_PUBLIC_API_KEY") or os.getenv("SUPABASE_SECRET_API_KEY")
        
        # Debug logging
        print(f"DEBUG: SUPABASE_URL = '{supabase_url}'")
        print(f"DEBUG: SUPABASE_KEY = '{supabase_key}'")
        
        if not supabase_url or not supabase_key:
            raise ValueError(
                "SUPABASE_URL and SUPABASE_ANON_KEY must be set in environment variables"
            )
        
        # Clean the URL - remove quotes and trailing slashes
        supabase_url = supabase_url.strip().strip('"').strip("'").rstrip('/')
        print(f"DEBUG: Cleaned URL = '{supabase_url}'")
        
        self._client = create_client(supabase_url, supabase_key)
    
    @property
    def client(self) -> Client:
        """Get the Supabase client instance"""
        if self._client is None:
            self._initialize_client()
        return self._client
    
    def get_client(self) -> Client:
        """Get the Supabase client instance (alternative method)"""
        return self.client

# Global instance
supabase_client = SupabaseClient()

def get_supabase() -> Client:
    """Dependency function to get Supabase client for FastAPI"""
    return supabase_client.get_client()
