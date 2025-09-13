from typing import List, Optional, Dict, Any
from datetime import datetime
import uuid
from supabase import Client
from schemas import Claim, ClaimCreate, ClaimStatus, ItemData
from core.supabase_client import get_supabase

class ClaimCRUD:
    def __init__(self):
        self.supabase: Client = get_supabase()
    
    # Claim CRUD Operations
    async def create_claim(self, user_id: uuid.UUID, store_id: uuid.UUID, 
                          email_at_store: str, claim_data: List[ItemData]) -> Dict[str, Any]:
        """Create a new claim"""
        try:
            claim_id = uuid.uuid4()
            
            # Convert ItemData objects to dictionaries
            claim_data_dict = [
                {
                    'item_name': item.item_name,
                    'category': item.category,
                    'price': item.price,
                    'quantity': item.quantity,
                    'url': item.url
                }
                for item in claim_data
            ]
            
            claim_record = {
                'id': str(claim_id),
                'user_id': str(user_id),
                'store_id': str(store_id),
                'email_at_store': email_at_store,
                'status': ClaimStatus.PENDING.value,
                'claim_data': claim_data_dict,
                'created_at': datetime.utcnow().isoformat()
            }
            
            response = self.supabase.table('claims').insert(claim_record).execute()
            return response.data[0] if response.data else claim_record
        except Exception as e:
            print(f"Error creating claim: {e}")
            raise
    
    async def update_claim_status(self, claim_id: uuid.UUID, status: ClaimStatus) -> bool:
        """Update claim status"""
        try:
            update_data = {'status': status.value}
            response = self.supabase.table('claims').update(update_data).eq('id', str(claim_id)).execute()
            return len(response.data) > 0
        except Exception as e:
            print(f"Error updating claim status: {e}")
            return False
    
    async def get_claim_by_id(self, claim_id: uuid.UUID) -> Optional[Dict[str, Any]]:
        """Get claim by ID"""
        try:
            response = self.supabase.table('claims').select('*').eq('id', str(claim_id)).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            print(f"Error getting claim: {e}")
            return None
    
    async def get_claims_by_user(self, user_id: uuid.UUID, limit: int = 50) -> List[Dict[str, Any]]:
        """Get claims by user ID"""
        try:
            response = (self.supabase.table('claims')
                       .select('*')
                       .eq('user_id', str(user_id))
                       .order('created_at', desc=True)
                       .limit(limit)
                       .execute())
            
            return response.data if response.data else []
        except Exception as e:
            print(f"Error getting user claims: {e}")
            return []
    
    async def get_claims_by_store(self, store_id: uuid.UUID, limit: int = 50) -> List[Dict[str, Any]]:
        """Get claims by store ID"""
        try:
            response = (self.supabase.table('claims')
                       .select('*')
                       .eq('store_id', str(store_id))
                       .order('created_at', desc=True)
                       .limit(limit)
                       .execute())
            
            return response.data if response.data else []
        except Exception as e:
            print(f"Error getting store claims: {e}")
            return []
    
    async def get_claims_by_status(self, status: ClaimStatus, limit: int = 100) -> List[Dict[str, Any]]:
        """Get claims by status"""
        try:
            response = (self.supabase.table('claims')
                       .select('*')
                       .eq('status', status.value)
                       .order('created_at', desc=True)
                       .limit(limit)
                       .execute())
            
            return response.data if response.data else []
        except Exception as e:
            print(f"Error getting claims by status: {e}")
            return []
    
    async def get_flagged_claims(self, limit: int = 100) -> List[Dict[str, Any]]:
        """Get claims from flagged users"""
        try:
            # First get flagged users
            flagged_users_response = self.supabase.table('users').select('id').eq('is_flagged', True).execute()
            
            if not flagged_users_response.data:
                return []
            
            flagged_user_ids = [user['id'] for user in flagged_users_response.data]
            
            # Get claims from flagged users
            claims = []
            for user_id in flagged_user_ids:
                user_claims = await self.get_claims_by_user(uuid.UUID(user_id), limit // len(flagged_user_ids) + 1)
                claims.extend(user_claims)
            
            # Sort by created_at and limit
            claims.sort(key=lambda x: x['created_at'], reverse=True)
            return claims[:limit]
            
        except Exception as e:
            print(f"Error getting flagged claims: {e}")
            return []
    
    async def get_recent_claims(self, limit: int = 50) -> List[Dict[str, Any]]:
        """Get recent claims across all users and stores"""
        try:
            response = (self.supabase.table('claims')
                       .select('*')
                       .order('created_at', desc=True)
                       .limit(limit)
                       .execute())
            
            return response.data if response.data else []
        except Exception as e:
            print(f"Error getting recent claims: {e}")
            return []
