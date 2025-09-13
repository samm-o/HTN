from supabase import create_client, Client
from .config import settings

def get_supabase_client() -> Client:
    """Create and return a Supabase client instance"""
    return create_client(settings.supabase_url, settings.supabase_key)
