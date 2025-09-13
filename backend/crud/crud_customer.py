from typing import Optional, Dict, Any
from supabase import Client
from schemas.customer import CustomerCreate, CustomerResponse, CustomerLogin, CustomerRegister
from core.database import get_supabase_client
from core.security import get_password_hash, verify_password
import uuid
from datetime import datetime

class CustomerCRUD:
    def __init__(self):
        self.supabase: Client = get_supabase_client()
        self.table_name = "customers"
    
    async def create_customer(self, customer: CustomerCreate) -> Dict[str, Any]:
        """Create a new customer in Supabase"""
        try:
            # Generate UUID for the customer
            customer_id = str(uuid.uuid4())
            current_time = datetime.utcnow().isoformat()
            
            # Hash the password
            hashed_password = get_password_hash(customer.password)
            
            # Prepare customer data for insertion
            customer_data = {
                "id": customer_id,
                "created_at": current_time,
                "full_name": customer.full_name,
                "dob": customer.dob,
                "email": customer.email,
                "password_hash": hashed_password
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
    
    async def authenticate_customer(self, email: str, password: str) -> Dict[str, Any]:
        """Authenticate customer with email and password"""
        try:
            # Get customer by email
            result = self.supabase.table(self.table_name).select("*").eq("email", email).execute()
            
            if not result.data:
                return {
                    "success": False,
                    "data": None,
                    "message": "Invalid email or password"
                }
            
            customer = result.data[0]
            
            # Verify password
            if not verify_password(password, customer["password_hash"]):
                return {
                    "success": False,
                    "data": None,
                    "message": "Invalid email or password"
                }
            
            # Remove password_hash from response
            customer_data = {k: v for k, v in customer.items() if k != "password_hash"}
            
            return {
                "success": True,
                "data": customer_data,
                "message": "Authentication successful"
            }
            
        except Exception as e:
            return {
                "success": False,
                "data": None,
                "message": f"Error authenticating customer: {str(e)}"
            }

# Create a global instance
customer_crud = CustomerCRUD()
