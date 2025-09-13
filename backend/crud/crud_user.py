from typing import Optional, Dict, Any
from supabase import Client
from schemas.user import UserCreate, UserResponse
from core.database import get_supabase_client
import uuid
from datetime import datetime

class UserCRUD:
    def __init__(self):
        self.supabase: Client = get_supabase_client()
        self.table_name = "users"
    
    async def create_user(self, user: UserCreate) -> Dict[str, Any]:
        """Create a new user in Supabase"""
        try:
            # Generate UUID for the user
            user_id = str(uuid.uuid4())
            current_time = datetime.utcnow().isoformat()
            
            # Prepare user data for insertion
            user_data = {
                "id": user_id,
                "created_at": current_time,
                "full_name": user.full_name,
                "dob": user.dob,
                "address": user.address,
                "email": user.email,
                "phone_number": user.phone_number,
                "risk_level": "low"  # Default risk level
            }
            
            # Insert user into Supabase
            result = self.supabase.table(self.table_name).insert(user_data).execute()
            
            if result.data:
                return {
                    "success": True,
                    "data": result.data[0],
                    "message": "User created successfully"
                }
            else:
                return {
                    "success": False,
                    "data": None,
                    "message": "Failed to create user"
                }
                
        except Exception as e:
            return {
                "success": False,
                "data": None,
                "message": f"Error creating user: {str(e)}"
            }
    
    async def get_user_by_id(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get a user by ID"""
        try:
            result = self.supabase.table(self.table_name).select("*").eq("id", user_id).execute()
            
            if result.data:
                return {
                    "success": True,
                    "data": result.data[0],
                    "message": "User found"
                }
            else:
                return {
                    "success": False,
                    "data": None,
                    "message": "User not found"
                }
                
        except Exception as e:
            return {
                "success": False,
                "data": None,
                "message": f"Error fetching user: {str(e)}"
            }
    
    async def get_user_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        """Get a user by email"""
        try:
            result = self.supabase.table(self.table_name).select("*").eq("email", email).execute()
            
            if result.data:
                return {
                    "success": True,
                    "data": result.data[0],
                    "message": "User found"
                }
            else:
                return {
                    "success": False,
                    "data": None,
                    "message": "User not found"
                }
                
        except Exception as e:
            return {
                "success": False,
                "data": None,
                "message": f"Error fetching user: {str(e)}"
            }

# Create a global instance
user_crud = UserCRUD()
