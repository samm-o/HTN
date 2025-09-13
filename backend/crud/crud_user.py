from typing import Optional, Dict, Any
from supabase import Client
from schemas.user import UserCreate, UserResponse, UserLogin, UserRegister
from core.database import get_supabase_client
from core.security import get_password_hash, verify_password
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
            
            # Hash the password
            hashed_password = get_password_hash(user.password)
            
            # Prepare user data for insertion
            user_data = {
                "id": user_id,
                "created_at": current_time,
                "full_name": user.full_name,
                "dob": user.dob,
                "email": user.email,
                "password_hash": hashed_password
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
    
    async def authenticate_user(self, email: str, password: str) -> Dict[str, Any]:
        """Authenticate user with email and password"""
        try:
            # Get user by email
            result = self.supabase.table(self.table_name).select("*").eq("email", email).execute()
            
            if not result.data:
                return {
                    "success": False,
                    "data": None,
                    "message": "Invalid email or password"
                }
            
            user = result.data[0]
            
            # Verify password
            if not verify_password(password, user["password_hash"]):
                return {
                    "success": False,
                    "data": None,
                    "message": "Invalid email or password"
                }
            
            # Remove password_hash from response
            user_data = {k: v for k, v in user.items() if k != "password_hash"}
            
            return {
                "success": True,
                "data": user_data,
                "message": "Authentication successful"
            }
            
        except Exception as e:
            return {
                "success": False,
                "data": None,
                "message": f"Error authenticating user: {str(e)}"
            }

# Create a global instance
user_crud = UserCRUD()
