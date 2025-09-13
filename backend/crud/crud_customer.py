from typing import Optional, Dict, Any
from supabase import Client
from schemas import CustomerCreate, CustomerResponse, UserResponse
from core.supabase_client import get_supabase
import uuid
from datetime import datetime

class CustomerCRUD:
    def __init__(self):
        self.supabase: Client = get_supabase()
        self.table_name = "users"  # Using users table for KYC-verified identities
    
    # User CRUD Operations (moved from crud_bastion.py)
    async def get_user_by_kyc_id(self, kyc_id: uuid.UUID) -> Optional[Dict[str, Any]]:
        """Get user by KYC ID"""
        try:
            response = self.supabase.table('users').select('*').eq('id', str(kyc_id)).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            print(f"Error getting user: {e}")
            return None
    
    async def create_user(self, kyc_id: uuid.UUID, full_name: str, dob: str) -> Dict[str, Any]:
        """Create a new user with KYC ID"""
        try:
            user_data = {
                'id': str(kyc_id),
                'full_name': full_name,
                'dob': dob,
                'risk_score': 0,
                'is_flagged': False,
                'created_at': datetime.utcnow().isoformat()
            }
            
            response = self.supabase.table('users').insert(user_data).execute()
            return response.data[0] if response.data else user_data
        except Exception as e:
            print(f"Error creating user: {e}")
            raise
    
    async def update_user_risk_score(self, user_id: uuid.UUID, risk_score: int, is_flagged: bool) -> bool:
        """Update user's risk score and flagged status"""
        try:
            update_data = {
                'risk_score': risk_score,
                'is_flagged': is_flagged
            }
            
            response = self.supabase.table('users').update(update_data).eq('id', str(user_id)).execute()
            return len(response.data) > 0
        except Exception as e:
            print(f"Error updating user risk score: {e}")
            return False
    
    async def get_user_stats(self, user_id: uuid.UUID) -> UserResponse:
        """Get user statistics including total claims"""
        try:
            # Get user data
            user_response = self.supabase.table('users').select('*').eq('id', str(user_id)).execute()
            if not user_response.data:
                raise ValueError("User not found")
            
            user_data = user_response.data[0]
            
            # Get total claims count
            claims_response = self.supabase.table('claims').select('id').eq('user_id', str(user_id)).execute()
            total_claims = len(claims_response.data) if claims_response.data else 0
            
            return UserResponse(
                id=uuid.UUID(user_data['id']),
                full_name=user_data['full_name'],
                risk_score=user_data['risk_score'],
                is_flagged=user_data['is_flagged'],
                total_claims=total_claims
            )
        except Exception as e:
            print(f"Error getting user stats: {e}")
            raise

    async def create_customer(self, customer: CustomerCreate) -> Dict[str, Any]:
        """Create a new customer in Supabase"""
        try:
            # Generate UUID for the customer
            customer_id = str(uuid.uuid4())
            current_time = datetime.utcnow().isoformat()
            
            # Prepare customer data for insertion
            customer_data = {
                "id": customer_id,
                "created_at": current_time,
                "full_name": customer.full_name,
                "dob": customer.dob.isoformat(),
                "email": customer.email,
                "risk_score": 0,
                "is_flagged": False
            }
            
            # Insert customer into Supabase
            result = self.supabase.table(self.table_name).insert(customer_data).execute()
            
            if result.data:
                return {
                    "success": True,
                    "data": result.data[0],
                    "message": "Customer created successfully"
                }
            else:
                return {
                    "success": False,
                    "data": None,
                    "message": "Failed to create customer"
                }
                
        except Exception as e:
            return {
                "success": False,
                "data": None,
                "message": f"Error creating customer: {str(e)}"
            }
    
    async def get_customer_by_id(self, customer_id: str) -> Optional[Dict[str, Any]]:
        """Get a customer by ID"""
        try:
            result = self.supabase.table(self.table_name).select("*").eq("id", customer_id).execute()
            
            if result.data:
                return {
                    "success": True,
                    "data": result.data[0],
                    "message": "Customer found"
                }
            else:
                return {
                    "success": False,
                    "data": None,
                    "message": "Customer not found"
                }
                
        except Exception as e:
            return {
                "success": False,
                "data": None,
                "message": f"Error fetching customer: {str(e)}"
            }
    
    async def get_customer_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        """Get a customer by email"""
        try:
            result = self.supabase.table(self.table_name).select("*").eq("email", email).execute()
            
            if result.data:
                return {
                    "success": True,
                    "data": result.data[0],
                    "message": "Customer found"
                }
            else:
                return {
                    "success": False,
                    "data": None,
                    "message": "Customer not found"
                }
                
        except Exception as e:
            return {
                "success": False,
                "data": None,
                "message": f"Error fetching customer: {str(e)}"
            }
    

# Create a global instance
customer_crud = CustomerCRUD()
