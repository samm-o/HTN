from pydantic import BaseModel, EmailStr, Field
from datetime import datetime, date
import uuid

class CustomerCreate(BaseModel):
    full_name: str
    dob: date
    dob: date
    email: EmailStr  # Pydantic will validate this is a proper email format
    id_url: str

class CustomerResponse(BaseModel):
    id: uuid.UUID
    created_at: datetime
    full_name: str
    dob: date
    email: EmailStr
    risk_score: int = Field(default=0, ge=0, le=100)
    is_flagged: bool = Field(default=False)

class CustomerCreateResponse(BaseModel):
    message: str
    customer: CustomerResponse

class CustomerGetResponse(BaseModel):
    message: str
    customer: CustomerResponse

# Authentication schemas
class CustomerLogin(BaseModel):
    email: EmailStr
    password: str

class CustomerRegister(BaseModel):
    full_name: str
    dob: str
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class LoginResponse(BaseModel):
    message: str
    token: Token
    customer: CustomerResponse
