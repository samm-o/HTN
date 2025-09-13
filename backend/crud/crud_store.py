from typing import List, Optional, Dict, Any
from datetime import datetime
import uuid
from supabase import Client
from schemas import Store, StoreCreate, StoreResponse
from core.supabase_client import get_supabase

class StoreCRUD:
    def __init__(self):
        self.supabase: Client = get_supabase()
    
    # Store CRUD Operations
    async def get_store_by_id(self, store_id: uuid.UUID) -> Optional[Dict[str, Any]]:
        """Get store by ID"""
        try:
            response = self.supabase.table('stores').select('*').eq('id', str(store_id)).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            print(f"Error getting store: {e}")
            return None
    
    async def create_store(self, name: str) -> Dict[str, Any]:
        """Create a new store"""
        try:
            store_data = {
                'id': str(uuid.uuid4()),
                'name': name,
                'created_at': datetime.utcnow().isoformat()
            }
            
            response = self.supabase.table('stores').insert(store_data).execute()
            return response.data[0] if response.data else store_data
        except Exception as e:
            print(f"Error creating store: {e}")
            raise
    
    async def get_all_stores(self) -> List[StoreResponse]:
        """Get all stores"""
        try:
            response = self.supabase.table('stores').select('*').execute()
            
            return [
                StoreResponse(
                    id=uuid.UUID(store['id']),
                    name=store['name'],
                    created_at=datetime.fromisoformat(store['created_at'].replace('Z', '+00:00'))
                )
                for store in response.data
            ] if response.data else []
        except Exception as e:
            print(f"Error getting stores: {e}")
            return []
    
    async def update_store(self, store_id: uuid.UUID, name: str) -> bool:
        """Update store name"""
        try:
            update_data = {'name': name}
            response = self.supabase.table('stores').update(update_data).eq('id', str(store_id)).execute()
            return len(response.data) > 0
        except Exception as e:
            print(f"Error updating store: {e}")
            return False
    
    async def delete_store(self, store_id: uuid.UUID) -> bool:
        """Delete a store"""
        try:
            response = self.supabase.table('stores').delete().eq('id', str(store_id)).execute()
            return len(response.data) > 0
        except Exception as e:
            print(f"Error deleting store: {e}")
            return False
